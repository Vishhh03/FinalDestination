import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Booking, PaymentRequest, PaymentResult } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://localhost:5001/api/bookings';

  constructor(private http: HttpClient) {}

  async getMyBookings(): Promise<Booking[]> {
    return await this.http.get<Booking[]>(`${this.apiUrl}/my`).toPromise() || [];
  }

  async getBooking(id: number): Promise<Booking | null> {
    return await this.http.get<Booking>(`${this.apiUrl}/${id}`).toPromise() || null;
  }

  async create(booking: any): Promise<Booking | null> {
    return await this.http.post<Booking>(this.apiUrl, booking).toPromise() || null;
  }

  async cancel(id: number): Promise<any> {
    return await this.http.put(`${this.apiUrl}/${id}/cancel`, {}).toPromise();
  }

  async processPayment(bookingId: number, paymentData: PaymentRequest): Promise<PaymentResult | null> {
    return await this.http.post<PaymentResult>(`${this.apiUrl}/${bookingId}/payment`, paymentData).toPromise() || null;
  }
}
