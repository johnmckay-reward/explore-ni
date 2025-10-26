import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PublicExperienceService, PublicExperience } from '../../services/public-experience.service';
import { BookingService, CreateBookingRequest } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';

interface Availability {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
}

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class Checkout implements OnInit {
  experienceId!: number;
  experience = signal<PublicExperience | null>(null);
  checkoutForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  
  availableDates = signal<Set<string>>(new Set());
  availableTimes = signal<Availability[]>([]);
  minDate!: NgbDateStruct;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private experienceService = inject(PublicExperienceService);
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.initForm();
    this.setMinDate();
    
    // Get experience ID from route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.experienceId = parseInt(id, 10);
        this.loadExperience();
      }
    });
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      date: [null, Validators.required],
      time: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]]
    });
    
    // Watch for date changes to update available times
    this.checkoutForm.get('date')?.valueChanges.subscribe((date: NgbDateStruct) => {
      if (date) {
        this.updateAvailableTimes(date);
      }
    });
  }

  setMinDate() {
    const today = new Date();
    this.minDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }

  loadExperience() {
    this.loading.set(true);
    this.experienceService.getExperienceById(this.experienceId).subscribe({
      next: (exp) => {
        this.experience.set(exp);
        this.processAvailability(exp);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading experience:', err);
        this.error.set('Failed to load experience details');
        this.loading.set(false);
      }
    });
  }

  processAvailability(exp: PublicExperience) {
    if (exp.availabilities && exp.availabilities.length > 0) {
      const dates = new Set<string>();
      exp.availabilities.forEach((avail: Availability) => {
        dates.add(avail.date);
      });
      this.availableDates.set(dates);
    }
  }

  updateAvailableTimes(selectedDate: NgbDateStruct) {
    const dateString = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
    
    const exp = this.experience();
    if (exp && exp.availabilities) {
      const times = exp.availabilities.filter(
        (avail: Availability) => avail.date === dateString
      );
      this.availableTimes.set(times);
      
      // Reset time selection when date changes
      this.checkoutForm.patchValue({ time: '' });
    }
  }

  isDateDisabled = (date: NgbDateStruct): boolean => {
    const dateString = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    return !this.availableDates().has(dateString);
  };

  getSelectedAvailability(): Availability | null {
    const selectedTimeId = this.checkoutForm.get('time')?.value;
    if (!selectedTimeId) return null;
    
    const times = this.availableTimes();
    return times.find(t => t.id === parseInt(selectedTimeId, 10)) || null;
  }

  calculateTotal(): number {
    const exp = this.experience();
    if (!exp) return 0;
    
    const quantity = this.checkoutForm.get('quantity')?.value || 1;
    return parseFloat(exp.price.toString()) * quantity;
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.checkoutForm.value;
    const availability = this.getSelectedAvailability();
    
    if (!availability) {
      this.error.set('Please select a valid time slot');
      this.toastService.error('Please select a valid time slot');
      return;
    }

    const request: CreateBookingRequest = {
      experienceId: this.experienceId,
      availabilityId: availability.id,
      quantity: formValue.quantity,
      customerDetails: {
        name: formValue.customerName,
        email: formValue.customerEmail
      }
    };

    this.loading.set(true);
    this.error.set(null);

    this.bookingService.createBooking(request).subscribe({
      next: (response) => {
        console.log('Booking created:', response);
        this.toastService.success('Booking created successfully! Proceeding to payment...');
        // Navigate to payment page with booking ID
        this.router.navigate(['/payment', response.bookingId]);
      },
      error: (err) => {
        console.error('Error creating booking:', err);
        const errorMsg = err.error?.error || 'Failed to create booking. Please try again.';
        this.error.set(errorMsg);
        this.toastService.error(errorMsg);
        this.loading.set(false);
      }
    });
  }
}
