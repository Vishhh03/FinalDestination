import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, User } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:5001/api/auth';
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expiresAt');
    
    if (userStr && token && expiresAt && new Date(expiresAt) > new Date()) {
      const user = JSON.parse(userStr);
      const normalizedUser = this.normalizeUserRole(user);
      this.currentUser.set(normalizedUser);
      this.refreshUserData();
    } else {
      this.clearAuth();
    }
  }

  /**
   * WORKAROUND: Convert numeric role enum to string
   * Backend should send strings, but if it sends numbers, convert them
   */
  private normalizeUserRole(user: User): User {
    if (typeof user.role === 'number') {
      console.warn('⚠️ [AUTH] Role is numeric, converting to string. Backend should be restarted!');
      const roleMap: { [key: number]: string } = {
        1: 'Guest',
        2: 'HotelManager',
        3: 'Admin'
      };
      return {
        ...user,
        role: roleMap[user.role as any] || 'Guest'
      };
    }
    return user;
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
        const normalizedUser = this.normalizeUserRole(user);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        this.currentUser.set(normalizedUser);
      }
    } catch (error: any) {
      if (error.status === 401) this.clearAuth();
    }
  }

  private saveAuth(response: AuthResponse): void {
    const user = this.normalizeUserRole(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('expiresAt', response.expiresAt);
    this.currentUser.set(user);
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
    const user = this.currentUser();
    if (!user) return false;
    const userRole = typeof user.role === 'string' ? user.role : String(user.role);
    return userRole === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const userRole = typeof user.role === 'string' ? user.role : String(user.role);
    return roles.includes(userRole);
  }
}
