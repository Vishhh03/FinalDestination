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
    
    console.log('🔍 [AUTH] Loading user from storage:', {
      hasUser: !!userStr,
      hasToken: !!token,
      expiresAt,
      isExpired: expiresAt ? new Date(expiresAt) <= new Date() : 'N/A'
    });
    
    if (userStr && token && expiresAt && new Date(expiresAt) > new Date()) {
      const user = JSON.parse(userStr);
      console.log('✅ [AUTH] User loaded from storage:', user);
      console.log('🎭 [AUTH] User role:', user.role, 'Type:', typeof user.role);
      this.currentUser.set(user);
      this.refreshUserData();
    } else {
      console.log('❌ [AUTH] No valid user in storage, clearing auth');
      this.clearAuth();
    }
  }

  async login(email: string, password: string): Promise<void> {
    console.log('🔐 [AUTH] Attempting login for:', email);
    const response = await this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).toPromise();
    console.log('📥 [AUTH] Login response received:', response);
    console.log('🎭 [AUTH] User role from server:', response?.user?.role, 'Type:', typeof response?.user?.role);
    if (response) this.saveAuth(response);
  }

  async register(data: any): Promise<void> {
    const response = await this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).toPromise();
    if (response) this.saveAuth(response);
  }

  async refreshUserData(): Promise<void> {
    try {
      console.log('🔄 [AUTH] Refreshing user data from server...');
      const user = await this.http.get<User>(`${this.apiUrl}/me`).toPromise();
      if (user) {
        console.log('📥 [AUTH] Refreshed user data:', user);
        console.log('🎭 [AUTH] Refreshed user role:', user.role, 'Type:', typeof user.role);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
      }
    } catch (error: any) {
      console.error('❌ [AUTH] Error refreshing user data:', error);
      if (error.status === 401) this.clearAuth();
    }
  }

  private saveAuth(response: AuthResponse): void {
    console.log('💾 [AUTH] Saving auth to localStorage:', response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('expiresAt', response.expiresAt);
    this.currentUser.set(response.user);
    console.log('✅ [AUTH] Auth saved, current user role:', response.user.role);
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
    const result = user?.role === role;
    console.log(`🔍 [AUTH] hasRole('${role}'):`, {
      currentRole: user?.role,
      roleType: typeof user?.role,
      expectedRole: role,
      expectedType: typeof role,
      result
    });
    return result;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    const result = user ? roles.includes(user.role) : false;
    console.log(`🔍 [AUTH] hasAnyRole([${roles.join(', ')}]):`, {
      currentRole: user?.role,
      roleType: typeof user?.role,
      expectedRoles: roles,
      result
    });
    return result;
  }
}
