import { Component, OnInit, signal } from '@angular/core';
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
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loyaltyAccount = signal<LoyaltyAccount | null>(null);
  transactions = signal<PointsTransaction[]>([]);
  loading = signal(false);
  error = signal('');

  constructor(
    public auth: AuthService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    await this.loadLoyaltyData();
  }

  async loadLoyaltyData() {
    this.loading.set(true);
    this.error.set('');

    try {
      const account = await this.http.get<LoyaltyAccount>('/api/loyalty/account').toPromise();
      if (account) this.loyaltyAccount.set(account);
    } catch (err) {
      console.error('Failed to load loyalty account:', err);
      this.error.set('Failed to load loyalty information');
    }
    
    try {
      const transactions = await this.http.get<PointsTransaction[]>('/api/loyalty/transactions').toPromise();
      if (transactions) this.transactions.set(transactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }

    this.loading.set(false);
  }

  async refreshProfile() {
    await this.auth.refreshUserData();
    await this.loadLoyaltyData();
  }
}
