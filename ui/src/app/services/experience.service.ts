import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Experience {
  id?: number;
  title: string;
  description: string;
  location: string;
  duration: number;
  price: number;
  capacity: number;
  vendorId?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  vendor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private apiUrl = 'http://localhost:3000/api/experiences';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Create a new experience
   */
  createExperience(experience: Experience): Observable<any> {
    return this.http.post(this.apiUrl, experience);
  }

  /**
   * Get vendor's listings
   */
  getMyListings(): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.apiUrl}/my-listings`);
  }

  /**
   * Get a specific experience
   */
  getExperience(id: number): Observable<Experience> {
    return this.http.get<Experience>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update an experience
   */
  updateExperience(id: number, experience: Partial<Experience>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, experience);
  }

  /**
   * Delete an experience
   */
  deleteExperience(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
