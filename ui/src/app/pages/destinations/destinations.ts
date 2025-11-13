import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
// Note: Assuming these services/interfaces are available in the new path or globally
// NOTE: You might rename the service and interfaces if they are truly destination-focused, 
// but for consistency with your existing code, we keep the experience names here.
import { PublicExperienceService, PublicExperience, ExperienceFilters } from '../../services/public-experience.service';
import { ExperienceCard } from '../../components/experience-card/experience-card';

@Component({
  selector: 'app-destinations', // <-- UPDATED SELECTOR
  // Added NgbCollapseModule for the "Advanced Filters" toggle
  imports: [CommonModule, ExperienceCard, FormsModule, NgbRatingModule, NgbCollapseModule],
  templateUrl: './destinations.html', // <-- UPDATED TEMPLATE URL
  styleUrl: './destinations.scss',
  standalone: true // Assuming it's a standalone component based on the `imports` array
})
export class Destinations implements OnInit { // <-- UPDATED CLASS NAME
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
  // NOTE: If this component were *truly* dedicated to destinations, you might remove
  // minPrice, maxPrice, and rating, as they relate more to experiences.
  minPrice?: number;
  maxPrice?: number;
  rating: number = 0;

  // Filter options
  dynamicLocations: string[] = [];
  priceOptions: number[] = [0, 25, 50, 75, 100, 150, 200];

  /**
   * Hardcoded list of top locations (can be repurposed or removed)
   */
  topLocations: string[] = ['Belfast', 'Giant\'s Causeway', 'Derry', 'Mourne Mountains'];

  /**
   * For toggling the advanced filter section
   */
  isAdvancedFilterCollapsed = true;

  private currentFilters: ExperienceFilters = { page: 1, limit: 9 };

  constructor(
    private publicExperienceService: PublicExperienceService // Keep using the same service
  ) {}

  ngOnInit() {
    this.loadExperiences();
    this.loadFilterOptions();
  }

  // --- Core Methods (Identical Logic) ---

  /**
   * Loads the visible, paginated list of items (still uses 'experiences' service for now).
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
   * Fetches *all* experience data to build the dynamic filter lists.
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
   * Called on Search button click (or any filter selection change).
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
  }

  onLocationTabClick(selectedLocation: string) {
    if (this.location === selectedLocation) {
      this.location = '';
    } else {
      this.location = selectedLocation;
    }
    this.onFilterChange();
    this.scrollToExperienceList(true);
  }

  /**
   * Clears all filters and re-loads the list.
   */
  clearFilters() {
    this.location = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.rating = 0;
    this.onFilterChange();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentFilters.page = page;
    this.loadExperiences();
    this.scrollToExperienceList(true);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  /**
   * Reusable scroll function.
   * @param force If true, scrolls even if element is partially in view.
   */
  scrollToExperienceList(force: boolean = false) {
    if (this.experienceListElement) {
      const options: ScrollIntoViewOptions = { behavior: 'smooth' };
      if (!force) {
        options.block = 'nearest';
      }
      this.experienceListElement.nativeElement.scrollIntoView(options);
    }
  }
}