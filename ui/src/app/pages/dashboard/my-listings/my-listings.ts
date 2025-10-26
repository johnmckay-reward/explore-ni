import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExperienceService, Experience } from '../../../services/experience.service';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-listings.html',
  styleUrls: ['./my-listings.scss']
})
export class MyListings implements OnInit {
  private experienceService = inject(ExperienceService);

  experiences = signal<Experience[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.loadExperiences();
  }

  loadExperiences() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.experienceService.getMyListings().subscribe({
      next: (experiences) => {
        this.experiences.set(experiences);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load your listings');
        this.isLoading.set(false);
      }
    });
  }

  deleteExperience(id: number | undefined) {
    if (!id || !confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    this.experienceService.deleteExperience(id).subscribe({
      next: () => {
        // Remove from list
        this.experiences.update(exps => 
          exps.filter(e => e.id !== id)
        );
      },
      error: (error) => {
        alert('Failed to delete experience: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'approved':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
}
