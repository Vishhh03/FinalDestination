import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BookingService } from '../../services/booking.service';
import { Booking, BookingStatus, PaymentMethod, PaymentStatus, PaymentRequest } from '../../models/hotel.model';

@Component({
    selector: 'app-bookings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
    private bookingService = inject(BookingService);
    private fb = inject(FormBuilder);

    bookings = signal<Booking[]>([]);
    selectedBooking = signal<Booking | null>(null);
    showPaymentModal = signal(false);
    error = signal('');
    success = signal('');
    loading = signal(false);
    processingPayment = signal(false);

    BookingStatus = BookingStatus;
    PaymentMethod = PaymentMethod;

    paymentForm: FormGroup = this.fb.group({
        paymentMethod: [PaymentMethod.CreditCard, Validators.required],
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        cardHolderName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        expiryMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
        expiryYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });

    ngOnInit() {
        this.loadBookings();
    }

    loadBookings() {
        this.loading.set(true);
        this.error.set('');
        
        this.bookingService.getMyBookings().subscribe({
            next: (bookings) => {
                this.bookings.set(bookings);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.message || 'Failed to load bookings');
                this.loading.set(false);
            }
        });
    }

    openPaymentModal(booking: Booking) {
        this.selectedBooking.set(booking);
        this.paymentForm.reset({
            paymentMethod: PaymentMethod.CreditCard,
            cardNumber: '',
            cardHolderName: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: ''
        });
        this.showPaymentModal.set(true);
        this.error.set('');
        this.success.set('');
    }

    closePaymentModal() {
        this.showPaymentModal.set(false);
        this.selectedBooking.set(null);
        this.paymentForm.reset();
        this.error.set('');
    }

    processPayment() {
        const booking = this.selectedBooking();
        if (!booking) return;

        // Mark all fields as touched to show validation errors
        Object.keys(this.paymentForm.controls).forEach(key => {
            this.paymentForm.get(key)?.markAsTouched();
        });

        if (this.paymentForm.invalid) {
            this.error.set('Please fill in all payment fields correctly');
            return;
        }

        // Validate expiry date
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const expiryYear = parseInt(this.paymentForm.value.expiryMonth);
        const expiryMonth = parseInt(this.paymentForm.value.expiryMonth);

        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            this.error.set('Card has expired');
            return;
        }

        this.processingPayment.set(true);
        this.error.set('');

        const paymentRequest: PaymentRequest = {
            bookingId: booking.id,
            amount: booking.totalAmount,
            currency: 'USD',
            paymentMethod: this.paymentForm.value.paymentMethod,
            cardNumber: this.paymentForm.value.cardNumber,
            cardHolderName: this.paymentForm.value.cardHolderName,
            expiryMonth: this.paymentForm.value.expiryMonth,
            expiryYear: this.paymentForm.value.expiryYear,
            cvv: this.paymentForm.value.cvv
        };

        this.bookingService.processPayment(booking.id, paymentRequest).subscribe({
            next: (response) => {
                this.processingPayment.set(false);
                
                if (response.status === PaymentStatus.Completed) {
                    this.success.set(`Payment successful! Transaction ID: ${response.transactionId}`);
                    this.closePaymentModal();
                    
                    setTimeout(() => {
                        this.success.set('');
                        this.loadBookings();
                    }, 3000);
                } else {
                    this.error.set(response.errorMessage || 'Payment failed. Please try again.');
                }
            },
            error: (err) => {
                this.processingPayment.set(false);
                this.error.set(err.message || 'Payment processing failed. Please try again.');
            }
        });
    }

    cancelBooking(booking: Booking) {
        const confirmMessage = booking.paymentId 
            ? 'This booking has been paid. Cancelling will process a refund. Are you sure?' 
            : 'Are you sure you want to cancel this booking?';
            
        if (!confirm(confirmMessage)) {
            return;
        }

        this.loading.set(true);
        this.error.set('');
        
        this.bookingService.cancel(booking.id).subscribe({
            next: (response) => {
                if (response && response.status === PaymentStatus.Refunded) {
                    this.success.set(`Booking cancelled and refund processed. Transaction ID: ${response.transactionId}`);
                } else {
                    this.success.set('Booking cancelled successfully');
                }
                
                this.loading.set(false);
                setTimeout(() => {
                    this.success.set('');
                    this.loadBookings();
                }, 3000);
            },
            error: (err) => {
                this.error.set(err.message || 'Failed to cancel booking');
                this.loading.set(false);
            }
        });
    }

    getStatusClass(status: BookingStatus): string {
        switch (status) {
            case BookingStatus.Confirmed:
                return 'status-confirmed';
            case BookingStatus.Cancelled:
                return 'status-cancelled';
            case BookingStatus.Completed:
                return 'status-completed';
            default:
                return '';
        }
    }

    getStatusText(status: BookingStatus): string {
        switch (status) {
            case BookingStatus.Confirmed:
                return 'Confirmed';
            case BookingStatus.Cancelled:
                return 'Cancelled';
            case BookingStatus.Completed:
                return 'Completed';
            default:
                return 'Unknown';
        }
    }

    getFieldError(fieldName: string): string {
        const control = this.paymentForm.get(fieldName);
        if (!control || !control.touched || !control.errors) {
            return '';
        }

        if (control.errors['required']) {
            return `${this.getFieldLabel(fieldName)} is required`;
        }
        if (control.errors['pattern']) {
            return this.getPatternError(fieldName);
        }
        if (control.errors['minlength']) {
            return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
        }
        if (control.errors['maxlength']) {
            return `${this.getFieldLabel(fieldName)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
        }

        return 'Invalid value';
    }

    private getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            cardNumber: 'Card number',
            cardHolderName: 'Card holder name',
            expiryMonth: 'Expiry month',
            expiryYear: 'Expiry year',
            cvv: 'CVV',
            paymentMethod: 'Payment method'
        };
        return labels[fieldName] || fieldName;
    }

    private getPatternError(fieldName: string): string {
        const errors: { [key: string]: string } = {
            cardNumber: 'Card number must be 16 digits',
            expiryMonth: 'Month must be 01-12',
            expiryYear: 'Year must be 2 digits',
            cvv: 'CVV must be 3 or 4 digits'
        };
        return errors[fieldName] || 'Invalid format';
    }

    formatCardNumber(value: string): string {
        return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    onCardNumberInput(event: any) {
        let value = event.target.value.replace(/\s/g, '');
        if (value.length > 16) {
            value = value.substring(0, 16);
        }
        this.paymentForm.patchValue({ cardNumber: value });
    }
}
