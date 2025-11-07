import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking, PaymentRequest, PaymentResult } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = '/api/bookings';

  constructor(private http: HttpClient) {}

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my`)
      .pipe(catchError(this.handleError));
  }

  getBooking(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(booking: any): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking)
      .pipe(catchError(this.handleError));
  }

  cancel(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(catchError(this.handleError));
  }

  processPayment(bookingId: number, paymentData: PaymentRequest): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(`${this.apiUrl}/${bookingId}/payment`, paymentData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.details) {
        errorMessage = error.error.details;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
    
    return throwError(() => ({ message: errorMessage, status: error.status, error: error.error }));
  }
}
