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
  isHomePage = false;

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
    // Check if current route is homepage (exact match)
    this.isHomePage = url === '/' || url === '';
    
    // Update navbar class immediately
    if (typeof document !== 'undefined') {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (this.isHomePage) {
          // Homepage: transparent navbar that blends with hero
          navbar.classList.add('home-page');
          navbar.classList.remove('solid-page');
          if (window.scrollY <= 50) {
            navbar.classList.remove('scrolled');
          }
        } else {
          // Other pages: solid sticky navbar
          navbar.classList.remove('home-page');
          navbar.classList.add('solid-page');
          navbar.classList.add('scrolled');
        }
      }
    }
  }

  onScroll() {
    // Only apply scroll effect on homepage
    if (!this.isHomePage) return;
    
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
