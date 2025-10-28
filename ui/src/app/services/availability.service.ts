import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Availability {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
  experienceId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = 'https://explore-ni.onrender.com/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all availability slots for an experience
   */
  getAvailability(experienceId: number): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/experiences/${experienceId}/availability`);
  }

  /**
   * Create a new availability slot
   */
  createAvailability(experienceId: number, availability: Availability): Observable<any> {
    return this.http.post(`${this.apiUrl}/experiences/${experienceId}/availability`, availability);
  }

  /**
   * Create recurring availability slots
   */
  createRecurringAvailability(experienceId: number, data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    availableSlots: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/experiences/${experienceId}/availability-recurring`, data);
  }

  /**
   * Update an availability slot
   */
  updateAvailability(id: number, availability: Partial<Availability>): Observable<any> {
    return this.http.put(`${this.apiUrl}/availability/${id}`, availability);
  }

  /**
   * Delete an availability slot
   */
  deleteAvailability(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/availability/${id}`);
  }
}
