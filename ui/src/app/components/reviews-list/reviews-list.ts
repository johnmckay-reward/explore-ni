import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
}

@Component({
  selector: 'app-reviews-list',
  imports: [CommonModule, NgbRatingModule],
  templateUrl: './reviews-list.html',
  styleUrls: ['./reviews-list.scss']
})
export class ReviewsList {
  @Input() reviews: Review[] = [];
}
