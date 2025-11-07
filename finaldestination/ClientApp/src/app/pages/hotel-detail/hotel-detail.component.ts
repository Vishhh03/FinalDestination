import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.css']
})
export class HotelDetailComponent implements OnInit {
  private hotelService = inject(HotelService);
  private bookingService = inject(BookingService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  hotel = signal<Hotel | null>(null);
  reviews = signal<Review[]>([]);
  error = signal('');
  success = signal('');
  loading = signal(false);
  submittingBooking = signal(false);
  submittingReview = signal(false);
  showBookingModal = signal(false);

  // Get today's date for min date validation
  today = new Date().toISOString().split('T')[0];
  tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  bookingForm: FormGroup = this.fb.group({
    checkInDate: ['', [Validators.required]],
    checkOutDate: ['', [Validators.required]],
    numberOfGuests: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    pointsToRedeem: [0, [Validators.min(0)]]
  });

  reviewForm: FormGroup = this.fb.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
  });

  // Computed values
  nights = computed(() => this.calculateNights());
  totalAmount = computed(() => this.calculateTotal());
  availablePoints = computed(() => this.authService.currentUser()?.loyaltyAccount?.pointsBalance || 0);
  maxRedeemablePoints = computed(() => {
    const points = this.availablePoints();
    const total = this.totalAmount();
    // Assuming 100 points = $1 discount, max 50% of total
    const maxPointsForDiscount = Math.floor(total * 50); // 50% of total in points
    return Math.min(points, maxPointsForDiscount);
  });
  discount = computed(() => {
    const points = this.bookingForm.get('pointsToRedeem')?.value || 0;
    return points / 100; // 100 points = $1
  });
  finalAmount = computed(() => Math.max(0, this.totalAmount() - this.discount()));

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.loadHotelDetails(id);
    this.loadReviews(id);

    // Add custom validator for check-out date
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => {
      this.bookingForm.get('checkOutDate')?.updateValueAndValidity();
    });

    // Validate points redemption
    this.bookingForm.get('pointsToRedeem')?.valueChanges.subscribe((value: number) => {
      if (value > this.maxRedeemablePoints()) {
        this.bookingForm.get('pointsToRedeem')?.setValue(this.maxRedeemablePoints(), { emitEvent: false });
      }
    });
  }

  loadHotelDetails(id: number) {
    this.loading.set(true);
    this.hotelService.getById(id).subscribe({
      next: (hotel: Hotel) => {
        this.hotel.set(hotel);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Hotel not found');
        this.loading.set(false);
      }
    });
  }

  loadReviews(id: number) {
    this.reviewService.getHotelReviews(id).subscribe({
      next: (reviews: Review[]) => this.reviews.set(reviews),
      error: () => console.log('No reviews found')
    });
  }

  openBookingModal() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.showBookingModal.set(true);
    this.error.set('');
    this.success.set('');
  }

  closeBookingModal() {
    this.showBookingModal.set(false);
    this.bookingForm.reset({
      checkInDate: '',
      checkOutDate: '',
      numberOfGuests: 1,
      pointsToRedeem: 0
    });
    this.error.set('');
  }

  bookHotel() {
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

    const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      this.error.set('Booking duration cannot exceed 365 days');
      return;
    }

    const user = this.authService.currentUser();
    const pointsToRedeem = this.bookingForm.value.pointsToRedeem || 0;

    const bookingData = {
      hotelId: this.hotel()!.id,
      checkInDate: this.bookingForm.value.checkInDate,
      checkOutDate: this.bookingForm.value.checkOutDate,
      numberOfGuests: this.bookingForm.value.numberOfGuests,
      guestName: user?.name || '',
      guestEmail: user?.email || '',
      pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : null
    };
    
    this.submittingBooking.set(true);
    this.error.set('');
    
    this.bookingService.create(bookingData).subscribe({
      next: (booking: any) => {
        this.success.set('Booking created successfully! Redirecting to your bookings...');
        this.submittingBooking.set(false);
        setTimeout(() => {
          this.router.navigate(['/bookings']);
        }, 2000);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Booking failed. Please try again.');
        this.submittingBooking.set(false);
      }
    });
  }

  submitReview() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
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
    
    this.submittingReview.set(true);
    this.error.set('');
    
    const reviewData = {
      hotelId: this.hotel()!.id,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
    };

    this.reviewService.submit(reviewData).subscribe({
      next: (review: Review) => {
        const currentReviews = this.reviews();
        this.reviews.set([review, ...currentReviews]);
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.success.set('Review submitted successfully!');
        this.submittingReview.set(false);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Failed to submit review');
        this.submittingReview.set(false);
      }
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

  getBookingErrorMessage(field: string): string {
    const control = this.bookingForm.get(field);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return this.getFieldLabel(field) + ' is required';
    }
    if (errors['min']) {
      return `Minimum ${errors['min'].min} ${field === 'numberOfGuests' ? 'guest' : ''} required`;
    }
    if (errors['max']) {
      return `Maximum ${errors['max'].max} ${field === 'numberOfGuests' ? 'guests' : ''} allowed`;
    }

    return 'Invalid value';
  }

  getReviewErrorMessage(field: string): string {
    const control = this.reviewForm.get(field);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return this.getFieldLabel(field) + ' is required';
    }
    if (errors['minlength']) {
      return `Comment must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Comment must not exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `Rating must be at least ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `Rating must not exceed ${errors['max'].max}`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      checkInDate: 'Check-in date',
      checkOutDate: 'Check-out date',
      numberOfGuests: 'Number of guests',
      pointsToRedeem: 'Points to redeem',
      rating: 'Rating',
      comment: 'Comment'
    };
    return labels[field] || field;
  }

  hasBookingError(field: string): boolean {
    const control = this.bookingForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  hasReviewError(field: string): boolean {
    const control = this.reviewForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  getAverageRating(): number {
    const reviewsList = this.reviews();
    if (reviewsList.length === 0) return 0;
    const sum = reviewsList.reduce((acc: number, review: Review) => acc + review.rating, 0);
    return sum / reviewsList.length;
  }

  getRatingStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    if (hasHalfStar) {
      stars.push('half');
    }
    while (stars.length < 5) {
      stars.push('empty');
    }
    
    return stars;
  }
}
