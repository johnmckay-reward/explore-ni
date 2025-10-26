import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  phoneNumber?: string;
  notificationPreference: 'email' | 'sms' | 'both' | 'none';
}

export interface UpdateProfileRequest {
  phoneNumber?: string;
  notificationPreference?: 'email' | 'sms' | 'both' | 'none';
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) { }

  /**
   * Get current user's profile
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  /**
   * Update current user's profile
   */
  updateProfile(request: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http.put<UpdateProfileResponse>(`${this.apiUrl}/profile`, request);
  }
}
