import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/hotel.model';

// Make Math available in template
declare global {
  interface Window {
    Math: typeof Math;
  }
}

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.css']
})
export class HotelsComponent implements OnInit {
  allHotels = signal<Hotel[]>([]);
  hotels = signal<Hotel[]>([]);
  loading = signal(true);
  
  // Search filters
  city = '';
  maxPrice: number | null = null;
  minRating: number | null = null;
  
  // Pagination
  currentPage = signal(1);
  pageSize = 9; // Hotels per page
  totalPages = signal(1);
  Math = Math; // Make Math available in template
  
  get paginatedHotels() {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.allHotels().slice(start, end);
  }

  private readonly hotelService = inject(HotelService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params: any) => {
      this.loading.set(true);
      this.currentPage.set(1); // Reset to first page on new search
      
      // Keep search values from query params
      this.city = params['city'] || '';
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.minRating = params['minRating'] ? +params['minRating'] : null;
      
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
        this.allHotels.set(hotels);
        this.totalPages.set(Math.ceil(hotels.length / this.pageSize));
        this.hotels.set(this.paginatedHotels);
      } catch (err) {
        console.error('Error loading hotels:', err);
      } finally {
        this.loading.set(false);
      }
    });
  }
  
  search() {
    const params: any = {};
    if (this.city) params.city = this.city;
    if (this.maxPrice) params.maxPrice = this.maxPrice;
    if (this.minRating) params.minRating = this.minRating;
    
    this.router.navigate(['/hotels'], { queryParams: params });
  }
  
  clearSearch() {
    this.city = '';
    this.maxPrice = null;
    this.minRating = null;
    this.router.navigate(['/hotels']);
  }

  onImageError(event: any) {
    console.error('Image failed to load:', event.target.src);
    // Replace with placeholder
    event.target.style.display = 'none';
    const placeholder = event.target.parentElement.querySelector('.placeholder-image');
    if (!placeholder) {
      const div = document.createElement('div');
      div.className = 'placeholder-image';
      div.innerHTML = '<i class="fas fa-hotel"></i><p>Image unavailable</p>';
      event.target.parentElement.appendChild(div);
    }
  }
  
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.hotels.set(this.paginatedHotels);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  get pages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Show max 5 page numbers
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    
    // Adjust start if we're near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://localhost:5001${imageUrl}`;
  }
}
