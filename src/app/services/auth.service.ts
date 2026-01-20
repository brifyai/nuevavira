import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    avatar?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

    constructor() {
        // Check for stored user on init
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
        }
    }

    login(email: string, password: string): Observable<User> {
        return new Observable(observer => {
            // Simulate login - In production, this would call Supabase auth
            setTimeout(() => {
                let user: User;

                // Demo users
                if (email === 'admin@vira.com' && password === 'admin123') {
                    user = {
                        id: '1',
                        email: 'admin@vira.com',
                        name: 'Administrador',
                        role: 'admin',
                        avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff'
                    };
                } else if (email === 'user@vira.com' && password === 'user123') {
                    user = {
                        id: '2',
                        email: 'user@vira.com',
                        name: 'Usuario',
                        role: 'user',
                        avatar: 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'
                    };
                } else {
                    observer.error(new Error('Credenciales inválidas'));
                    return;
                }

                this.currentUserSubject.next(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                observer.next(user);
                observer.complete();
            }, 500);
        });
    }

    logout(): void {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null;
    }

    isAdmin(): boolean {
        return this.currentUserSubject.value?.role === 'admin';
    }

    hasRole(role: 'admin' | 'user'): boolean {
        return this.currentUserSubject.value?.role === role;
    }
}
