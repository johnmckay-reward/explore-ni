import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { ExperienceFilters } from '../../services/public-experience.service';

@Component({
  selector: 'app-filter-sidebar',
  imports: [CommonModule, FormsModule, NgbRatingModule],
  templateUrl: './filter-sidebar.html',
  styleUrls: ['./filter-sidebar.scss']
})
export class FilterSidebar {
  @Output() filtersChange = new EventEmitter<ExperienceFilters>();

  location: string = '';
  minPrice?: number;
  maxPrice?: number;
  rating: number = 0;

  applyFilters() {
    const filters: ExperienceFilters = {
      location: this.location || undefined,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      rating: this.rating > 0 ? this.rating : undefined,
    };

    this.filtersChange.emit(filters);
  }

  clearFilters() {
    this.location = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.rating = 0;
    this.filtersChange.emit({});
  }
}
