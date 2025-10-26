import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ExperienceCard } from '../../components/experience-card/experience-card';
import { PublicExperience } from '../../services/public-experience.service';

interface HotelPartnerResponse {
  hotelPartner: {
    id: number;
    name: string;
    slug: string;
  };
  experiences: PublicExperience[];
}

@Component({
  selector: 'app-hotel-landing',
  standalone: true,
  imports: [CommonModule, ExperienceCard],
  templateUrl: './hotel-landing.html',
  styleUrl: './hotel-landing.scss',
})
export class HotelLanding implements OnInit {
  hotelName = signal<string>('');
  experiences = signal<PublicExperience[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadPartnerExperiences(slug);
    }
  }

  loadPartnerExperiences(slug: string) {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<HotelPartnerResponse>(`${environment.apiUrl}/api/public/partner/${slug}/experiences`)
      .subscribe({
        next: (response) => {
          this.hotelName.set(response.hotelPartner.name);
          this.experiences.set(response.experiences);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading partner experiences:', err);
          this.error.set('Unable to load experiences. Please try again later.');
          this.loading.set(false);
        },
      });
  }
}
