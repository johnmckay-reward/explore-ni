import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://explore-ni.onrender.com/api/auth';

  // Signal to track current user
  currentUser = signal<User | null>(null);

  // Signal to track authentication token
  private token = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Load user from localStorage on service initialization
    this.loadUserFromStorage();
  }

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      })
    );
  }

  /**
   * Login an existing user
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      })
    );
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser() !== null && this.token() !== null;
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Apply to become a vendor
   */
  applyToBeVendor(): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`https://explore-ni.onrender.com/api/users/apply-vendor`, {}).pipe(
      tap(response => {
        // Update the current user with new role and status
        if (response && response.user) {
          this.currentUser.set(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  /**
   * Update current user data
   */
  updateCurrentUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    this.currentUser.set(response.user);
    this.token.set(response.token);

    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
  }

  /**
   * Load user data from localStorage
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userJson && token) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
        this.token.set(token);
      } catch (e) {
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
  }
}
