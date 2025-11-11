import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hotel-card.component.html',
  styleUrls: ['./hotel-card.component.css']
})
export class HotelCardComponent {
  @Input() hotel: any;
  @Input() mode: 'view' | 'admin' | 'manager' = 'view';
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://localhost:5001${imageUrl}`;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/placeholder-hotel.jpg';
  }

  onEdit(): void {
    this.edit.emit(this.hotel);
  }

  onDelete(): void {
    this.delete.emit(this.hotel);
  }
}
