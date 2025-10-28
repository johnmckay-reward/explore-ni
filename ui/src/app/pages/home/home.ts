import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { PublicExperienceService, PublicExperience, ExperienceFilters } from '../../services/public-experience.service';
import { ExperienceCard } from '../../components/experience-card/experience-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ExperienceCard, FormsModule, NgbRatingModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  // --- Element Reference for Scrolling ---
  @ViewChild('experienceList') experienceListElement!: ElementRef;

  // --- Properties for List Display ---
  experiences: PublicExperience[] = [];
  currentPage = 1;
  totalPages = 0;
  loading = true;
  error: string | null = null;

  // --- Properties for Filtering ---
  location: string = '';
  minPrice?: number;
  maxPrice?: number;
  rating: number = 0;

  // Filter options
  dynamicLocations: string[] = [];
  priceOptions: number[] = [0, 25, 50, 75, 100, 150, 200];

  private currentFilters: ExperienceFilters = { page: 1, limit: 9 };

  constructor(
    private publicExperienceService: PublicExperienceService
  ) {}

  ngOnInit() {
    this.loadExperiences();
    this.loadFilterOptions();
  }

  /**
   * Loads the visible, paginated list of experiences.
   */
  loadExperiences() {
    this.loading = true;
    this.publicExperienceService.getExperiences(this.currentFilters).subscribe({
      next: (response) => {
        this.experiences = response.experiences;
        this.currentPage = response.pagination.page;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading experiences:', err);
        this.error = 'Failed to load experiences';
        this.loading = false;
      },
    });
  }

  /**
   * Fetches *all* experiences to build the dynamic filter lists.
   */
  loadFilterOptions() {
    this.publicExperienceService.getExperiences({ limit: 9999 }).subscribe({
      next: (response) => {
        const locations = new Set(
          response.experiences.map(exp => exp.location)
        );
        this.dynamicLocations = Array.from(locations).sort();
      },
      error: (err) => {
        console.error('Error loading filter options:', err);
      }
    });
  }

  /**
   * Called on any filter selection change.
   * Gathers all local filter data and re-loads the list.
   */
  onFilterChange() {
    const filters: ExperienceFilters = {
      location: this.location || undefined,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      rating: this.rating > 0 ? this.rating : undefined,
    };

    this.currentFilters = {
      ...filters,
      page: 1, // Reset to page 1 for any new filter
      limit: 9,
    };
    this.loadExperiences();
    // Smooth scroll on filter change
    this.scrollToExperienceList();
  }

  /**
   * Clears all filters and re-loads the list.
   */
  clearFilters() {
    this.location = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.rating = 0;
    this.onFilterChange(); // Re-run the search with cleared filters
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentFilters.page = page;
    this.loadExperiences();
    // Smooth scroll on page change
    this.scrollToExperienceList();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  /**
   * Reusable scroll function for the "Browse" button and filters.
   */
  scrollToExperienceList() {
    if (this.experienceListElement) {
      this.experienceListElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
