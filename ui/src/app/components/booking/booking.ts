import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { PublicExperience } from '../../services/public-experience.service';

interface Availability {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
}

@Component({
  selector: 'app-booking',
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss']
})
export class Booking implements OnInit {
  @Input() experience!: PublicExperience;
  
  private fb = new FormBuilder();
  bookingForm!: FormGroup;
  
  availableDates = signal<Set<string>>(new Set());
  availableTimes = signal<Availability[]>([]);
  minDate!: NgbDateStruct;
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.initForm();
    this.processAvailability();
    this.setMinDate();
  }
  
  initForm() {
    this.bookingForm = this.fb.group({
      date: [null, Validators.required],
      time: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    
    // Watch for date changes to update available times
    this.bookingForm.get('date')?.valueChanges.subscribe((date: NgbDateStruct) => {
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
  
  processAvailability() {
    if (this.experience.availabilities && this.experience.availabilities.length > 0) {
      const dates = new Set<string>();
      this.experience.availabilities.forEach((avail: Availability) => {
        dates.add(avail.date);
      });
      this.availableDates.set(dates);
    }
  }
  
  updateAvailableTimes(selectedDate: NgbDateStruct) {
    const dateString = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
    
    if (this.experience.availabilities) {
      const times = this.experience.availabilities.filter(
        (avail: Availability) => avail.date === dateString
      );
      this.availableTimes.set(times);
      
      // Reset time selection when date changes
      this.bookingForm.patchValue({ time: '' });
    }
  }
  
  isDateDisabled = (date: NgbDateStruct): boolean => {
    const dateString = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    return !this.availableDates().has(dateString);
  };
  
  onSubmit() {
    if (this.bookingForm.valid) {
      // Navigate to checkout page with experience ID
      this.router.navigate(['/checkout', this.experience.id]);
    }
  }
}

