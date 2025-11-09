import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isAuthPage = false;
  
  // Helper for template debugging
  typeof(value: any): string {
    return typeof value;
  }

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);
    
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.url);
      });
    
    // Add scroll listener for navbar background
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  checkRoute(url: string) {
    // Check if current route is login or register
    this.isAuthPage = url.includes('/login') || url.includes('/register');
    
    // Update navbar class immediately
    if (typeof document !== 'undefined') {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (this.isAuthPage) {
          navbar.classList.add('auth-page');
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('auth-page');
          if (window.scrollY <= 50) {
            navbar.classList.remove('scrolled');
          }
        }
      }
    }
  }

  onScroll() {
    // Don't apply scroll effect on auth pages
    if (this.isAuthPage) return;
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }
}
