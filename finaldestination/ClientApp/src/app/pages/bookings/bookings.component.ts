import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BookingService } from '../../services/booking.service';
import { Booking, BookingStatus, PaymentMethod, PaymentStatus } from '../../models/hotel.model';

@Component({
    selector: 'app-bookings',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
    bookings = signal<Booking[]>([]);
    selectedBooking = signal<Booking | null>(null);
    showPaymentModal = signal(false);
    error = signal('');
    success = signal('');
    loading = signal(false);
    processingPayment = signal(false);

    BookingStatus = BookingStatus;
    PaymentMethod = PaymentMethod;

    cardNumber = '';
    cardHolderName = '';
    expiryMonth = '';
    expiryYear = '';
    cvv = '';

    constructor(private bookingService: BookingService) {}

    async ngOnInit() {
        await this.loadBookings();
    }

    async loadBookings() {
        this.loading.set(true);
        try {
            const bookings = await this.bookingService.getMyBookings();
            this.bookings.set(bookings);
        } catch (err: any) {
            this.error.set(err.message || 'Failed to load bookings');
        } finally {
            this.loading.set(false);
        }
    }

    openPaymentModal(booking: Booking) {
        this.selectedBooking.set(booking);
        this.cardNumber = '';
        this.cardHolderName = '';
        this.expiryMonth = '';
        this.expiryYear = '';
        this.cvv = '';
        this.showPaymentModal.set(true);
        this.error.set('');
    }

    closePaymentModal() {
        this.showPaymentModal.set(false);
        this.selectedBooking.set(null);
        this.error.set('');
    }

    async processPayment() {
        const booking = this.selectedBooking();
        if (!booking) return;

        if (!this.cardNumber || !this.cardHolderName || !this.expiryMonth || !this.expiryYear || !this.cvv) {
            this.error.set('Please fill in all payment fields');
            return;
        }

        if (this.cardNumber.length !== 16) {
            this.error.set('Card number must be 16 digits');
            return;
        }

        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const expYear = parseInt(this.expiryYear);
        const expMonth = parseInt(this.expiryMonth);

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            this.error.set('Card has expired');
            return;
        }

        this.processingPayment.set(true);
        this.error.set('');

        console.log('💳 Processing payment:', {
            bookingId: booking.id,
            amount: booking.totalAmount,
            cardNumber: this.cardNumber.substring(0, 4) + '****' + this.cardNumber.substring(12)
        });

        try {
            const result = await this.bookingService.processPayment(booking.id, {
                bookingId: booking.id,
                amount: booking.totalAmount,
                currency: 'USD',
                paymentMethod: PaymentMethod.CreditCard,
                cardNumber: this.cardNumber,
                cardHolderName: this.cardHolderName,
                expiryMonth: this.expiryMonth,
                expiryYear: this.expiryYear,
                cvv: this.cvv
            });

            console.log('💳 Payment result:', result);

            if (result && result.status === PaymentStatus.Completed) {
                console.log('✅ Payment successful');
                this.success.set(`Payment successful! Transaction ID: ${result.transactionId}`);
                this.closePaymentModal();
                setTimeout(() => {
                    this.success.set('');
                    this.loadBookings();
                }, 3000);
            } else {
                console.error('❌ Payment failed:', result);
                this.error.set(result?.errorMessage || 'Payment failed');
            }
        } catch (err: any) {
            console.error('❌ Payment error:', err);
            this.error.set(err.error?.message || err.message || 'Payment processing failed');
        } finally {
            this.processingPayment.set(false);
        }
    }

    async cancelBooking(booking: Booking) {
        const confirmMessage = booking.paymentId 
            ? 'This booking has been paid. Cancelling will process a refund. Are you sure?' 
            : 'Are you sure you want to cancel this booking?';
            
        if (!confirm(confirmMessage)) return;

        this.loading.set(true);
        try {
            const response = await this.bookingService.cancel(booking.id);
            if (response && response.status === PaymentStatus.Refunded) {
                this.success.set(`Booking cancelled and refund processed. Transaction ID: ${response.transactionId}`);
            } else {
                this.success.set('Booking cancelled successfully');
            }
            setTimeout(() => {
                this.success.set('');
                this.loadBookings();
            }, 3000);
        } catch (err: any) {
            this.error.set(err.message || 'Failed to cancel booking');
        } finally {
            this.loading.set(false);
        }
    }

    getStatusClass(status: BookingStatus): string {
        // Handle both numeric and enum values
        const statusNum = Number(status);
        switch (statusNum) {
            case BookingStatus.Confirmed:
            case 1:
                return 'status-confirmed';
            case BookingStatus.Cancelled:
            case 2:
                return 'status-cancelled';
            case BookingStatus.Completed:
            case 3:
                return 'status-completed';
            default:
                return '';
        }
    }

    getStatusText(status: BookingStatus): string {
        // Handle both string and numeric enum values from API
        const statusStr = String(status).toLowerCase();
        const statusNum = Number(status);
        
        // Check string values first (backend sends strings)
        if (statusStr === 'confirmed' || statusNum === 1 || statusNum === BookingStatus.Confirmed) {
            return 'Confirmed';
        }
        if (statusStr === 'cancelled' || statusNum === 2 || statusNum === BookingStatus.Cancelled) {
            return 'Cancelled';
        }
        if (statusStr === 'completed' || statusNum === 3 || statusNum === BookingStatus.Completed) {
            return 'Completed';
        }
        
        return 'Unknown';
    }
}
