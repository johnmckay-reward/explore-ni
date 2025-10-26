import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-vendor-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vendor-profile.html',
  styleUrl: './vendor-profile.scss'
})
export class VendorProfile implements OnInit {
  profileForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      notificationPreference: ['email', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          phoneNumber: profile.phoneNumber || '',
          notificationPreference: profile.notificationPreference || 'email'
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (response) => {
        this.successMessage = 'Profile updated successfully!';
        this.loading = false;
        
        // Update the current user in auth service
        this.authService.updateCurrentUser(response.user);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.error || 'Failed to update profile. Please try again.';
        this.loading = false;
      }
    });
  }
}
