import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Hotel } from '../models/hotel.model';

@Injectable({
    providedIn: 'root'
})
export class HotelService {

    private apiUrl = '/api/Hotels';

    constructor(private http: HttpClient) { }


    /** GET /api/Hotels */
    getAll() {
        return this.http.get<Hotel[]>(this.apiUrl);
    }

    /** GET /api/Hotels/{id} */
    getById(id: number) {
        return this.http.get<Hotel>(`${this.apiUrl}/${id}`);
    }

    /** GET /api/Hotels/search */
    search(city?: string, maxPrice?: number, minRating?: number) {
        let params = new HttpParams();
        if (city) params = params.set('city', city);
        if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
        if (minRating) params = params.set('minRating', minRating.toString());

        return this.http.get<Hotel[]>(`${this.apiUrl}/search`, { params });
    }


    /** GET /api/Hotels/my-hotels */
    getMyHotels() {
        return this.http.get<Hotel[]>(`${this.apiUrl}/my-hotels`);
    }

    /** POST /api/Hotels */
    create(hotelData: Omit<Hotel, 'id'>) {
        return this.http.post<Hotel>(this.apiUrl, hotelData);
    }

    /** PUT /api/Hotels/{id} */
    update(id: number, hotelData: Partial<Hotel>) {
        return this.http.put<Hotel>(`${this.apiUrl}/${id}`, hotelData);
    }

    /** DELETE /api/Hotels/{id} */
    delete(id: number) {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}