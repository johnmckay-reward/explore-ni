import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';

interface Setting {
  key: string;
  description: string;
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss',
})
export class AdminSettings implements OnInit {
  settings = signal<Setting[]>([]);
  settingForms: { [key: string]: FormGroup } = {};
  savingStates: { [key: string]: boolean } = {};
  successMessages: { [key: string]: string } = {};
  errorMessages: { [key: string]: string } = {};
  loading = signal(false);

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading.set(true);
    this.http.get<Setting[]>(`${environment.apiUrl}/api/admin/settings`).subscribe({
      next: (settings) => {
        this.settings.set(settings);
        
        // Create a form for each setting
        settings.forEach((setting) => {
          this.settingForms[setting.key] = this.fb.group({
            value: ['', Validators.required],
          });
          this.savingStates[setting.key] = false;
          this.successMessages[setting.key] = '';
          this.errorMessages[setting.key] = '';
        });
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.toastService.error('Failed to load settings');
        this.loading.set(false);
      },
    });
  }

  saveSetting(key: string) {
    const form = this.settingForms[key];
    if (!form || form.invalid) {
      this.toastService.error('Please enter a valid value');
      return;
    }

    const value = form.value.value;
    this.savingStates[key] = true;
    this.successMessages[key] = '';
    this.errorMessages[key] = '';

    this.http
      .put(`${environment.apiUrl}/api/admin/settings`, { key, value })
      .subscribe({
        next: () => {
          this.savingStates[key] = false;
          const successMsg = 'Setting saved successfully';
          this.successMessages[key] = successMsg;
          this.toastService.success(successMsg);
          
          // Clear the input field after successful save
          form.reset();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessages[key] = '';
          }, 3000);
        },
        error: (error) => {
          this.savingStates[key] = false;
          const errorMsg = error.error?.error || 'Failed to save setting';
          this.errorMessages[key] = errorMsg;
          this.toastService.error(errorMsg);
          
          // Clear error message after 5 seconds
          setTimeout(() => {
            this.errorMessages[key] = '';
          }, 5000);
        },
      });
  }

  getForm(key: string): FormGroup {
    return this.settingForms[key];
  }

  isSaving(key: string): boolean {
    return this.savingStates[key] || false;
  }

  getSuccessMessage(key: string): string {
    return this.successMessages[key] || '';
  }

  getErrorMessage(key: string): string {
    return this.errorMessages[key] || '';
  }
}
