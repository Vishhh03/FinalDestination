import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Hotel } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = '/api/hotels';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Hotel[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Hotel>(`${this.apiUrl}/${id}`);
  }

  search(city?: string, maxPrice?: number, minRating?: number) {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
    if (minRating) params = params.set('minRating', minRating.toString());
    
    return this.http.get<Hotel[]>(`${this.apiUrl}/search`, { params });
  }
}
