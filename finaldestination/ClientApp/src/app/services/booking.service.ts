import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = '/api/bookings';

  constructor(private http: HttpClient) {}

  getMyBookings() {
    return this.http.get<Booking[]>(`${this.apiUrl}/my`);
  }

  create(booking: any) {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  cancel(id: number) {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/cancel`, {});
  }

  processPayment(bookingId: number, paymentData: any) {
    return this.http.post(`${this.apiUrl}/${bookingId}/payment`, paymentData);
  }
}
