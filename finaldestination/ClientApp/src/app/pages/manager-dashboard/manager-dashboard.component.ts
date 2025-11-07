import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../services/auth.service';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {
  private hotelService = inject(HotelService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  hotels = signal<Hotel[]>([]);
  selectedHotel = signal<Hotel | null>(null);
  showForm = signal(false);
  showDeleteModal = signal(false);
  hotelToDelete = signal<Hotel | null>(null);
  isEditing = signal(false);
  error = signal('');
  success = signal('');
  loading = signal(false);
  submitting = signal(false);

  hotelForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required, 
      Validators.minLength(2), 
      Validators.maxLength(100),
      Validators.pattern(/^[a-zA-Z0-9\s\-&',.]+$/)
    ]],
    address: ['', [
      Validators.required, 
      Validators.minLength(5), 
      Validators.maxLength(200)
    ]],
    city: ['', [
      Validators.required, 
      Validators.minLength(2), 
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z\s\-]+$/)
    ]],
    pricePerNight: [0, [
      Validators.required, 
      Validators.min(1), 
      Validators.max(10000)
    ]],
    availableRooms: [0, [
      Validators.required, 
      Validators.min(1), 
      Validators.max(1000)
    ]],
    rating: [0, [
      Validators.required, 
      Validators.min(0), 
      Validators.max(5)
    ]]
  });

  ngOnInit() {
    // Check if user is authorized
    const user = this.authService.currentUser();
    if (!user || (user.role !== 'HotelManager' && user.role !== 'Admin')) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loadHotels();
  }

  loadHotels() {
    this.loading.set(true);
    this.error.set('');
    
    this.hotelService.getMyHotels().subscribe({
      next: (hotels: Hotel[]) => {
        this.hotels.set(hotels);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Failed to load hotels');
        this.loading.set(false);
      }
    });
  }

  showAddForm() {
    this.isEditing.set(false);
    this.selectedHotel.set(null);
    this.hotelForm.reset({
      name: '',
      address: '',
      city: '',
      pricePerNight: 0,
      availableRooms: 0,
      rating: 0
    });
    this.showForm.set(true);
    this.error.set('');
    this.success.set('');
  }

  editHotel(hotel: Hotel) {
    this.isEditing.set(true);
    this.selectedHotel.set(hotel);
    this.hotelForm.patchValue({
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      pricePerNight: hotel.pricePerNight,
      availableRooms: hotel.availableRooms,
      rating: hotel.rating
    });
    this.showForm.set(true);
    this.error.set('');
    this.success.set('');
  }

  cancelForm() {
    this.showForm.set(false);
    this.selectedHotel.set(null);
    this.hotelForm.reset();
    this.error.set('');
    this.success.set('');
  }

  saveHotel() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.hotelForm.controls).forEach(key => {
      this.hotelForm.get(key)?.markAsTouched();
    });

    if (this.hotelForm.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const hotelData = this.hotelForm.value;

    if (this.isEditing() && this.selectedHotel()) {
      this.hotelService.update(this.selectedHotel()!.id, hotelData).subscribe({
        next: () => {
          this.success.set('Hotel updated successfully');
          this.submitting.set(false);
          this.showForm.set(false);
          this.loadHotels();
          setTimeout(() => this.success.set(''), 3000);
        },
        error: (err: any) => {
          this.error.set(err.message || 'Failed to update hotel');
          this.submitting.set(false);
        }
      });
    } else {
      this.hotelService.create(hotelData).subscribe({
        next: () => {
          this.success.set('Hotel created successfully');
          this.submitting.set(false);
          this.showForm.set(false);
          this.loadHotels();
          setTimeout(() => this.success.set(''), 3000);
        },
        error: (err: any) => {
          this.error.set(err.message || 'Failed to create hotel');
          this.submitting.set(false);
        }
      });
    }
  }

  confirmDelete(hotel: Hotel) {
    this.hotelToDelete.set(hotel);
    this.showDeleteModal.set(true);
    this.error.set('');
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.hotelToDelete.set(null);
  }

  deleteHotel() {
    const hotel = this.hotelToDelete();
    if (!hotel) return;

    this.submitting.set(true);
    this.error.set('');
    
    this.hotelService.delete(hotel.id).subscribe({
      next: () => {
        this.success.set('Hotel deleted successfully');
        this.submitting.set(false);
        this.showDeleteModal.set(false);
        this.hotelToDelete.set(null);
        this.loadHotels();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Failed to delete hotel');
        this.submitting.set(false);
        this.showDeleteModal.set(false);
        this.hotelToDelete.set(null);
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.hotelForm.get(field);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    const errors = control.errors;
    const label = this.getFieldLabel(field);

    if (errors['required']) {
      return `${label} is required`;
    }
    if (errors['minlength']) {
      return `${label} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${label} must not exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `${label} must be at least ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `${label} must not exceed ${errors['max'].max}`;
    }
    if (errors['pattern']) {
      return this.getPatternError(field);
    }

    return 'Invalid value';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      name: 'Hotel name',
      address: 'Address',
      city: 'City',
      pricePerNight: 'Price per night',
      availableRooms: 'Available rooms',
      rating: 'Rating'
    };
    return labels[field] || field;
  }

  private getPatternError(field: string): string {
    const errors: { [key: string]: string } = {
      name: 'Hotel name can only contain letters, numbers, spaces, and basic punctuation',
      city: 'City name can only contain letters, spaces, and hyphens'
    };
    return errors[field] || 'Invalid format';
  }

  hasError(field: string): boolean {
    const control = this.hotelForm.get(field);
    return !!(control && control.touched && control.invalid);
  }
}
