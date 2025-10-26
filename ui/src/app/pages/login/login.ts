import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  onSubmit() {
    // TODO: Implement actual login logic with API call
    console.log('Login attempt:', { email: this.email });
    
    // For now, just show success
    if (this.email && this.password) {
      this.router.navigate(['/']);
    } else {
      this.errorMessage = 'Please enter email and password';
    }
  }
}
