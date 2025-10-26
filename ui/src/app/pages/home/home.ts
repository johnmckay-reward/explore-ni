import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicExperienceService, PublicExperience, Category } from '../../services/public-experience.service';
import { ExperienceCard } from '../../components/experience-card/experience-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ExperienceCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  featuredExperiences: PublicExperience[] = [];
  categories: Category[] = [];
  loading = true;
  error: string | null = null;

  constructor(private publicExperienceService: PublicExperienceService) {}

  ngOnInit() {
    this.loadFeaturedExperiences();
    this.loadCategories();
  }

  loadFeaturedExperiences() {
    this.publicExperienceService.getExperiences({ limit: 6 }).subscribe({
      next: (response) => {
        this.featuredExperiences = response.experiences;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading featured experiences:', err);
        this.error = 'Failed to load featured experiences';
        this.loading = false;
      },
    });
  }

  loadCategories() {
    this.publicExperienceService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });
  }
}
