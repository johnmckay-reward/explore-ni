import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PublicExperienceService, PublicExperience, ExperienceFilters } from '../../services/public-experience.service';
import { ExperienceCard } from '../../components/experience-card/experience-card';
import { FilterSidebar } from '../../components/filter-sidebar/filter-sidebar';

@Component({
  selector: 'app-experience-list',
  imports: [CommonModule, ExperienceCard, FilterSidebar],
  templateUrl: './experience-list.html',
  styleUrls: ['./experience-list.scss']
})
export class ExperienceList implements OnInit {
  experiences: PublicExperience[] = [];
  loading = true;
  error: string | null = null;
  currentPage = 1;
  totalPages = 0;
  categorySlug?: string;
  currentFilters: ExperienceFilters = { page: 1, limit: 9 };

  constructor(
    private publicExperienceService: PublicExperienceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.categorySlug = params.get('slug') || undefined;
      this.currentFilters.category = this.categorySlug;
      this.loadExperiences();
    });
  }

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

  onFiltersChange(filters: ExperienceFilters) {
    this.currentFilters = {
      ...filters,
      category: this.categorySlug,
      page: 1,
      limit: 9,
    };
    this.loadExperiences();
  }

  onPageChange(page: number) {
    this.currentFilters.page = page;
    this.loadExperiences();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
