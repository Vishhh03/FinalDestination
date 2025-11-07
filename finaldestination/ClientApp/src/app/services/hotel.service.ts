import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Hotel } from '../models/hotel.model';

@Injectable({
    providedIn: 'root'
})
export class HotelService {
    private apiUrl = '/api/Hotels';

    constructor(private http: HttpClient) { }

    /** GET /api/Hotels */
    getAll(): Observable<Hotel[]> {
        return this.http.get<Hotel[]>(this.apiUrl)
            .pipe(catchError(this.handleError));
    }

    /** GET /api/Hotels/{id} */
    getById(id: number): Observable<Hotel> {
        return this.http.get<Hotel>(`${this.apiUrl}/${id}`)
            .pipe(catchError(this.handleError));
    }

    /** GET /api/Hotels/search */
    search(city?: string, maxPrice?: number, minRating?: number): Observable<Hotel[]> {
        let params = new HttpParams();
        if (city) params = params.set('city', city);
        if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
        if (minRating) params = params.set('minRating', minRating.toString());

        return this.http.get<Hotel[]>(`${this.apiUrl}/search`, { params })
            .pipe(catchError(this.handleError));
    }

    /** GET /api/Hotels/my-hotels */
    getMyHotels(): Observable<Hotel[]> {
        return this.http.get<Hotel[]>(`${this.apiUrl}/my-hotels`)
            .pipe(catchError(this.handleError));
    }

    /** POST /api/Hotels */
    create(hotelData: any): Observable<Hotel> {
        return this.http.post<Hotel>(this.apiUrl, hotelData)
            .pipe(catchError(this.handleError));
    }

    /** PUT /api/Hotels/{id} */
    update(id: number, hotelData: any): Observable<Hotel> {
        return this.http.put<Hotel>(`${this.apiUrl}/${id}`, hotelData)
            .pipe(catchError(this.handleError));
    }

    /** DELETE /api/Hotels/{id} */
    delete(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`)
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
