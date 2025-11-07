import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, User } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expiresAt');
    
    if (userStr && token && expiresAt && new Date(expiresAt) > new Date()) {
      this.currentUser.set(JSON.parse(userStr));
      this.refreshUserData();
    } else {
      this.clearAuth();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const response = await this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).toPromise();
    if (response) this.saveAuth(response);
  }

  async register(data: any): Promise<void> {
    const response = await this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).toPromise();
    if (response) this.saveAuth(response);
  }

  async refreshUserData(): Promise<void> {
    try {
      const user = await this.http.get<User>(`${this.apiUrl}/me`).toPromise();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
      }
    } catch (error: any) {
      if (error.status === 401) this.clearAuth();
    }
  }

  private saveAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('expiresAt', response.expiresAt);
    this.currentUser.set(response.user);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
    this.currentUser.set(null);
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresAt = localStorage.getItem('expiresAt');
    
    if (!token || !expiresAt) return false;
    
    if (new Date(expiresAt) <= new Date()) {
      this.clearAuth();
      return false;
    }
    
    return true;
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }
}
