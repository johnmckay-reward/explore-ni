import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
   * Get authorization headers
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Create a new experience
   */
  createExperience(experience: Experience): Observable<any> {
    return this.http.post(this.apiUrl, experience, { headers: this.getHeaders() });
  }

  /**
   * Get vendor's listings
   */
  getMyListings(): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.apiUrl}/my-listings`, { headers: this.getHeaders() });
  }

  /**
   * Get a specific experience
   */
  getExperience(id: number): Observable<Experience> {
    return this.http.get<Experience>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Update an experience
   */
  updateExperience(id: number, experience: Partial<Experience>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, experience, { headers: this.getHeaders() });
  }

  /**
   * Delete an experience
   */
  deleteExperience(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
