import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { LoyaltyAccount } from '../../models/hotel.model';

interface PointsTransaction {
  id: number;
  userId: number;
  bookingId?: number;
  pointsEarned: number;
  pointsRedeemed: number;
  description: string;
  transactionDate: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);
  
  loyaltyAccount = signal<LoyaltyAccount | null>(null);
  transactions = signal<PointsTransaction[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.loadLoyaltyData();
  }

  loadLoyaltyData() {
    this.loading.set(true);
    this.error.set('');

    // Load loyalty account
    this.http.get<LoyaltyAccount>('/api/loyalty/account').subscribe({
      next: (account) => {
        this.loyaltyAccount.set(account);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load loyalty account:', err);
        this.error.set('Failed to load loyalty information');
        this.loading.set(false);
      }
    });
    
    // Load transactions
    this.http.get<PointsTransaction[]>('/api/loyalty/transactions').subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
      },
      error: (err) => {
        console.error('Failed to load transactions:', err);
      }
    });
  }

  refreshProfile() {
    this.authService.refreshUserData();
    this.loadLoyaltyData();
  }
}
