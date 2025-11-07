import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  async getHotelReviews(hotelId: number): Promise<Review[]> {
    return await this.http.get<Review[]>(`${this.apiUrl}/hotel/${hotelId}`).toPromise() || [];
  }

  async submit(review: any): Promise<Review | null> {
    return await this.http.post<Review>(this.apiUrl, review).toPromise() || null;
  }
}
