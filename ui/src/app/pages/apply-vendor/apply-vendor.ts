import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-apply-vendor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apply-vendor.html',
  styleUrls: ['./apply-vendor.scss']
})
export class ApplyVendor {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');

  applyToBeVendor() {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.applyToBeVendor().subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        this.toastService.success('Application submitted successfully! We will review your application soon.');
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const errorMsg = error.error?.error || 'Failed to submit application. Please try again.';
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
      }
    });
  }
}
