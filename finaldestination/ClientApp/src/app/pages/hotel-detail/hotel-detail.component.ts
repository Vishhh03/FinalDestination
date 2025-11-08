import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.css']
})
export class HotelDetailComponent implements OnInit {
  hotel = signal<Hotel | null>(null);
  reviews = signal<Review[]>([]);
  error = signal('');
  success = signal('');
  loading = signal(false);
  submittingBooking = signal(false);
  submittingReview = signal(false);
  showBookingModal = signal(false);

  today = new Date().toISOString().split('T')[0];
  tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  checkInDate = '';
  checkOutDate = '';
  numberOfGuests = 1;
  pointsToRedeem = 0;
  
  rating = 5;
  comment = '';

  nights = computed(() => this.calculateNights());
  totalAmount = computed(() => this.calculateTotal());
  availablePoints = computed(() => this.auth.currentUser()?.loyaltyAccount?.pointsBalance || 0);
  maxRedeemablePoints = computed(() => {
    const points = this.availablePoints();
    const total = this.totalAmount();
    const maxPointsForDiscount = Math.floor(total * 50);
    return Math.min(points, maxPointsForDiscount);
  });
  discount = computed(() => this.pointsToRedeem / 100);
  finalAmount = computed(() => Math.max(0, this.totalAmount() - this.discount()));

  constructor(
    private hotelService: HotelService,
    private bookingService: BookingService,
    private reviewService: ReviewService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    await this.loadHotelDetails(id);
    await this.loadReviews(id);
  }

  async loadHotelDetails(id: number) {
    this.loading.set(true);
    try {
      const hotel = await this.hotelService.getById(id);
      this.hotel.set(hotel);
    } catch (err: any) {
      this.error.set(err.message || 'Hotel not found');
    } finally {
      this.loading.set(false);
    }
  }

  async loadReviews(id: number) {
    try {
      const reviews = await this.reviewService.getHotelReviews(id);
      this.reviews.set(reviews);
    } catch (err) {
      console.log('No reviews found');
    }
  }

  openBookingModal() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.showBookingModal.set(true);
    this.error.set('');
    this.success.set('');
  }

  closeBookingModal() {
    this.showBookingModal.set(false);
    this.checkInDate = '';
    this.checkOutDate = '';
    this.numberOfGuests = 1;
    this.pointsToRedeem = 0;
    this.error.set('');
  }

  async bookHotel() {
    if (!this.checkInDate || !this.checkOutDate) {
      this.error.set('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
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

    const user = this.auth.currentUser();
    const bookingData = {
      hotelId: this.hotel()!.id,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      numberOfGuests: this.numberOfGuests,
      guestName: user?.name || '',
      guestEmail: user?.email || '',
      pointsToRedeem: this.pointsToRedeem > 0 ? this.pointsToRedeem : null
    };
    
    this.submittingBooking.set(true);
    this.error.set('');
    
    try {
      await this.bookingService.create(bookingData);
      this.success.set('Booking created successfully! Redirecting to your bookings...');
      setTimeout(() => {
        this.router.navigate(['/bookings']);
      }, 2000);
    } catch (err: any) {
      this.error.set(err.message || 'Booking failed. Please try again.');
    } finally {
      this.submittingBooking.set(false);
    }
  }

  async submitReview() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.comment || this.comment.length < 10) {
      this.error.set('Comment must be at least 10 characters');
      return;
    }
    
    this.submittingReview.set(true);
    this.error.set('');
    
    const reviewData = {
      hotelId: this.hotel()!.id,
      rating: this.rating,
      comment: this.comment
    };

    try {
      const review = await this.reviewService.submit(reviewData);
      if (review) {
        const currentReviews = this.reviews();
        this.reviews.set([review, ...currentReviews]);
        this.rating = 5;
        this.comment = '';
        this.success.set('Review submitted successfully!');
        setTimeout(() => this.success.set(''), 3000);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Failed to submit review');
    } finally {
      this.submittingReview.set(false);
    }
  }

  calculateNights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  calculateTotal(): number {
    const hotel = this.hotel();
    if (!hotel) return 0;
    return this.calculateNights() * hotel.pricePerNight;
  }

  getAverageRating(): number {
    const reviewsList = this.reviews();
    if (reviewsList.length === 0) return 0;
    const sum = reviewsList.reduce((acc, review) => acc + review.rating, 0);
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
