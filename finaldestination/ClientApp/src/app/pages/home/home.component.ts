import { Component, OnInit, inject } from '@angular/core';
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
  
  featuredHotels: Hotel[] = [];
  searchParams = { city: '', maxPrice: null as number | null, minRating: null as number | null };

  ngOnInit() {
    this.hotelService.getAll().subscribe(hotels => {
      this.featuredHotels = hotels.slice(0, 6);
    });
  }

  search() {
    this.router.navigate(['/hotels'], { 
      queryParams: this.searchParams 
    });
  }
}
