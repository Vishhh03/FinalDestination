import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.css']
})
export class HotelsComponent implements OnInit {
  hotels = signal<Hotel[]>([]);
  loading = signal(true);

  constructor(
    private hotelService: HotelService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.loading.set(true);
      
      try {
        let hotels: Hotel[];
        if (params['city'] || params['maxPrice'] || params['minRating']) {
          hotels = await this.hotelService.search(
            params['city'],
            params['maxPrice'] ? +params['maxPrice'] : undefined,
            params['minRating'] ? +params['minRating'] : undefined
          );
        } else {
          hotels = await this.hotelService.getAll();
        }
        this.hotels.set(hotels);
      } catch (err) {
        console.error('Error loading hotels:', err);
      } finally {
        this.loading.set(false);
      }
    });
  }
}
