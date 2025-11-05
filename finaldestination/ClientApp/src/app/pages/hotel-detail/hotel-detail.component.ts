import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HotelService } from '../../services/hotel.service';
import { BookingService } from '../../services/booking.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Hotel, Review } from '../../models/hotel.model';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './hotel-detail.component.html'
})
export class HotelDetailComponent implements OnInit {
  hotelService = inject(HotelService);
  bookingService = inject(BookingService);
  reviewService = inject(ReviewService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  
  hotel = signal<Hotel | null>(null);
  reviews = signal<Review[]>([]);
  error = signal('');
  success = signal('');
  loading = signal(false);

  // Get today's date for min date validation
  today = new Date().toISOString().split('T')[0];
  tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  bookingForm: FormGroup = this.fb.group({
    checkInDate: ['', [Validators.required]],
    checkOutDate: ['', [Validators.required]],
    numberOfGuests: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
  });

  reviewForm: FormGroup = this.fb.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
  });

  get checkInDate() { return this.bookingForm.get('checkInDate'); }
  get checkOutDate() { return this.bookingForm.get('checkOutDate'); }
  get numberOfGuests() { return this.bookingForm.get('numberOfGuests'); }
  get rating() { return this.reviewForm.get('rating'); }
  get comment() { return this.reviewForm.get('comment'); }

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    
    this.hotelService.getById(id).subscribe({
      next: (hotel) => {
        this.hotel.set(hotel);
      },
      error: () => this.error.set('Hotel not found')
    });
    
    this.reviewService.getHotelReviews(id).subscribe({
      next: (reviews) => this.reviews.set(reviews),
      error: () => console.log('No reviews found')
    });

    // Add custom validator for check-out date
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => {
      this.bookingForm.get('checkOutDate')?.updateValueAndValidity();
    });
  }

  getBookingErrorMessage(field: string): string {
    const control = this.bookingForm.get(field);
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return `${field === 'checkInDate' ? 'Check-in date' : field === 'checkOutDate' ? 'Check-out date' : 'Number of guests'} is required`;
    }
    if (control.hasError('min')) {
      return `Minimum ${control.errors?.['min'].min} guest required`;
    }
    if (control.hasError('max')) {
      return `Maximum ${control.errors?.['max'].max} guests allowed`;
    }
    return '';
  }

  getReviewErrorMessage(field: string): string {
    const control = this.reviewForm.get(field);
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return `${field === 'rating' ? 'Rating' : 'Comment'} is required`;
    }
    if (control.hasError('minlength')) {
      return `Comment must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control.hasError('maxlength')) {
      return `Comment must not exceed ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  bookHotel() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Mark all fields as touched to show validation errors
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.bookingForm.get(key)?.markAsTouched();
    });

    if (this.bookingForm.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    // Additional date validation
    const checkIn = new Date(this.bookingForm.value.checkInDate);
    const checkOut = new Date(this.bookingForm.value.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      this.error.set('Check-in date cannot be in the past');
      return;
    }

    if (checkOut <= checkIn) {
      this.error.set('Check-out date must be after check-in date');
      return;
    }

    const user = this.authService.currentUser();
    const bookingData = {
      hotelId: this.hotel()!.id,
      checkInDate: this.bookingForm.value.checkInDate,
      checkOutDate: this.bookingForm.value.checkOutDate,
      numberOfGuests: this.bookingForm.value.numberOfGuests,
      guestName: user?.name || '',
      guestEmail: user?.email || ''
    };
    
    this.loading.set(true);
    this.error.set('');
    
    this.bookingService.create(bookingData).subscribe({
      next: (booking) => {
        this.success.set('Booking created successfully! Redirecting to your bookings...');
        setTimeout(() => {
          this.router.navigate(['/bookings']);
        }, 2000);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.error?.details || 'Booking failed. Please try again.');
        this.loading.set(false);
      }
    });
  }

  submitReview() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Mark all fields as touched to show validation errors
    Object.keys(this.reviewForm.controls).forEach(key => {
      this.reviewForm.get(key)?.markAsTouched();
    });

    if (this.reviewForm.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }
    
    this.error.set('');
    const reviewData = {
      hotelId: this.hotel()!.id,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
    };

    this.reviewService.submit(reviewData).subscribe({
      next: (review) => {
        const currentReviews = this.reviews();
        this.reviews.set([review, ...currentReviews]);
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.success.set('Review submitted successfully!');
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to submit review')
    });
  }

  calculateNights(): number {
    const checkIn = this.bookingForm.value.checkInDate;
    const checkOut = this.bookingForm.value.checkOutDate;
    
    if (!checkIn || !checkOut) {
      return 0;
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  calculateTotal(): number {
    const hotel = this.hotel();
    if (!hotel) return 0;
    return this.calculateNights() * hotel.pricePerNight;
  }
}
