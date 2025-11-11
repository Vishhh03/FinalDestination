import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  contactNumber = '';
  error = signal('');
  loading = signal(false);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async register() {
    // Validate required fields
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error.set('Please fill in all required fields');
      return;
    }

    // Validate name length
    if (this.name.length < 2 || this.name.length > 100) {
      this.error.set('Name must be between 2 and 100 characters');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error.set('Please enter a valid email address');
      return;
    }

    // Validate password match
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    // Validate password strength
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(this.password)) {
      this.error.set('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.register({
        name: this.name,
        email: this.email,
        password: this.password,
        confirmPassword: this.confirmPassword,
        contactNumber: this.contactNumber || undefined
      });
      this.router.navigate(['/']);
    } catch (err: any) {
      const errorMessage = err.error?.message || err.error || 'Registration failed';
      this.error.set(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }
}
