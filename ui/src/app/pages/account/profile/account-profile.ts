import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-account-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-profile.html',
  styleUrl: './account-profile.scss',
})
export class AccountProfile implements OnInit {
  profileForm!: FormGroup;
  userProfile: UserProfile | null = null;
  loading = true;
  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      phoneNumber: [''],
      notificationPreference: ['email', Validators.required],
    });
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          phoneNumber: profile.phoneNumber || '',
          notificationPreference: profile.notificationPreference,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile';
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.saving = true;
      this.userService.updateProfile(this.profileForm.value).subscribe({
        next: (response) => {
          this.toastService.show('Profile updated successfully', 'success');
          this.userProfile = response.user;
          this.saving = false;
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.toastService.show('Failed to update profile', 'error');
          this.saving = false;
        },
      });
    }
  }
}
