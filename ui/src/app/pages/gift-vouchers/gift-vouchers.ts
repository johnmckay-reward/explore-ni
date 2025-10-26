import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { VoucherService } from '../../services/voucher.service';

@Component({
  selector: 'app-gift-vouchers',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gift-vouchers.html',
  styleUrls: ['./gift-vouchers.scss'],
})
export class GiftVouchers implements OnInit {
  @ViewChild('paymentElement', { static: false }) paymentElement!: ElementRef;

  voucherForm!: FormGroup;
  selectedAmount = signal<number | null>(null);
  customAmount = signal<number | null>(null);
  showCustomInput = signal(false);

  // Payment state
  showPayment = signal(false);
  loading = signal(false);
  processing = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElementInstance: StripePaymentElement | null = null;

  private readonly STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';

  predefinedAmounts = [25, 50, 100];

  constructor(
    private fb: FormBuilder,
    private voucherService: VoucherService,
    private router: Router
  ) {}

  ngOnInit() {
    this.voucherForm = this.fb.group({
      senderName: ['', Validators.required],
      recipientName: ['', Validators.required],
      recipientEmail: ['', [Validators.required, Validators.email]],
      message: [''],
    });
  }

  selectAmount(amount: number) {
    this.selectedAmount.set(amount);
    this.showCustomInput.set(false);
    this.customAmount.set(null);
  }

  selectCustomAmount() {
    this.showCustomInput.set(true);
    this.selectedAmount.set(null);
  }

  setCustomAmount(value: string) {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      this.customAmount.set(amount);
    } else {
      this.customAmount.set(null);
    }
  }

  getSelectedAmount(): number | null {
    if (this.selectedAmount()) {
      return this.selectedAmount();
    }
    if (this.customAmount()) {
      return this.customAmount();
    }
    return null;
  }

  async submitForm() {
    if (this.voucherForm.invalid) {
      this.error.set('Please fill in all required fields');
      return;
    }

    const amount = this.getSelectedAmount();
    if (!amount) {
      this.error.set('Please select or enter an amount');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const request = {
        amount,
        ...this.voucherForm.value,
      };

      this.voucherService.purchaseFixed(request).subscribe({
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
      // Load Stripe.js
      this.stripe = await loadStripe(this.STRIPE_PUBLISHABLE_KEY);

      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create Stripe Elements
      this.elements = this.stripe.elements({
        clientSecret,
      });

      // Create and mount payment element
      this.paymentElementInstance = this.elements.create('payment');

      // Wait a bit for the DOM to be ready
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
    this.showPayment.set(false);
    this.stripe = null;
    this.elements = null;
    this.paymentElementInstance = null;
  }
}
