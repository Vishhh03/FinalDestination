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
      
      // WORKAROUND: Convert numeric role to string if needed
      const normalizedUser = this.normalizeUserRole(user);
      
      this.currentUser.set(normalizedUser);
      this.refreshUserData();
    } else {
      console.log('❌ [AUTH] No valid user in storage, clearing auth');
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
        
        // WORKAROUND: Convert numeric role to string if needed
        const normalizedUser = this.normalizeUserRole(user);
        
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        this.currentUser.set(normalizedUser);
      }
    } catch (error: any) {
      console.error('❌ [AUTH] Error refreshing user data:', error);
      if (error.status === 401) this.clearAuth();
    }
  }

  private saveAuth(response: AuthResponse): void {
    console.log('💾 [AUTH] Saving auth to localStorage:', response.user);
    
    // WORKAROUND: Convert numeric role to string if needed
    const user = this.normalizeUserRole(response.user);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('expiresAt', response.expiresAt);
    this.currentUser.set(user);
    console.log('✅ [AUTH] Auth saved, current user role:', user.role);
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
    
    // Ensure role is a string (it should be after normalization)
    const userRole = typeof user.role === 'string' ? user.role : String(user.role);
    const result = userRole === role;
    
    console.log(`🔍 [AUTH] hasRole('${role}'):`, {
      currentRole: userRole,
      roleType: typeof userRole,
      expectedRole: role,
      expectedType: typeof role,
      result
    });
    return result;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    // Ensure role is a string (it should be after normalization)
    const userRole = typeof user.role === 'string' ? user.role : String(user.role);
    const result = roles.includes(userRole);
    
    console.log(`🔍 [AUTH] hasAnyRole([${roles.join(', ')}]):`, {
      currentRole: userRole,
      roleType: typeof userRole,
      expectedRoles: roles,
      result
    });
    return result;
  }
}
