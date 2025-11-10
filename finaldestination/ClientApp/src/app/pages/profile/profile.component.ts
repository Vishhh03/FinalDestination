import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loyaltyAccount = signal<LoyaltyAccount | null>(null);
  transactions = signal<PointsTransaction[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');
  editMode = signal(false);
  
  editName = '';
  editContactNumber = '';

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
      const account = await this.http.get<LoyaltyAccount>('https://localhost:5001/api/loyalty/account').toPromise();
      if (account) this.loyaltyAccount.set(account);
    } catch (err) {
      console.error('Failed to load loyalty account:', err);
      this.error.set('Failed to load loyalty information');
    }
    
    try {
      const transactions = await this.http.get<PointsTransaction[]>('https://localhost:5001/api/loyalty/transactions').toPromise();
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

  startEdit() {
    const user = this.auth.currentUser();
    if (user) {
      this.editName = user.name;
      this.editContactNumber = user.contactNumber || '';
      this.editMode.set(true);
      this.error.set('');
      this.success.set('');
    }
  }

  cancelEdit() {
    this.editMode.set(false);
    this.error.set('');
  }

  async saveProfile() {
    if (!this.editName.trim()) {
      this.error.set('Name is required');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.http.put('https://localhost:5001/api/users/profile', {
        name: this.editName,
        contactNumber: this.editContactNumber || null
      }).toPromise();

      this.success.set('Profile updated successfully!');
      this.editMode.set(false);
      await this.auth.refreshUserData();
      
      setTimeout(() => this.success.set(''), 3000);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to update profile');
    } finally {
      this.loading.set(false);
    }
  }
}
