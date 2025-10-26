import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExperienceService, Experience } from '../../../services/experience.service';
import { AvailabilityService, Availability } from '../../../services/availability.service';

@Component({
  selector: 'app-availability-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './availability-manager.html',
  styleUrls: ['./availability-manager.scss']
})
export class AvailabilityManager implements OnInit {
  private fb = inject(FormBuilder);
  private experienceService = inject(ExperienceService);
  private availabilityService = inject(AvailabilityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalService = inject(NgbModal);

  // Component state
  experience = signal<Experience | null>(null);
  experienceId = signal<number | null>(null);
  availabilities = signal<Availability[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  // Form for add/edit slot modal
  slotForm!: FormGroup;
  isEditMode = signal(false);
  currentSlotId = signal<number | null>(null);

  ngOnInit() {
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.experienceId.set(+params['id']);
        this.loadExperience(+params['id']);
        this.loadAvailability(+params['id']);
      }
    });
  }

  initForm() {
    this.slotForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      availableSlots: ['', [Validators.required, Validators.min(1)]]
    });
  }

  loadExperience(id: number) {
    this.isLoading.set(true);
    this.experienceService.getExperience(id).subscribe({
      next: (experience) => {
        this.experience.set(experience);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load experience');
        this.isLoading.set(false);
      }
    });
  }

  loadAvailability(experienceId: number) {
    this.availabilityService.getAvailability(experienceId).subscribe({
      next: (availabilities) => {
        this.availabilities.set(availabilities);
      },
      error: (error) => {
        console.error('Failed to load availability:', error);
      }
    });
  }

  openAddSlotModal(content: any) {
    this.isEditMode.set(false);
    this.currentSlotId.set(null);
    this.slotForm.reset({
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      availableSlots: this.experience()?.capacity || 10
    });
    this.modalService.open(content, { size: 'lg' });
  }

  openEditSlotModal(content: any, availability: Availability) {
    this.isEditMode.set(true);
    this.currentSlotId.set(availability.id!);
    
    this.slotForm.patchValue({
      date: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      availableSlots: availability.availableSlots
    });
    
    this.modalService.open(content, { size: 'lg' });
  }

  onSubmitSlot() {
    if (this.slotForm.invalid) {
      Object.keys(this.slotForm.controls).forEach(key => {
        this.slotForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = this.slotForm.value;
    const experienceId = this.experienceId();

    if (!experienceId) return;

    if (this.isEditMode() && this.currentSlotId()) {
      // Update existing slot
      this.availabilityService.updateAvailability(this.currentSlotId()!, formData).subscribe({
        next: () => {
          this.loadAvailability(experienceId);
          this.modalService.dismissAll();
        },
        error: (error) => {
          alert('Failed to update slot: ' + (error.error?.error || 'Unknown error'));
        }
      });
    } else {
      // Create new slot
      this.availabilityService.createAvailability(experienceId, formData).subscribe({
        next: () => {
          this.loadAvailability(experienceId);
          this.modalService.dismissAll();
        },
        error: (error) => {
          alert('Failed to create slot: ' + (error.error?.error || 'Unknown error'));
        }
      });
    }
  }

  deleteSlot(slotId: number) {
    if (!confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    this.availabilityService.deleteAvailability(slotId).subscribe({
      next: () => {
        const experienceId = this.experienceId();
        if (experienceId) {
          this.loadAvailability(experienceId);
        }
        this.modalService.dismissAll();
      },
      error: (error) => {
        alert('Failed to delete slot: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.slotForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.slotForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `Minimum value is ${min}`;
    }
    return '';
  }
}
