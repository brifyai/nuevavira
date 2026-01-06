import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-ultimo-minuto',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ultimo-minuto.component.html',
    styleUrls: ['./ultimo-minuto.component.scss']
})
export class UltimoMinutoComponent implements OnInit {
    // Breaking news
    breakingNews: any[] = [];

    // Filter options
    categoryFilter = 'all';
    sourceFilter = 'all';

    // Loading state
    loading = false;
    refreshing = false;

    // Categories
    categories = ['all', 'Economía', 'Tecnología', 'Deportes', 'Clima', 'Entretenimiento', 'Política'];

    // Sources
    sources = ['all', 'El País', 'Tech News', 'Deportes Hoy', 'Meteo Chile', 'Cine World'];

    // Auto-refresh settings
    autoRefresh = false;
    refreshInterval = 60; // seconds

    constructor() { }

    ngOnInit(): void {
        this.loadBreakingNews();
    }

    loadBreakingNews() {
        this.loading = true;

        // Simulate loading breaking news
        setTimeout(() => {
            this.breakingNews = [
                {
                    id: 1,
                    title: '¡URGENTE! Nuevo terremoto de magnitud 7.2 registrado en la costa',
                    content: 'Las autoridades han emitido alerta de tsunami para las zonas costeras...',
                    source: 'Meteo Chile',
                    category: 'Clima',
                    publishedAt: new Date(),
                    isBreaking: true,
                    priority: 'high',
                    imageUrl: 'https://via.placeholder.com/600x400'
                },
                {
                    id: 2,
                    title: 'Anuncio histórico: Firma de nuevo tratado comercial internacional',
                    content: 'Los líderes mundiales han acordado nuevas condiciones comerciales...',
                    source: 'El País',
                    category: 'Economía',
                    publishedAt: new Date(Date.now() - 300000),
                    isBreaking: true,
                    priority: 'high',
                    imageUrl: 'https://via.placeholder.com/600x400'
                },
                {
                    id: 3,
                    title: 'Avance científico: Nuevo tratamiento prometedor contra enfermedades raras',
                    content: 'Investigadores anuncian resultados positivos en ensayos clínicos...',
                    source: 'Tech News',
                    category: 'Tecnología',
                    publishedAt: new Date(Date.now() - 600000),
                    isBreaking: true,
                    priority: 'medium',
                    imageUrl: 'https://via.placeholder.com/600x400'
                },
                {
                    id: 4,
                    title: 'Resultados electorales: Cambios significativos en el panorama político',
                    content: 'Las elecciones han arrojado resultados sorprendentes que podrían...',
                    source: 'El País',
                    category: 'Política',
                    publishedAt: new Date(Date.now() - 900000),
                    isBreaking: true,
                    priority: 'high',
                    imageUrl: 'https://via.placeholder.com/600x400'
                },
                {
                    id: 5,
                    title: 'Final emocionante: Campeón mundial decide en los últimos segundos',
                    content: 'Un gol en el último minuto decide el campeonato mundial...',
                    source: 'Deportes Hoy',
                    category: 'Deportes',
                    publishedAt: new Date(Date.now() - 1200000),
                    isBreaking: true,
                    priority: 'medium',
                    imageUrl: 'https://via.placeholder.com/600x400'
                },
                {
                    id: 6,
                    title: 'Lanzamiento exclusivo: Nueva plataforma de streaming revoluciona el entretenimiento',
                    content: 'La plataforma ofrece contenido exclusivo y características innovadoras...',
                    source: 'Cine World',
                    category: 'Entretenimiento',
                    publishedAt: new Date(Date.now() - 1500000),
                    isBreaking: true,
                    priority: 'low',
                    imageUrl: 'https://via.placeholder.com/600x400'
                }
            ];

            this.loading = false;
        }, 1000);
    }

    refreshNews() {
        this.refreshing = true;

        // Simulate refresh
        setTimeout(() => {
            this.loadBreakingNews();
            this.refreshing = false;
        }, 1500);
    }

    get filteredNews() {
        return this.breakingNews.filter(news => {
            const categoryMatch = this.categoryFilter === 'all' || news.category === this.categoryFilter;
            const sourceMatch = this.sourceFilter === 'all' || news.source === this.sourceFilter;

            return categoryMatch && sourceMatch;
        }).sort((a: any, b: any) => {
            // Sort by priority first, then by date
            const priorityOrder: any = { high: 0, medium: 1, low: 2 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

            if (priorityDiff !== 0) return priorityDiff;

            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
    }

    getPriorityClass(priority: string): string {
        switch (priority) {
            case 'high':
                return 'priority-high';
            case 'medium':
                return 'priority-medium';
            case 'low':
                return 'priority-low';
            default:
                return 'priority-default';
        }
    }

    getPriorityText(priority: string): string {
        switch (priority) {
            case 'high':
                return 'Alta';
            case 'medium':
                return 'Media';
            case 'low':
                return 'Baja';
            default:
                return priority;
        }
    }

    addToBroadcast(news: any) {
        console.log('Adding to broadcast:', news);
        alert(`"${news.title}" agregada al noticiero`);
    }

    formatDate(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        return date.toLocaleDateString('es-ES');
    }

    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;

        if (this.autoRefresh) {
            console.log('Auto-refresh enabled');
            // Implement auto-refresh logic
        } else {
            console.log('Auto-refresh disabled');
        }
    }
}
