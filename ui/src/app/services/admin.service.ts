import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from './auth.service';
import { Experience } from './experience.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

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
   * Get users by status
   */
  getUsers(status?: string): Observable<User[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<User[]>(`${this.apiUrl}/users${params}`, { headers: this.getHeaders() });
  }

  /**
   * Approve a pending vendor
   */
  approveVendor(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/approve`, {}, { headers: this.getHeaders() });
  }

  /**
   * Reject a pending vendor
   */
  rejectVendor(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/reject`, {}, { headers: this.getHeaders() });
  }

  /**
   * Get experiences by status
   */
  getExperiences(status?: string): Observable<Experience[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<Experience[]>(`${this.apiUrl}/experiences${params}`, { headers: this.getHeaders() });
  }

  /**
   * Approve a pending experience
   */
  approveExperience(experienceId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/experiences/${experienceId}/approve`, {}, { headers: this.getHeaders() });
  }

  /**
   * Reject a pending experience
   */
  rejectExperience(experienceId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/experiences/${experienceId}/reject`, {}, { headers: this.getHeaders() });
  }
}
