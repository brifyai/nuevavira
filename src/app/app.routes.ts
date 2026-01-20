import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'crear-noticiario',
        loadComponent: () => import('./pages/crear-noticiario/crear-noticiario.component').then(m => m.CrearNoticiarioComponent),
        canActivate: [authGuard]
    },
    {
        path: 'ultimo-minuto',
        loadComponent: () => import('./pages/ultimo-minuto/ultimo-minuto.component').then(m => m.UltimoMinutoComponent),
        canActivate: [authGuard]
    },
    {
        path: 'timeline-noticiario',
        loadComponent: () => import('./pages/timeline-noticiario/timeline-noticiario.component').then(m => m.TimelineNoticiarioComponent),
        canActivate: [authGuard]
    },
    {
        path: 'automatizacion-activos',
        loadComponent: () => import('./pages/automatizacion-activos/automatizacion-activos.component').then(m => m.AutomatizacionActivosComponent),
        canActivate: [authGuard]
    },
    {
        path: 'fuentes',
        loadComponent: () => import('./pages/fuentes/fuentes.component').then(m => m.FuentesComponent),
        canActivate: [authGuard, adminGuard]
    }
];
