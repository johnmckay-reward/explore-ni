import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService, BookingDetails } from '../../services/booking.service';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule],
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.scss']
})
export class PaymentSuccess implements OnInit {
  bookingId!: number;
  booking = signal<BookingDetails | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('bookingId');
      if (id) {
        this.bookingId = parseInt(id, 10);
        this.loadBooking();
      }
    });
  }

  loadBooking() {
    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading booking:', err);
        this.loading.set(false);
      }
    });
  }

  goToExperiences() {
    this.router.navigate(['/experiences']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
