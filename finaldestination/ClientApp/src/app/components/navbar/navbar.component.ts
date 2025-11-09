import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  authService = inject(AuthService);
  
  // Helper for template debugging
  typeof(value: any): string {
    return typeof value;
  }

  ngOnInit() {
    console.log('🧭 [NAVBAR] Component initialized');
    console.log('🧭 [NAVBAR] Current user:', this.authService.currentUser());
    console.log('🧭 [NAVBAR] Is authenticated:', this.authService.isAuthenticated());
    console.log('🧭 [NAVBAR] Has HotelManager role:', this.authService.hasRole('HotelManager'));
    console.log('🧭 [NAVBAR] Has any role [HotelManager, Admin]:', this.authService.hasAnyRole(['HotelManager', 'Admin']));
  }
}
