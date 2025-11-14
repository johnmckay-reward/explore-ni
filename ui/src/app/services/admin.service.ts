import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from './auth.service';
import { Experience } from './experience.service';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl + '/admin';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get users by status
   */
  getUsers(status?: string): Observable<User[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<User[]>(`${this.apiUrl}/users${params}`);
  }

  /**
   * Approve a pending vendor
   */
  approveVendor(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/approve`, {});
  }

  /**
   * Reject a pending vendor
   */
  rejectVendor(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/reject`, {});
  }

  /**
   * Get experiences by status
   */
  getExperiences(status?: string): Observable<Experience[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<Experience[]>(`${this.apiUrl}/experiences${params}`);
  }

  /**
   * Approve a pending experience
   */
  approveExperience(experienceId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/experiences/${experienceId}/approve`, {});
  }

  /**
   * Reject a pending experience
   */
  rejectExperience(experienceId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/experiences/${experienceId}/reject`, {});
  }
}
