import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    role: 'Guest'
  };
  error = '';
  loading = false;

  register() {
    this.error = '';
    this.loading = true;
    
    this.authService.register(this.formData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
