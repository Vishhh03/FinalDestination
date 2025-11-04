import { Component, OnInit, inject } from '@angular/core';
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
  
  hotels: Hotel[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['city'] || params['maxPrice'] || params['minRating']) {
        this.hotelService.search(
          params['city'],
          params['maxPrice'] ? +params['maxPrice'] : undefined,
          params['minRating'] ? +params['minRating'] : undefined
        ).subscribe(hotels => this.hotels = hotels);
      } else {
        this.hotelService.getAll().subscribe(hotels => this.hotels = hotels);
      }
    });
  }
}
