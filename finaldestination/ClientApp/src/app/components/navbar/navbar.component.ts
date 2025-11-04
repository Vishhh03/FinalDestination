import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="container">
        <a routerLink="/" class="nav-brand">
          <i class="fas fa-hotel"></i>
          <span>Final Destination</span>
        </a>
        <ul class="nav-menu">
          <li><a routerLink="/">Home</a></li>
          <li><a routerLink="/hotels">Hotels</a></li>
          @if (authService.currentUser()) {
            <li><a routerLink="/bookings">My Bookings</a></li>
            <li><a routerLink="/profile">Profile</a></li>
            <li><button (click)="authService.logout()" class="btn-secondary">Logout</button></li>
          } @else {
            <li><a routerLink="/login" class="btn-primary">Login</a></li>
          }
        </ul>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
}
