import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit() {
    // Validate passwords match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Validate all fields are filled
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    // TODO: Implement actual registration logic with API call
    console.log('Registration attempt:', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
    });

    // For now, just navigate to login
    this.router.navigate(['/login']);
  }
}
