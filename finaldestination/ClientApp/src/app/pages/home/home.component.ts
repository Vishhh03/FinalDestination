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
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredHotels = signal<Hotel[]>([]);
  city = '';
  maxPrice: number | null = null;
  minRating: number | null = null;

  // Hero slider
  heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
      title: 'Luxury Hotels',
      subtitle: 'Experience world-class comfort'
    },
    {
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80',
      title: 'Boutique Stays',
      subtitle: 'Unique and memorable experiences'
    },
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80',
      title: 'City Escapes',
      subtitle: 'Urban adventures await'
    },
    {
      url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80',
      title: 'Beach Resorts',
      subtitle: 'Paradise by the ocean'
    }
  ];
  currentSlide = signal(0);
  private slideInterval: any;

    private readonly hotelService = inject(HotelService);
    private readonly router = inject(Router);

  ngOnInit() {
      this.loadHotels();

    // Start auto-slide
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
    }

    async loadHotels() {
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

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide() {
    this.currentSlide.set((this.currentSlide() + 1) % this.heroImages.length);
  }

  prevSlide() {
    this.currentSlide.set(
      this.currentSlide() === 0 ? this.heroImages.length - 1 : this.currentSlide() - 1
    );
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.stopAutoSlide();
    this.startAutoSlide(); // Restart auto-slide after manual navigation
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://localhost:5001${imageUrl}`;
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
    const placeholder = event.target.parentElement.querySelector('.placeholder-image');
    if (!placeholder) {
      const div = document.createElement('div');
      div.className = 'placeholder-image';
      div.innerHTML = '<i class="fas fa-hotel"></i>';
      event.target.parentElement.appendChild(div);
    }
  }

}
