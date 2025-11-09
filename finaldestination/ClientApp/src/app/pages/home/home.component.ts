import { Component, OnInit, signal } from '@angular/core';
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
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredHotels = signal<Hotel[]>([]);
  city = '';
  maxPrice: number | null = null;
  minRating: number | null = null;

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const hotels = await this.hotelService.getAll();
      this.featuredHotels.set(hotels.slice(0, 6));
    } catch (err) {
      console.error('Error loading hotels:', err);
    }
  }

  search() {
    const params: any = {};
    if (this.city) params.city = this.city;
    if (this.maxPrice) params.maxPrice = this.maxPrice;
    if (this.minRating) params.minRating = this.minRating;
    
    this.router.navigate(['/hotels'], { queryParams: params });
  }
}
