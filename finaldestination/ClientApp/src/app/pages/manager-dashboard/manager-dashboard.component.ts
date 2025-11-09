import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../services/auth.service';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {
  hotels = signal<Hotel[]>([]);
  selectedHotel = signal<Hotel | null>(null);
  showForm = signal(false);
  showDeleteModal = signal(false);
  hotelToDelete = signal<Hotel | null>(null);
  isEditing = signal(false);
  error = signal('');
  success = signal('');
  loading = signal(false);

  name = '';
  address = '';
  city = '';
  pricePerNight = 0;
  availableRooms = 0;
  rating = 0;

  constructor(
    private hotelService: HotelService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!this.auth.hasAnyRole(['HotelManager', 'Admin'])) {
      this.router.navigate(['/']);
      return;
    }
    await this.loadHotels();
  }

  async loadHotels() {
    this.loading.set(true);
    try {
      const hotels = await this.hotelService.getMyHotels();
      this.hotels.set(hotels);
    } catch (err: any) {
      this.error.set('Failed to load hotels');
    } finally {
      this.loading.set(false);
    }
  }

  showAddForm() {
    this.isEditing.set(false);
    this.selectedHotel.set(null);
    this.name = '';
    this.address = '';
    this.city = '';
    this.pricePerNight = 0;
    this.availableRooms = 0;
    this.rating = 0;
    this.showForm.set(true);
    this.error.set('');
  }

  editHotel(hotel: Hotel) {
    this.isEditing.set(true);
    this.selectedHotel.set(hotel);
    this.name = hotel.name;
    this.address = hotel.address;
    this.city = hotel.city;
    this.pricePerNight = hotel.pricePerNight;
    this.availableRooms = hotel.availableRooms;
    this.rating = hotel.rating;
    this.showForm.set(true);
    this.error.set('');
  }

  cancelForm() {
    this.showForm.set(false);
    this.selectedHotel.set(null);
    this.error.set('');
  }

  async saveHotel() {
    if (!this.name || !this.address || !this.city) {
      this.error.set('Please fill in all required fields');
      return;
    }

    if (this.pricePerNight < 1 || this.availableRooms < 1) {
      this.error.set('Price and rooms must be greater than 0');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const hotelData = {
      name: this.name,
      address: this.address,
      city: this.city,
      pricePerNight: this.pricePerNight,
      availableRooms: this.availableRooms,
      rating: this.rating,
      imageUrl: this.selectedHotel()?.imageUrl || null,
      images: this.selectedHotel()?.images || null,
      managerId: this.selectedHotel()?.managerId || null
    };

    try {
      if (this.isEditing() && this.selectedHotel()) {
        await this.hotelService.update(this.selectedHotel()!.id, hotelData);
        this.success.set('Hotel updated successfully');
      } else {
        await this.hotelService.create(hotelData);
        this.success.set('Hotel created successfully');
      }
      this.showForm.set(false);
      await this.loadHotels();
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to save hotel');
    } finally {
      this.loading.set(false);
    }
  }

  confirmDelete(hotel: Hotel) {
    this.hotelToDelete.set(hotel);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.hotelToDelete.set(null);
  }

  async deleteHotel() {
    const hotel = this.hotelToDelete();
    if (!hotel) return;

    this.loading.set(true);
    try {
      await this.hotelService.delete(hotel.id);
      this.success.set('Hotel deleted successfully');
      this.showDeleteModal.set(false);
      this.hotelToDelete.set(null);
      await this.loadHotels();
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to delete hotel');
      this.showDeleteModal.set(false);
    } finally {
      this.loading.set(false);
    }
  }
}
