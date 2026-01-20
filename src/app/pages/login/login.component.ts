import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    email = '';
    password = '';
    loading = false;
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit(): void {
        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.email, this.password).subscribe({
            next: (user: User) => {
                console.log('Login successful:', user);
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.errorMessage = error.message || 'Error al iniciar sesión';
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    fillDemoAdmin(): void {
        this.email = 'admin@vira.com';
        this.password = 'admin123';
    }

    fillDemoUser(): void {
        this.email = 'user@vira.com';
        this.password = 'user123';
    }
}
