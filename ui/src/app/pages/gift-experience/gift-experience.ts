import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { VoucherService } from '../../services/voucher.service';
import { PublicExperienceService, Experience } from '../../services/public-experience.service';

@Component({
  selector: 'app-gift-experience',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gift-experience.html',
  styleUrls: ['./gift-experience.scss'],
})
export class GiftExperience implements OnInit {
  @ViewChild('paymentElement', { static: false }) paymentElement!: ElementRef;

  experienceId!: number;
  experience = signal<Experience | null>(null);
  voucherForm!: FormGroup;

  // Payment state
  showPayment = signal(false);
  loading = signal(false);
  processing = signal(false);
  error = signal<string | null>(null);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElementInstance: StripePaymentElement | null = null;

  private readonly STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private voucherService: VoucherService,
    private experienceService: PublicExperienceService
  ) {}

  ngOnInit() {
    this.voucherForm = this.fb.group({
      senderName: ['', Validators.required],
      recipientName: ['', Validators.required],
      recipientEmail: ['', [Validators.required, Validators.email]],
      message: [''],
    });

    // Get experience ID from route
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.experienceId = parseInt(id, 10);
        this.loadExperience();
      }
    });
  }

  loadExperience() {
    this.loading.set(true);
    this.experienceService.getExperience(this.experienceId).subscribe({
      next: (experience) => {
        this.experience.set(experience);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading experience:', err);
        this.error.set('Failed to load experience details');
        this.loading.set(false);
      },
    });
  }

  async submitForm() {
    if (this.voucherForm.invalid) {
      this.error.set('Please fill in all required fields');
      return;
    }

    const exp = this.experience();
    if (!exp) {
      this.error.set('Experience not loaded');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const request = {
        experienceId: this.experienceId,
        ...this.voucherForm.value,
      };

      this.voucherService.purchaseExperience(request).subscribe({
        next: async (response) => {
          this.showPayment.set(true);
          this.loading.set(false);
          await this.initializeStripe(response.clientSecret);
        },
        error: (err) => {
          console.error('Error creating payment intent:', err);
          this.error.set(err.error?.error || 'Failed to create payment');
          this.loading.set(false);
        },
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      this.error.set('An unexpected error occurred');
      this.loading.set(false);
    }
  }

  async initializeStripe(clientSecret: string) {
    try {
      this.stripe = await loadStripe(this.STRIPE_PUBLISHABLE_KEY);

      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      this.elements = this.stripe.elements({
        clientSecret,
      });

      this.paymentElementInstance = this.elements.create('payment');

      setTimeout(() => {
        if (this.paymentElement && this.paymentElementInstance) {
          this.paymentElementInstance.mount(this.paymentElement.nativeElement);
        }
      }, 100);
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
          return_url: `${window.location.origin}/gift-vouchers/success`,
        },
      });

      if (error) {
        this.error.set(error.message || 'Payment failed');
        this.processing.set(false);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      this.error.set('An unexpected error occurred');
      this.processing.set(false);
    }
  }

  goBack() {
    if (this.showPayment()) {
      this.showPayment.set(false);
      this.stripe = null;
      this.elements = null;
      this.paymentElementInstance = null;
    } else {
      this.router.navigate(['/experience', this.experienceId]);
    }
  }
}
