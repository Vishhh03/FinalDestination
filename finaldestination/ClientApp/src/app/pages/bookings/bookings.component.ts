import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/hotel.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './bookings.component.html'
})
export class BookingsComponent implements OnInit {
  bookingService = inject(BookingService);

  bookings = signal<Booking[]>([]);
  selectedBooking = signal<Booking | null>(null);
  showPaymentModal = signal(false);
  error = signal('');
  success = signal('');

  paymentData = {
    amount: 0,
    currency: 'USD',
    paymentMethod: 'CreditCard',
    cardNumber: '',
    expiryMonth: 12,
    expiryYear: 2025,
    cvv: '',
    cardHolderName: ''
  };

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
  this.error.set('');
  this.bookingService.getMyBookings().subscribe({
    next: (bookings) => {
      bookings.forEach((booking, index) => {
        console.log(`Booking ${index} status:`, booking.status, typeof booking.status);
      });
      this.bookings.set(bookings);
    },
    error: (err) => this.error.set('Failed to load bookings')
  });
}


  openPaymentModal(booking: Booking) {
    this.selectedBooking.set(booking);
    this.paymentData.amount = booking.totalAmount;
    this.paymentData.cardNumber = '';
    this.paymentData.cvv = '';
    this.paymentData.cardHolderName = '';
    this.showPaymentModal.set(true);
    this.error.set('');
    this.success.set('');
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.selectedBooking.set(null);
  }

  processPayment() {
    const booking = this.selectedBooking();
    if (!booking) return;

    this.error.set('');
    this.bookingService.processPayment(booking.id, this.paymentData).subscribe({
      next: (response: any) => {
        if (response.status === 'Completed') {
          this.success.set('Payment processed successfully!');
          this.closePaymentModal();
          setTimeout(() => {
            this.success.set('');
            this.loadBookings();
          }, 2000);
        } else {
          this.error.set(response.errorMessage || 'Payment failed');
        }
      },
      error: (err) => {
        this.error.set(err.error?.errorMessage || err.error?.message || 'Payment processing failed');
      }
    });
  }

  cancelBooking(id: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.error.set('');
      this.bookingService.cancel(id).subscribe({
        next: () => {
          this.success.set('Booking cancelled successfully');
          setTimeout(() => {
            this.success.set('');
            this.loadBookings();
          }, 2000);
        },
        error: (err) => this.error.set(err.error?.message || 'Failed to cancel booking')
      });
    }
  }
}
