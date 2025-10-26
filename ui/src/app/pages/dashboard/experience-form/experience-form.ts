import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ExperienceService } from '../../../services/experience.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-experience-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './experience-form.html',
  styleUrls: ['./experience-form.scss']
})
export class ExperienceForm implements OnInit {
  private fb = inject(FormBuilder);
  private experienceService = inject(ExperienceService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  experienceForm!: FormGroup;
  isEditMode = signal(false);
  experienceId = signal<number | null>(null);
  isSubmitting = signal(false);
  errorMessage = signal('');
  isLoading = signal(false);

  ngOnInit() {
    this.initForm();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.experienceId.set(+params['id']);
        this.loadExperience(+params['id']);
      }
    });
  }

  initForm() {
    this.experienceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      confirmationMode: ['auto']
    });
  }

  loadExperience(id: number) {
    this.isLoading.set(true);
    this.experienceService.getExperience(id).subscribe({
      next: (experience) => {
        this.experienceForm.patchValue({
          title: experience.title,
          description: experience.description,
          location: experience.location,
          duration: experience.duration,
          price: experience.price,
          capacity: experience.capacity,
          confirmationMode: (experience as any).confirmationMode || 'auto'
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        const errorMsg = 'Failed to load experience';
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.experienceForm.invalid) {
      Object.keys(this.experienceForm.controls).forEach(key => {
        this.experienceForm.get(key)?.markAsTouched();
      });
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const experienceData = this.experienceForm.value;

    const request = this.isEditMode() && this.experienceId()
      ? this.experienceService.updateExperience(this.experienceId()!, experienceData)
      : this.experienceService.createExperience(experienceData);

    request.subscribe({
      next: () => {
        const successMsg = this.isEditMode() 
          ? 'Experience updated successfully!' 
          : 'Experience created successfully!';
        this.toastService.success(successMsg);
        this.router.navigate(['/dashboard/my-listings']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const errorMsg = error.error?.error || 'Failed to save experience';
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.experienceForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.experienceForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `Minimum value is ${min}`;
    }
    return '';
  }
}
