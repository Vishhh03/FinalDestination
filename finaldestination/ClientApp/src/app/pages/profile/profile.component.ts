import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { LoyaltyAccount } from '../../models/hotel.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);
  
  loyaltyAccount: LoyaltyAccount | null = null;
  transactions: any[] = [];

  ngOnInit() {
    this.http.get<LoyaltyAccount>('/api/loyalty/account').subscribe({
      next: (account) => this.loyaltyAccount = account,
      error: () => console.log('No loyalty account found')
    });
    
    this.http.get<any[]>('/api/loyalty/transactions').subscribe({
      next: (transactions) => this.transactions = transactions,
      error: () => console.log('No transactions found')
    });
  }
}
