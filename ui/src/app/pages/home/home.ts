import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { PublicExperienceService, PublicExperience, ExperienceFilters } from '../../services/public-experience.service';
import { ExperienceCard } from '../../components/experience-card/experience-card';

@Component({
  selector: 'app-home',
  // Added NgbCollapseModule for the "Advanced Filters" toggle
  imports: [CommonModule, ExperienceCard, FormsModule, NgbRatingModule, NgbCollapseModule],
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

  /**
   * NEW: Hardcoded list of top locations for the tabbed UI.
   * In a real app, this might come from the API, but for now, we define it here.
   */
  topLocations: string[] = ['Belfast', 'Giant\'s Causeway', 'Derry', 'Mourne Mountains'];

  /**
   * NEW: For toggling the advanced filter section
   */
  isAdvancedFilterCollapsed = true;

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
   * (No changes from original)
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
   * (No changes from original)
   */
  loadFilterOptions() {
    this.publicExperienceService.getExperiences({ limit: 9999 }).subscribe({
      next: (response) => {
        const locations = new Set(
          response.experiences.map(exp => exp.location)
        );
        // We still load all locations for the advanced filter dropdown
        this.dynamicLocations = Array.from(locations).sort();
      },
      error: (err) => {
        console.error('Error loading filter options:', err);
      }
    });
  }

  /**
   * Called on any filter selection change.
   * (No changes from original)
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
    // We scroll on page change, but not on every filter change (can be jarring)
  }

  /**
   * NEW: Called when a user clicks one of the top location tabs.
   * This sets the main location filter and triggers a reload.
   */
  onLocationTabClick(selectedLocation: string) {
    // If clicking the same tab, clear the filter. Otherwise, set it.
    if (this.location === selectedLocation) {
      this.location = '';
    } else {
      this.location = selectedLocation;
    }
    this.onFilterChange();
    this.scrollToExperienceList(true); // Scroll on tab click
  }

  /**
   * Clears all filters and re-loads the list.
   * (No changes from original)
   */
  clearFilters() {
    this.location = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.rating = 0;
    this.onFilterChange();
  }

  /**
   * (No changes from original)
   */
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentFilters.page = page;
    this.loadExperiences();
    this.scrollToExperienceList(true); // Scroll on page change
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  /**
   * Reusable scroll function.
   * @param force {boolean} If true, scrolls even if element is partially in view.
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
