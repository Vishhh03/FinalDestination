import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/hotel.model';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  contactNumber?: string;
  createdAt: string;
  isActive: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // Tab management
  activeTab = signal<'hotels' | 'users'>('hotels');
  
  // Hotels management
  hotels = signal<Hotel[]>([]);
  selectedHotel = signal<Hotel | null>(null);
  showHotelForm = signal(false);
  isEditingHotel = signal(false);
  
  // Users management
  users = signal<AdminUser[]>([]);
  
  // UI state
  error = signal('');
  success = signal('');
  loading = signal(false);
  
  // Hotel form
  hotelForm = {
    name: '',
    address: '',
    city: '',
    pricePerNight: 0,
    availableRooms: 0,
    rating: 0,
    managerId: null as number | null
  };

  constructor(
    private http: HttpClient,
    private hotelService: HotelService,
    public auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!this.auth.hasRole('Admin')) {
      this.router.navigate(['/']);
      return;
    }
    
    await this.loadHotels();
    await this.loadUsers();
  }

  setActiveTab(tab: 'hotels' | 'users') {
    this.activeTab.set(tab);
    this.error.set('');
    this.success.set('');
  }

  // Hotels Management
  async loadHotels() {
    this.loading.set(true);
    try {
      const hotels = await this.hotelService.getAll();
      this.hotels.set(hotels);
    } catch (err: any) {
      this.error.set('Failed to load hotels');
    } finally {
      this.loading.set(false);
    }
  }

  showAddHotelForm() {
    this.isEditingHotel.set(false);
    this.selectedHotel.set(null);
    this.hotelForm = {
      name: '',
      address: '',
      city: '',
      pricePerNight: 0,
      availableRooms: 0,
      rating: 0,
      managerId: null
    };
    this.showHotelForm.set(true);
    this.error.set('');
  }

  editHotel(hotel: Hotel) {
    this.isEditingHotel.set(true);
    this.selectedHotel.set(hotel);
    this.hotelForm = {
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      pricePerNight: hotel.pricePerNight,
      availableRooms: hotel.availableRooms,
      rating: hotel.rating,
      managerId: hotel.managerId || null
    };
    this.showHotelForm.set(true);
    this.error.set('');
  }

  cancelHotelForm() {
    this.showHotelForm.set(false);
    this.selectedHotel.set(null);
    this.error.set('');
  }

  async saveHotel() {
    if (!this.hotelForm.name || !this.hotelForm.address || !this.hotelForm.city) {
      this.error.set('Please fill in all required fields');
      return;
    }

    if (this.hotelForm.pricePerNight < 1 || this.hotelForm.availableRooms < 1) {
      this.error.set('Price and rooms must be greater than 0');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const hotelData = {
      ...this.hotelForm,
      imageUrl: this.selectedHotel()?.imageUrl || null,
      images: this.selectedHotel()?.images || null
    };

    try {
      if (this.isEditingHotel() && this.selectedHotel()) {
        await this.hotelService.update(this.selectedHotel()!.id, hotelData);
        this.success.set('Hotel updated successfully');
      } else {
        await this.hotelService.create(hotelData);
        this.success.set('Hotel created successfully');
      }
      this.showHotelForm.set(false);
      await this.loadHotels();
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to save hotel');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteHotel(hotel: Hotel) {
    if (!confirm(`Are you sure you want to delete "${hotel.name}"? This action cannot be undone.`)) {
      return;
    }

    this.loading.set(true);
    try {
      await this.hotelService.delete(hotel.id);
      this.success.set('Hotel deleted successfully');
      await this.loadHotels();
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to delete hotel');
    } finally {
      this.loading.set(false);
    }
  }

  // Users Management
  async loadUsers() {
    this.loading.set(true);
    try {
      const users = await this.http.get<AdminUser[]>('/api/admin/users').toPromise();
      if (users) this.users.set(users);
    } catch (err: any) {
      this.error.set('Failed to load users');
    } finally {
      this.loading.set(false);
    }
  }

  async updateUserRole(user: AdminUser, newRole: string) {
    if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      await this.loadUsers(); // Reload to reset dropdown
      return;
    }

    try {
      await this.http.put(`/api/admin/users/${user.id}/role`, { role: newRole }).toPromise();
      this.success.set(`Updated ${user.name}'s role to ${newRole}`);
      await this.loadUsers();
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set('Failed to update user role');
      await this.loadUsers();
    }
  }
}
