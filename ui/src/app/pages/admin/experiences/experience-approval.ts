import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { Experience } from '../../../services/experience.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-experience-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience-approval.html',
  styleUrls: ['./experience-approval.scss']
})
export class ExperienceApproval implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  pendingExperiences = signal<Experience[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.loadPendingExperiences();
  }

  loadPendingExperiences() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getExperiences('pending').subscribe({
      next: (experiences) => {
        this.pendingExperiences.set(experiences);
        this.isLoading.set(false);
      },
      error: (error) => {
        const errorMsg = 'Failed to load pending experiences';
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  approveExperience(experienceId: number | undefined) {
    if (!experienceId || !confirm('Are you sure you want to approve this experience?')) {
      return;
    }

    this.adminService.approveExperience(experienceId).subscribe({
      next: () => {
        this.toastService.success('Experience approved successfully!');
        // Remove from list
        this.pendingExperiences.update(experiences => 
          experiences.filter(e => e.id !== experienceId)
        );
      },
      error: (error) => {
        const errorMsg = error.error?.error || 'Failed to approve experience';
        this.toastService.error(errorMsg);
      }
    });
  }

  rejectExperience(experienceId: number | undefined) {
    if (!experienceId || !confirm('Are you sure you want to reject this experience?')) {
      return;
    }

    this.adminService.rejectExperience(experienceId).subscribe({
      next: () => {
        this.toastService.success('Experience rejected');
        // Remove from list
        this.pendingExperiences.update(experiences => 
          experiences.filter(e => e.id !== experienceId)
        );
      },
      error: (error) => {
        const errorMsg = error.error?.error || 'Failed to reject experience';
        this.toastService.error(errorMsg);
      }
    });
  }
}
