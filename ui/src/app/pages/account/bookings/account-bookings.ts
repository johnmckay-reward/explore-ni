import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, BookingDetails } from '../../../services/booking.service';

@Component({
  selector: 'app-account-bookings',
  imports: [CommonModule],
  templateUrl: './account-bookings.html',
  styleUrl: './account-bookings.scss',
})
export class AccountBookings implements OnInit {
  bookings: BookingDetails[] = [];
  loading = true;
  error: string | null = null;

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    // Note: This would need an API endpoint for customer bookings
    // For now, just show placeholder
    this.loading = false;
  }
}
