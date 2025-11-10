import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Hotel } from '../models/hotel.model';

@Injectable({
    providedIn: 'root'
})
export class HotelService {
    private apiUrl = 'https://localhost:5001/api/Hotels';

    constructor(private http: HttpClient) { }

    async getAll(): Promise<Hotel[]> {
        return await this.http.get<Hotel[]>(this.apiUrl).toPromise() || [];
    }

    async getById(id: number): Promise<Hotel | null> {
        return await this.http.get<Hotel>(`${this.apiUrl}/${id}`).toPromise() || null;
    }

    async search(city?: string, maxPrice?: number, minRating?: number): Promise<Hotel[]> {
        let params = new HttpParams();
        if (city) params = params.set('city', city);
        if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
        if (minRating) params = params.set('minRating', minRating.toString());

        return await this.http.get<Hotel[]>(`${this.apiUrl}/search`, { params }).toPromise() || [];
    }

    async getMyHotels(): Promise<Hotel[]> {
        return await this.http.get<Hotel[]>(`${this.apiUrl}/my-hotels`).toPromise() || [];
    }

    async create(hotelData: any): Promise<Hotel | null> {
        return await this.http.post<Hotel>(this.apiUrl, hotelData).toPromise() || null;
    }

    async update(id: number, hotelData: any): Promise<Hotel | null> {
        return await this.http.put<Hotel>(`${this.apiUrl}/${id}`, hotelData).toPromise() || null;
    }

    async delete(id: number): Promise<any> {
        return await this.http.delete(`${this.apiUrl}/${id}`).toPromise();
    }
}
