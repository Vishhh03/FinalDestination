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
  hotelService = inject(HotelService);
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  hotels = signal<Hotel[]>([]);
  selectedHotel = signal<Hotel | null>(null);
  showForm = signal(false);
  isEditing = signal(false);
  error = signal('');
  success = signal('');
  loading = signal(false);

  hotelForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    pricePerNight: [0, [Validators.required, Validators.min(1), Validators.max(10000)]],
    availableRooms: [0, [Validators.required, Validators.min(1), Validators.max(1000)]],
    rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]]
  });

  ngOnInit() {
    this.loadHotels();
  }

  loadHotels() {
    this.loading.set(true);
    this.hotelService.getMyHotels().subscribe({
      next: (hotels) => {
        this.hotels.set(hotels);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load hotels');
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
    if (this.hotelForm.invalid) {
      Object.keys(this.hotelForm.controls).forEach(key => {
        this.hotelForm.get(key)?.markAsTouched();
      });
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const hotelData = this.hotelForm.value;

    if (this.isEditing() && this.selectedHotel()) {
      this.hotelService.update(this.selectedHotel()!.id, hotelData).subscribe({
        next: () => {
          this.success.set('Hotel updated successfully');
          this.loading.set(false);
          this.showForm.set(false);
          this.loadHotels();
          setTimeout(() => this.success.set(''), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update hotel');
          this.loading.set(false);
        }
      });
    } else {
      this.hotelService.create(hotelData).subscribe({
        next: () => {
          this.success.set('Hotel created successfully');
          this.loading.set(false);
          this.showForm.set(false);
          this.loadHotels();
          setTimeout(() => this.success.set(''), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create hotel');
          this.loading.set(false);
        }
      });
    }
  }

  deleteHotel(hotel: Hotel) {
    if (!confirm(`Are you sure you want to delete ${hotel.name}?`)) {
      return;
    }

    this.loading.set(true);
    this.hotelService.delete(hotel.id).subscribe({
      next: () => {
        this.success.set('Hotel deleted successfully');
        this.loading.set(false);
        this.loadHotels();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete hotel');
        this.loading.set(false);
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.hotelForm.get(field);
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return `${this.getFieldLabel(field)} is required`;
    }
    if (control.hasError('minlength')) {
      return `${this.getFieldLabel(field)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control.hasError('maxlength')) {
      return `${this.getFieldLabel(field)} must not exceed ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    if (control.hasError('min')) {
      return `${this.getFieldLabel(field)} must be at least ${control.errors?.['min'].min}`;
    }
    if (control.hasError('max')) {
      return `${this.getFieldLabel(field)} must not exceed ${control.errors?.['max'].max}`;
    }
    return '';
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
}
