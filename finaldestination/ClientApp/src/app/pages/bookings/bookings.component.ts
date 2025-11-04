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

  // 👇 plain object for ngModel binding
  paymentData = {
    amount: 0,
    currency: 'USD',
    paymentMethod: 'CreditCard',
    cardNumber: '',
    expiryMonth: 0,
    expiryYear: 2024,
    cvv: '',
    cardHolderName: ''
  };

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getMyBookings().subscribe(bookings => this.bookings.set(bookings));
  }

  openPaymentModal(booking: Booking) {
    this.selectedBooking.set(booking);
    this.paymentData.amount = booking.totalAmount;
    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.selectedBooking.set(null);
  }

  processPayment() {
    const booking = this.selectedBooking();
    if (booking) {
      this.bookingService.processPayment(booking.id, this.paymentData).subscribe({
        next: () => {
          this.success.set('Payment processed successfully!');
          this.closePaymentModal();
          this.loadBookings();
        },
        error: (err) => this.error.set(err.error?.errorMessage || 'Payment failed')
      });
    }
  }

  cancelBooking(id: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancel(id).subscribe({
        next: () => {
          this.success.set('Booking cancelled successfully');
          this.loadBookings();
        },
        error: (err) => this.error.set(err.error?.message || 'Failed to cancel booking')
      });
    }
  }
}
