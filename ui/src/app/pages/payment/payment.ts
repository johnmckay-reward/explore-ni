import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { BookingService, BookingDetails } from '../../services/booking.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss']
})
export class Payment implements OnInit {
  @ViewChild('paymentElement', { static: false }) paymentElement!: ElementRef;
  
  bookingId!: number;
  booking = signal<BookingDetails | null>(null);
  loading = signal(true);
  processing = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElementInstance: StripePaymentElement | null = null;

  // Replace with your actual Stripe publishable key
  // In production, this should come from environment config
  private readonly STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  async ngOnInit() {
    // Get booking ID from route
    this.route.paramMap.subscribe(async params => {
      const id = params.get('bookingId');
      if (id) {
        this.bookingId = parseInt(id, 10);
        await this.loadBookingAndInitializePayment();
      }
    });
  }

  async loadBookingAndInitializePayment() {
    try {
      this.loading.set(true);
      
      // Load booking details
      this.bookingService.getBooking(this.bookingId).subscribe({
        next: async (booking) => {
          this.booking.set(booking);
          
          // Check if already paid
          if (booking.paymentStatus === 'succeeded') {
            this.success.set(true);
            this.loading.set(false);
            return;
          }

          // Initialize Stripe and create payment intent
          await this.initializeStripe();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading booking:', err);
          this.error.set('Failed to load booking details');
          this.loading.set(false);
        }
      });
    } catch (err) {
      console.error('Error in payment initialization:', err);
      this.error.set('Failed to initialize payment');
      this.loading.set(false);
    }
  }

  async initializeStripe() {
    try {
      // Load Stripe.js
      this.stripe = await loadStripe(this.STRIPE_PUBLISHABLE_KEY);
      
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create payment intent
      this.bookingService.createPaymentIntent({ bookingId: this.bookingId }).subscribe({
        next: async (response) => {
          if (!this.stripe) return;

          // Create Stripe Elements
          this.elements = this.stripe.elements({
            clientSecret: response.clientSecret,
          });

          // Create and mount payment element
          this.paymentElementInstance = this.elements.create('payment');
          
          // Wait a bit for the DOM to be ready
          setTimeout(() => {
            if (this.paymentElement && this.paymentElementInstance) {
              this.paymentElementInstance.mount(this.paymentElement.nativeElement);
            }
          }, 100);
        },
        error: (err) => {
          console.error('Error creating payment intent:', err);
          this.error.set(err.error?.error || 'Failed to initialize payment');
        }
      });
    } catch (err) {
      console.error('Error initializing Stripe:', err);
      this.error.set('Failed to initialize payment system');
    }
  }

  async handlePayment() {
    if (!this.stripe || !this.elements) {
      this.error.set('Payment system not initialized');
      return;
    }

    this.processing.set(true);
    this.error.set(null);

    try {
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success/${this.bookingId}`,
        },
      });

      if (error) {
        // Payment failed
        this.error.set(error.message || 'Payment failed');
        this.processing.set(false);
      }
      // If successful, user will be redirected to return_url
    } catch (err) {
      console.error('Error processing payment:', err);
      this.error.set('An unexpected error occurred');
      this.processing.set(false);
    }
  }

  goToExperiences() {
    this.router.navigate(['/experiences']);
  }
}
