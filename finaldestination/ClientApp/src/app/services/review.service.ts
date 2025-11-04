import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  getHotelReviews(hotelId: number) {
    return this.http.get<Review[]>(`${this.apiUrl}/hotel/${hotelId}`);
  }

  submit(review: any) {
    return this.http.post<Review>(this.apiUrl, review);
  }
}
