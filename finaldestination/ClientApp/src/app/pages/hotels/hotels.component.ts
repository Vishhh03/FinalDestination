import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './hotels.component.html'
})
export class HotelsComponent implements OnInit {
  hotelService = inject(HotelService);
  route = inject(ActivatedRoute);
  
  hotels = signal<Hotel[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.loading.set(true);
      
      if (params['city'] || params['maxPrice'] || params['minRating']) {
        this.hotelService.search(
          params['city'],
          params['maxPrice'] ? +params['maxPrice'] : undefined,
          params['minRating'] ? +params['minRating'] : undefined
        ).subscribe({
          next: (hotels) => {
            this.hotels.set(hotels);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error searching hotels:', err);
            this.loading.set(false);
          }
        });
      } else {
        this.hotelService.getAll().subscribe({
          next: (hotels) => {
            this.hotels.set(hotels);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error loading hotels:', err);
            this.loading.set(false);
          }
        });
      }
    });
  }
}
