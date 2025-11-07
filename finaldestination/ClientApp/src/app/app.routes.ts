import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'hotels',
    loadComponent: () => import('./pages/hotels/hotels.component').then(m => m.HotelsComponent)
  },
  {
    path: 'hotels/:id',
    loadComponent: () => import('./pages/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent)
  },
  {
    path: 'bookings',
    loadComponent: () => import('./pages/bookings/bookings.component').then(m => m.BookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
    },
  {
      path: 'manager-dashboard',
      loadComponent: () => import('./pages/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
