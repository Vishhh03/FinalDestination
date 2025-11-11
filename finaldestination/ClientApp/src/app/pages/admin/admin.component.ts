import { Component, OnInit, inject, signal } from '@angular/core';
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

    private readonly http = inject(HttpClient);
    private readonly hotelService = inject(HotelService);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

  // Tab management
  activeTab = signal<'dashboard' | 'hotels' | 'users'>('dashboard');
  
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
    managerId: null as number | null
  };
  
  selectedFile: File | null = null;
  imagePreview = '';
  uploading = signal(false);
  imageRemoved = false;

  ngOnInit() {
    if (!this.auth.hasRole('Admin')) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loadHotels();
    this.loadUsers();
  }

  setActiveTab(tab: 'dashboard' | 'hotels' | 'users') {
    this.activeTab.set(tab);
    this.error.set('');
    this.success.set('');
  }

  getTopCities() {
    const cityCount = this.hotels().reduce((acc, hotel) => {
      acc[hotel.city] = (acc[hotel.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cityCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getTopRatedHotels() {
    return [...this.hotels()]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }

  getGuestCount() {
    return this.users().filter(u => u.role === 'Guest').length;
  }

  getManagerCount() {
    return this.users().filter(u => u.role === 'HotelManager').length;
  }

  getAdminCount() {
    return this.users().filter(u => u.role === 'Admin').length;
  }

  getGuestPercentage() {
    const total = this.users().length;
    return total > 0 ? (this.getGuestCount() / total * 100) : 0;
  }

  getActiveUserCount() {
    return this.users().filter(u => u.isActive).length;
  }

  getPieChartStyle() {
    const guestPct = this.getGuestPercentage();
    const managerPct = this.getManagerPercentage();
    const guestEnd = guestPct;
    const managerEnd = guestEnd + managerPct;
    
    return {
      background: `conic-gradient(
        #667eea 0% ${guestEnd}%,
        #f5576c ${guestEnd}% ${managerEnd}%,
        #4facfe ${managerEnd}% 100%
      )`
    };
  }

  getManagerPercentage() {
    const total = this.users().length;
    return total > 0 ? (this.getManagerCount() / total * 100) : 0;
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
      managerId: null
    };
    this.imagePreview = '';
    this.selectedFile = null;
    this.imageRemoved = false;
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
      managerId: hotel.managerId || null
    };
    this.imagePreview = hotel.imageUrl || '';
    this.selectedFile = null;
    this.imageRemoved = false;
    this.showHotelForm.set(true);
    this.error.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelHotelForm() {
    this.showHotelForm.set(false);
    this.selectedHotel.set(null);
    this.selectedFile = null;
    this.imagePreview = '';
    this.imageRemoved = false;
    this.error.set('');
  }

  removeImage() {
    this.imagePreview = '';
    this.selectedFile = null;
    this.imageRemoved = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.error.set('Invalid file type. Please upload JPG, PNG, or WebP images.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.error.set('File size exceeds 5MB limit.');
        return;
      }

      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      this.error.set('');
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) return null;

    this.uploading.set(true);
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      const response = await fetch('https://localhost:5001/api/upload/hotel-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (err: any) {
      this.error.set(err.message || 'Failed to upload image');
      return null;
    } finally {
      this.uploading.set(false);
    }
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

    try {
      // Determine final image URL
      let finalImageUrl: string | null = null;

      // For editing: start with existing image
      if (this.isEditingHotel() && this.selectedHotel()) {
        finalImageUrl = this.selectedHotel()!.imageUrl || null;
      }

      // If user removed the image, set to null
      if (this.imageRemoved) {
        finalImageUrl = null;
      }
      // If user uploaded a new image, use that
      else if (this.selectedFile) {
        const newImageUrl = await this.uploadImage();
        if (newImageUrl) {
          finalImageUrl = newImageUrl;
        } else {
          this.loading.set(false);
          return;
        }
      }

      const hotelData = {
        ...this.hotelForm,
        rating: 0, // Always 0, will be calculated from reviews
        imageUrl: finalImageUrl,
        images: this.isEditingHotel() && this.selectedHotel() ? this.selectedHotel()!.images : null
      };

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
      const users = await this.http.get<AdminUser[]>('https://localhost:5001/api/admin/users').toPromise();
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
      await this.http.put(`https://localhost:5001/api/admin/users/${user.id}/role`, { role: newRole }).toPromise();
      this.success.set(`Updated ${user.name}'s role to ${newRole}`);
      await this.loadUsers();
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set('Failed to update user role');
      await this.loadUsers();
    }
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://localhost:5001${imageUrl}`;
  }
}
