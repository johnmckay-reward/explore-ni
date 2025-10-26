import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbCarouselModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { PublicExperienceService, PublicExperience } from '../../services/public-experience.service';
import { ReviewsList } from '../../components/reviews-list/reviews-list';
import { Booking } from '../../components/booking/booking';

@Component({
  selector: 'app-experience-detail',
  imports: [CommonModule, RouterLink, NgbCarouselModule, NgbRatingModule, ReviewsList, Booking],
  templateUrl: './experience-detail.html',
  styleUrls: ['./experience-detail.scss']
})
export class ExperienceDetail implements OnInit {
  experience?: PublicExperience;
  loading = true;
  error: string | null = null;

  constructor(
    private publicExperienceService: PublicExperienceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.loadExperience(parseInt(idParam));
      }
    });
  }

  loadExperience(id: number) {
    this.loading = true;
    this.publicExperienceService.getExperienceById(id).subscribe({
      next: (experience) => {
        this.experience = experience;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading experience:', err);
        this.error = 'Experience not found or unavailable';
        this.loading = false;
      },
    });
  }

  get vendorName(): string {
    if (!this.experience?.vendor) return 'Unknown';
    return `${this.experience.vendor.firstName} ${this.experience.vendor.lastName}`;
  }

  get categoryNames(): string {
    if (!this.experience?.categories || this.experience.categories.length === 0) {
      return 'Uncategorized';
    }
    return this.experience.categories.map(c => c.name).join(', ');
  }
}
