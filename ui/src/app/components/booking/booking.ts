import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicExperience } from '../../services/public-experience.service';

@Component({
  selector: 'app-booking',
  imports: [CommonModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss']
})
export class Booking {
  @Input() experience!: PublicExperience;
}
