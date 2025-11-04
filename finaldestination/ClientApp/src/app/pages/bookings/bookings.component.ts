import { Component, OnInit, inject } from '@angular/core';
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
  
  bookings: Booking[] = [];
  selectedBooking: Booking | null = null;
  showPaymentModal = false;
  paymentData = { amount: 0, currency: 'USD', paymentMethod: 'CreditCard', cardNumber: '', expiryMonth: 0, expiryYear: 0, cvv: '', cardHolderName: '' };
  error = '';
  success = '';

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getMyBookings().subscribe(bookings => this.bookings = bookings);
  }

  cancelBooking(id: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancel(id).subscribe({
        next: () => {
          this.success = 'Booking cancelled successfully';
          this.loadBookings();
        },
        error: (err) => this.error = err.error?.message || 'Failed to cancel booking'
      });
    }
  }

  openPaymentModal(booking: Booking) {
    this.selectedBooking = booking;
    this.paymentData.amount = booking.totalAmount;
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedBooking = null;
  }

  processPayment() {
    if (this.selectedBooking) {
      this.bookingService.processPayment(this.selectedBooking.id, this.paymentData).subscribe({
        next: () => {
          this.success = 'Payment processed successfully!';
          this.closePaymentModal();
          this.loadBookings();
        },
        error: (err) => this.error = err.error?.errorMessage || 'Payment failed'
      });
    }
  }
}
