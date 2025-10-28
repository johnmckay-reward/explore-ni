import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { ExperienceFilters } from '../../services/public-experience.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-filter-sidebar',
  imports: [CommonModule, FormsModule, NgbRatingModule],
  templateUrl: './filter-sidebar.html', // We'll use a separate HTML file now
  styleUrl: './filter-sidebar.scss' // And a separate SCSS file
})
export class FilterSidebar implements OnInit, OnDestroy {
  @Output() filtersChange = new EventEmitter<ExperienceFilters>();

  location: string = '';
  minPrice?: number;
  maxPrice?: number;
  rating: number = 0;

  // Subject to handle debouncing for text/number inputs
  private filterInputChanges = new Subject<void>();
  private filterSubscription: Subscription;

  constructor() {
    // Set up the debounced subscription
    this.filterSubscription = this.filterInputChanges
      .pipe(debounceTime(400)) // Wait 400ms after the last input
      .subscribe(() => {
        this.emitFilters();
      });
  }

  ngOnInit() {}

  ngOnDestroy() {
    // Clean up the subscription to prevent memory leaks
    this.filterSubscription.unsubscribe();
  }

  /**
   * Called on keyup for text/number inputs.
   * Pushes an event to the debouncer.
   */
  onFilterChange() {
    this.filterInputChanges.next();
  }

  /**
   * Called immediately on rating change.
   * Clicks should be instant, so we bypass the debouncer.
   */
  onRatingChange() {
    this.emitFilters();
  }

  /**
   * Gathers all filter data and emits it to the parent component.
   */
  emitFilters() {
    const filters: ExperienceFilters = {
      // Use || undefined to send undefined instead of an empty string
      location: this.location.trim() || undefined,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      rating: this.rating > 0 ? this.rating : undefined,
    };

    this.filtersChange.emit(filters);
  }

  /**
   * Clears all filters and immediately emits the empty state.
   */
  clearFilters() {
    this.location = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.rating = 0;
    // Immediately emit the cleared filters
    this.emitFilters();
  }
}
