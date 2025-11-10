import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HotelService } from '../../services/hotel.service';
import { BookingService } from '../../services/booking.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Hotel, Review } from '../../models/hotel.model';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
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
  canReview = signal(false);

  today = new Date().toISOString().split('T')[0];
  tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  checkInDate = '';
  checkOutDate = '';
  numberOfGuests = 1;
  pointsToRedeem = 0;
  
  // For Admin/Manager booking for guests
  guestName = '';
  guestEmail = '';
  isBookingForGuest = signal(false);
  
  minCheckOutDate = computed(() => {
    if (!this.checkInDate) return this.tomorrow;
    const checkIn = new Date(this.checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  });
  
  rating = 5;
  comment = '';
  
  // Edit review state
  editingReviewId = signal<number | null>(null);
  showDeleteModal = signal(false);
  reviewToDelete = signal<number | null>(null);

  nights = computed(() => this.calculateNights());
  totalAmount = computed(() => this.calculateTotal());
  availablePoints = computed(() => this.auth.currentUser()?.loyaltyAccount?.pointsBalance || 0);
  maxRedeemablePoints = computed(() => {
    const points = this.availablePoints();
    const total = this.totalAmount();
    const maxPointsForDiscount = Math.floor(total * 50);
    return Math.min(points, maxPointsForDiscount);
  });
  discount = computed(() => {
    // 1 point = ₹1, so points directly equal discount amount
    const points = this.pointsToRedeem;
    if (points < 1) return 0; // Need at least 1 point for any discount
    return points; // Direct 1:1 conversion (e.g., 250 points = ₹250)
  });
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
    if (this.auth.isAuthenticated()) {
      await this.checkReviewEligibility(id);
    }
  }

  async checkReviewEligibility(hotelId: number) {
    try {
      // Check if user has any paid bookings for this hotel
      const bookings = await this.bookingService.getMyBookings();
      const hasPaidBooking = bookings.some(b => 
        b.hotelId === hotelId && 
        b.paymentId !== null && 
        b.paymentId !== undefined
      );
      
      // Check if user already reviewed this hotel
      const hasReviewed = this.reviews().some(r => 
        r.userId === this.auth.currentUser()?.id
      );
      
      this.canReview.set(hasPaidBooking && !hasReviewed);
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      this.canReview.set(false);
    }
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

    const user = this.auth.currentUser();
    this.guestName = user?.name || '';
    this.guestEmail = user?.email || '';
    this.isBookingForGuest.set(false);
    
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
    this.guestName = '';
    this.guestEmail = '';
    this.isBookingForGuest.set(false);
    this.error.set('');
  }

  toggleBookingForGuest() {
    this.isBookingForGuest.set(!this.isBookingForGuest());
    if (!this.isBookingForGuest()) {
      const user = this.auth.currentUser();
      this.guestName = user?.name || '';
      this.guestEmail = user?.email || '';
    } else {
      this.guestName = '';
      this.guestEmail = '';
    }
  }

  onCheckInChange() {
    // Calculate minimum checkout date
    const minCheckout = this.minCheckOutDate();
    
    // If check-out is before minimum date, reset it
    if (this.checkOutDate && this.checkOutDate < minCheckout) {
      this.checkOutDate = '';
    }
  }

  async bookHotel() {
    if (!this.checkInDate || !this.checkOutDate) {
      this.error.set('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(this.checkInDate + 'T00:00:00');
    const checkOut = new Date(this.checkOutDate + 'T00:00:00');
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

    if (this.numberOfGuests < 1 || this.numberOfGuests > 10) {
      this.error.set('Number of guests must be between 1 and 10');
      return;
    }

    // Validate guest information
    if (!this.guestName || !this.guestEmail) {
      this.error.set('Guest name and email are required');
      return;
    }

    if (!this.guestEmail.includes('@')) {
      this.error.set('Please enter a valid email address');
      return;
    }

    const bookingData = {
      hotelId: this.hotel()!.id,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      numberOfGuests: this.numberOfGuests,
      guestName: this.guestName,
      guestEmail: this.guestEmail,
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
      const errorMessage = err.message || 'Booking failed. Please try again.';
      
      // Check if it's a duplicate booking error
      if (errorMessage.includes('overlaps') || errorMessage.includes('already have a booking')) {
        this.error.set('⚠️ You already have a booking at this hotel for these dates. Please choose different dates or cancel your existing booking.');
      } else {
        this.error.set(errorMessage);
      }
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
      if (this.editingReviewId()) {
        // Update existing review
        const updated = await this.reviewService.update(this.editingReviewId()!, reviewData);
        if (updated) {
          const currentReviews = this.reviews();
          const index = currentReviews.findIndex((r: any) => r.id === this.editingReviewId());
          if (index !== -1) {
            currentReviews[index] = updated;
            this.reviews.set([...currentReviews]);
          }
          this.success.set('Review updated successfully!');
        }
      } else {
        // Create new review
        const review = await this.reviewService.submit(reviewData);
        if (review) {
          const currentReviews = this.reviews();
          this.reviews.set([review, ...currentReviews]);
          this.canReview.set(false);
          this.success.set('Review submitted successfully!');
        }
      }
      
      this.rating = 5;
      this.comment = '';
      this.editingReviewId.set(null);
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set(err.error?.message || err.message || 'Failed to submit review');
    } finally {
      this.submittingReview.set(false);
    }
  }

  editReview(review: any) {
    this.editingReviewId.set(review.id);
    this.rating = review.rating;
    this.comment = review.comment;
    this.error.set('');
    // Scroll to review form
    setTimeout(() => {
      document.querySelector('.review-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  cancelEdit() {
    this.editingReviewId.set(null);
    this.rating = 5;
    this.comment = '';
    this.error.set('');
  }

  confirmDeleteReview(reviewId: number) {
    this.reviewToDelete.set(reviewId);
    this.showDeleteModal.set(true);
  }

  cancelDeleteReview() {
    this.showDeleteModal.set(false);
    this.reviewToDelete.set(null);
  }

  async deleteReview() {
    const reviewId = this.reviewToDelete();
    if (!reviewId) return;

    try {
      await this.reviewService.delete(reviewId);
      const currentReviews = this.reviews();
      this.reviews.set(currentReviews.filter((r: any) => r.id !== reviewId));
      this.success.set('Review deleted successfully!');
      this.showDeleteModal.set(false);
      this.reviewToDelete.set(null);
      
      // If user deleted their own review, they can review again
      const deletedReview = currentReviews.find((r: any) => r.id === reviewId);
      if (deletedReview && deletedReview.userId === this.auth.currentUser()?.id) {
        await this.checkReviewEligibility(this.hotel()!.id);
      }
      
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set(err.error?.message || err.message || 'Failed to delete review');
      this.showDeleteModal.set(false);
    }
  }

  canEditReview(review: any): boolean {
    const user = this.auth.currentUser();
    return user?.id === review.userId;
  }

  canDeleteReview(review: any): boolean {
    const user = this.auth.currentUser();
    return user?.id === review.userId || user?.role === 'Admin';
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
