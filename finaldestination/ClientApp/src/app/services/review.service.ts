import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Review } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  getHotelReviews(hotelId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/hotel/${hotelId}`)
      .pipe(catchError(this.handleError));
  }

  submit(review: any): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review)
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
