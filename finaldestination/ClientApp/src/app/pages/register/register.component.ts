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
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);
  
  error = signal('');
  loading = signal(false);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
    contactNumber: ['', [Validators.pattern(/^\+?[\d\s\-()]+$/)]],
    role: ['Guest']
  });

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get contactNumber() { return this.registerForm.get('contactNumber'); }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Must not exceed ${maxLength} characters`;
    }
    if (control.hasError('pattern')) {
      if (field === 'password') {
        return 'Password must contain uppercase, lowercase, number, and special character';
      }
      if (field === 'contactNumber') {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  register() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.error.set('');
    this.loading.set(true);
    
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.error?.details || 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
