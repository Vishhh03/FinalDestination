import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  error = signal('');
  loading = signal(false);

  registerForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required, 
      Validators.minLength(2), 
      Validators.maxLength(100),
      Validators.pattern(/^[a-zA-Z\s\-\.]+$/)
    ]],
    email: ['', [
      Validators.required, 
      Validators.email
    ]],
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]],
    contactNumber: ['', [
      Validators.pattern(/^\+?[\d\s\-()]+$/)
    ]]
  });

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get contactNumber() { return this.registerForm.get('contactNumber'); }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `Must not exceed ${maxLength} characters`;
    }
    if (errors['pattern']) {
      if (field === 'password') {
        return 'Password must contain uppercase, lowercase, number, and special character';
      }
      if (field === 'contactNumber') {
        return 'Please enter a valid phone number';
      }
      if (field === 'name') {
        return 'Name can only contain letters, spaces, hyphens, and periods';
      }
    }
    return 'Invalid value';
  }

  register() {
    // Mark all fields as touched
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    if (this.registerForm.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    this.error.set('');
    this.loading.set(true);
    
    const registerData = {
      ...this.registerForm.value,
      role: 'Guest' // Always register as Guest
    };
    
    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
