import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface PublicExperience {
  id: number;
  title: string;
  description: string;
  location: string;
  duration: number;
  price: number;
  capacity: number;
  imageUrl?: string;
  status: string;
  averageRating?: number;
  vendor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  categories?: Category[];
  reviews?: any[];
  availabilities?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceFilters {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export interface ExperiencesResponse {
  experiences: PublicExperience[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PublicExperienceService {
  private apiUrl = 'https://explore-ni.onrender.com/api/public';

  constructor(private http: HttpClient) {}

  /**
   * Get all approved experiences with optional filtering
   */
  getExperiences(filters?: ExperienceFilters): Observable<ExperiencesResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.category) params = params.set('category', filters.category);
      if (filters.location) params = params.set('location', filters.location);
      if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.rating !== undefined) params = params.set('rating', filters.rating.toString());
    }

    return this.http.get<ExperiencesResponse>(`${this.apiUrl}/experiences`, { params });
  }

  /**
   * Get a specific approved experience by ID
   */
  getExperienceById(id: number): Observable<PublicExperience> {
    return this.http.get<PublicExperience>(`${this.apiUrl}/experiences/${id}`);
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }
}
