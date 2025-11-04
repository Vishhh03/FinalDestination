import { Component, OnInit, inject } from '@angular/core';
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
  templateUrl: './hotel-detail.component.html'
})
export class HotelDetailComponent implements OnInit {
  hotelService = inject(HotelService);
  bookingService = inject(BookingService);
  reviewService = inject(ReviewService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  
  hotel: Hotel | null = null;
  reviews: Review[] = [];
  bookingData = { hotelId: 0, checkInDate: '', checkOutDate: '', numberOfGuests: 1, guestName: '', guestEmail: '' };
  reviewData = { hotelId: 0, rating: 5, comment: '' };
  error = '';
  success = '';

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    
    this.hotelService.getById(id).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        this.bookingData.hotelId = hotel.id;
        this.reviewData.hotelId = hotel.id;
      },
      error: () => this.error = 'Hotel not found'
    });
    
    this.reviewService.getHotelReviews(id).subscribe(reviews => this.reviews = reviews);
  }

  bookHotel() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    const user = this.authService.currentUser();
    this.bookingData.guestName = user?.name || '';
    this.bookingData.guestEmail = user?.email || '';
    
    this.bookingService.create(this.bookingData).subscribe({
      next: () => {
        this.success = 'Booking created successfully!';
        setTimeout(() => this.router.navigate(['/bookings']), 1500);
      },
      error: (err) => this.error = err.error?.message || 'Booking failed'
    });
  }

  submitReview() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.reviewService.submit(this.reviewData).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.reviewData = { hotelId: this.hotel!.id, rating: 5, comment: '' };
        this.success = 'Review submitted successfully!';
      },
      error: (err) => this.error = err.error?.message || 'Failed to submit review'
    });
  }
}
