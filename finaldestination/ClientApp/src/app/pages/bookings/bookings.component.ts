import { Component, OnInit, inject, signal } from '@angular/core';
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
    showError = signal(false);

    private readonly bookingService = inject(BookingService);

    ngOnInit() {
        this.loadBookings();
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

        this.showError.set(false);
        this.error.set('');

        if (!this.cardNumber || this.cardNumber.length !== 16) {
            this.error.set('Card number must be 16 digits');
            this.showError.set(true);
            return;
        }

        if (!this.cardHolderName || this.cardHolderName.trim().length < 3) {
            this.error.set('Cardholder name must be at least 3 characters');
            this.showError.set(true);
            return;
        }

        const month = parseInt(this.expiryMonth);
        if (!this.expiryMonth || month < 1 || month > 12) {
            this.error.set('Invalid expiry month');
            this.showError.set(true);
            return;
        }

        const year = parseInt(this.expiryYear);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (!this.expiryYear || year < currentYear || (year === currentYear && month < currentMonth)) {
            this.error.set('Card has expired');
            this.showError.set(true);
            return;
        }

        if (!this.cvv || this.cvv.length !== 3) {
            this.error.set('CVV must be 3 digits');
            this.showError.set(true);
            return;
        }

        this.processingPayment.set(true);

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

            if (result?.status === PaymentStatus.Completed) {
                this.success.set(`Payment successful! Transaction ID: ${result.transactionId}`);
                this.closePaymentModal();
                setTimeout(() => {
                    this.success.set('');
                    this.loadBookings();
                }, 3000);
            } else {
                this.error.set(result?.errorMessage || 'Payment failed');
                this.showError.set(true);
            }
        } catch (err: any) {
            const errorMsg = err.error?.message || err.error?.title || err.message || 'Payment failed';
            this.error.set(errorMsg);
            this.showError.set(true);
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

    validateCardNumber(value: string) {
        this.cardNumber = value.replace(/\D/g, '').slice(0, 16);
    }

    validateCardHolder(value: string) {
        this.cardHolderName = value.replace(/[^a-zA-Z\s]/g, '');
    }

    validateMonth(value: string) {
        const digits = value.replace(/\D/g, '').slice(0, 2);
        const num = parseInt(digits);
        this.expiryMonth = (num > 12) ? '12' : digits;
    }

    validateYear(value: string) {
        this.expiryYear = value.replace(/\D/g, '').slice(0, 2);
    }

    validateCvv(value: string) {
        this.cvv = value.replace(/\D/g, '').slice(0, 3);
    }

    blockNonNumeric(event: KeyboardEvent) {
        const key = event.key;
        if (!/^[0-9]$/.test(key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            event.preventDefault();
        }
    }

}
