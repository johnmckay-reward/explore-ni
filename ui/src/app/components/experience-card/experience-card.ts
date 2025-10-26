import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { PublicExperience } from '../../services/public-experience.service';

@Component({
  selector: 'app-experience-card',
  imports: [CommonModule, RouterLink, NgbRatingModule],
  templateUrl: './experience-card.html',
  styleUrls: ['./experience-card.scss']
})
export class ExperienceCard {
  @Input() experience!: PublicExperience;
}
