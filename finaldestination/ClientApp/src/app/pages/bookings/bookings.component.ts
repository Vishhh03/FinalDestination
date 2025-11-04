import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/hotel.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './bookings.component.html'
})
export class BookingsComponent implements OnInit {
  bookingService = inject(BookingService);
  
  bookings = signal<Booking[]>([]);
  selectedBooking = signal<Booking | null>(null);
  showPaymentModal = signal(false);
  error = signal('');
  success = signal('');

  paymentData = signal({
    amount: 0,
    currency: 'USD',
    paymentMethod: 'CreditCard',
    cardNumber: '',
    expiryMonth: 0,
    expiryYear: 0,
    cvv: '',
    cardHolderName: ''
  });

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getMyBookings().subscribe(bookings => this.bookings.set(bookings));
  }

  cancelBooking(id: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancel(id).subscribe({
        next: () => {
          this.success.set('Booking cancelled successfully');
          this.loadBookings();
        },
        error: (err) => this.error = err.error?.message || 'Failed to cancel booking'
      });
    }
  }
}