import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'customer';
  errorMessage = '';
  isLoading = false;

  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  onSubmit() {
    // Validate passwords match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.toastService.error('Passwords do not match');
      return;
    }

    // Validate all fields are filled
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      this.toastService.error('Please fill in all fields');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: this.role,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Registration successful! Welcome to NI Experiences.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
        this.toastService.error(this.errorMessage);
      }
    });
  }
}
