import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  hotelService = inject(HotelService);
  router = inject(Router);
  
  featuredHotels = signal<Hotel[]>([]);
  searchParams = { city: '', maxPrice: null as number | null, minRating: null as number | null };

  ngOnInit() {
    this.hotelService.getAll().subscribe({
      next: (hotels) => {
        this.featuredHotels.set(hotels.slice(0, 6));
      },
      error: (err) => console.error('Error loading hotels:', err)
    });
  }

  search() {
    const params: any = {};
    if (this.searchParams.city) params.city = this.searchParams.city;
    if (this.searchParams.maxPrice) params.maxPrice = this.searchParams.maxPrice;
    if (this.searchParams.minRating) params.minRating = this.searchParams.minRating;
    
    this.router.navigate(['/hotels'], { queryParams: params });
  }
}
