import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthResponse, User } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  private loadUser() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expiresAt');
    
    if (userStr && token && expiresAt) {
      // Check if token is expired
      const expiry = new Date(expiresAt);
      if (expiry > new Date()) {
        this.currentUser.set(JSON.parse(userStr));
        // Refresh user data from server
        this.refreshUserData();
      } else {
        // Token expired, clear storage
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuth(response)),
        catchError(this.handleError)
      );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => this.handleAuth(response)),
        catchError(this.handleError)
      );
  }

  refreshUserData(): void {
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
      },
      error: (err: any) => {
        console.error('Failed to refresh user data:', err);
        // If unauthorized, clear auth
        if (err.status === 401) {
          this.clearAuth();
        }
      }
    });
  }

  private handleAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('expiresAt', response.expiresAt);
    this.currentUser.set(response.user);
  }

  private clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
    this.currentUser.set(null);
  }

  logout() {
    this.clearAuth();
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresAt = localStorage.getItem('expiresAt');
    
    if (!token || !expiresAt) {
      return false;
    }
    
    // Check if token is expired
    const expiry = new Date(expiresAt);
    if (expiry <= new Date()) {
      this.clearAuth();
      return false;
    }
    
    return true;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.details) {
        errorMessage = error.error.details;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
    
    return throwError(() => ({ message: errorMessage, status: error.status, error: error.error }));
  }
}
