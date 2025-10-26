import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, BookingDetails } from '../../../services/booking.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-booking-requests',
  imports: [CommonModule],
  templateUrl: './booking-requests.html',
  styleUrl: './booking-requests.scss'
})
export class BookingRequests implements OnInit {
  bookings: BookingDetails[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.loadBookingRequests();
  }

  loadBookingRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.bookingService.getVendorBookingRequests().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading booking requests:', error);
        this.errorMessage = 'Failed to load booking requests. Please try again.';
        this.toastService.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  confirmBooking(bookingId: number): void {
    if (!confirm('Are you sure you want to confirm this booking?')) {
      return;
    }

    this.bookingService.confirmBooking(bookingId).subscribe({
      next: (response) => {
        this.successMessage = 'Booking confirmed successfully!';
        this.toastService.success(this.successMessage);
        // Remove the booking from the list
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error confirming booking:', error);
        this.errorMessage = error.error?.error || 'Failed to confirm booking. Please try again.';
        this.toastService.error(this.errorMessage);
      }
    });
  }

  declineBooking(bookingId: number): void {
    if (!confirm('Are you sure you want to decline this booking? A refund will be issued to the customer.')) {
      return;
    }

    this.bookingService.declineBooking(bookingId).subscribe({
      next: (response) => {
        this.successMessage = 'Booking declined successfully. Refund has been processed.';
        this.toastService.success(this.successMessage);
        // Remove the booking from the list
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error declining booking:', error);
        this.errorMessage = error.error?.error || 'Failed to decline booking. Please try again.';
        this.toastService.error(this.errorMessage);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5); // Extract HH:mm from HH:mm:ss
  }
}
