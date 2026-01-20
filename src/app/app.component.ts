import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'VIRA';
    currentRoute = '';
    isMenuOpen = false;
    currentUser: User | null = null;

    // Menu items
    menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/crear-noticiario', label: 'Crear Noticiario', icon: 'add_circle' },
        { path: '/ultimo-minuto', label: 'Último Minuto', icon: 'flash_on' },
        { path: '/timeline-noticiario', label: 'Timeline Noticiario', icon: 'timeline' },
        { path: '/automatizacion-activos', label: 'Automatización Activos', icon: 'settings_suggest' }
    ];

    // Admin-only menu item
    adminMenuItem = { path: '/fuentes', label: 'Fuentes', icon: 'source' };

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.router.events.subscribe(() => {
            this.currentRoute = this.router.url;
        });

        // Subscribe to current user
        this.authService.currentUser$.subscribe((user: User | null) => {
            this.currentUser = user;
        });
    }

    get user() {
        return this.currentUser;
    }

    get isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    get visibleMenuItems() {
        const items = [...this.menuItems];
        if (this.isAdmin) {
            items.push(this.adminMenuItem);
        }
        return items;
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
        this.isMenuOpen = false;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
