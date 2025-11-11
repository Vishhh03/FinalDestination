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
  imageUrl = '';
  selectedFile: File | null = null;
  imagePreview = '';
  uploading = signal(false);
  imageRemoved = false;

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
    this.imageUrl = '';
    this.imagePreview = '';
    this.selectedFile = null;
    this.imageRemoved = false;
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
    this.imageUrl = hotel.imageUrl || '';
    this.imagePreview = hotel.imageUrl || '';
    this.selectedFile = null;
    this.imageRemoved = false;
    this.showForm.set(true);
    this.error.set('');
  }

  cancelForm() {
    this.showForm.set(false);
    this.selectedHotel.set(null);
    this.selectedFile = null;
    this.imagePreview = '';
    this.imageRemoved = false;
    this.error.set('');
  }

  removeImage() {
    this.imagePreview = '';
    this.selectedFile = null;
    this.imageUrl = '';
    this.imageRemoved = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.error.set('Invalid file type. Please upload JPG, PNG, or WebP images.');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('File size exceeds 5MB limit.');
        return;
      }

      this.selectedFile = file;
      
      // Show preview
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

    try {
      // Determine final image URL
      let finalImageUrl: string | null = null;

      // For editing: start with existing image
      if (this.isEditing() && this.selectedHotel()) {
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
          return; // Upload failed, error already set
        }
      }

      // Get current user ID for manager assignment
      const currentUserId = this.auth.currentUser()?.id;
      
      const hotelData: any = {
        name: this.name,
        address: this.address,
        city: this.city,
        pricePerNight: this.pricePerNight,
        availableRooms: this.availableRooms,
        imageUrl: finalImageUrl,
        images: this.isEditing() && this.selectedHotel() ? this.selectedHotel()!.images : null,
        managerId: this.isEditing() && this.selectedHotel() ? this.selectedHotel()!.managerId : currentUserId
      };

      // Only include rating for create, not update
      if (!this.isEditing()) {
        hotelData.rating = 0;
      }

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
