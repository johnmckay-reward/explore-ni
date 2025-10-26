import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.error || 'Failed to submit application. Please try again.');
      }
    });
  }
}
