import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    // Statistics
    stats = {
        totalNews: 0,
        totalBroadcasts: 0,
        activeAutomations: 0,
        recentNews: 0
    };

    // Recent news
    recentNews: any[] = [];

    // Recent broadcasts
    recentBroadcasts: any[] = [];

    // Automation status
    automations: any[] = [];

    // Loading state
    loading = true;

    constructor() { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData() {
        // Simulate loading data
        setTimeout(() => {
            this.stats = {
                totalNews: 156,
                totalBroadcasts: 23,
                activeAutomations: 5,
                recentNews: 42
            };

            this.recentNews = [
                {
                    id: 1,
                    title: 'Nuevas políticas económicas anunciadas',
                    source: 'El País',
                    publishedAt: new Date(),
                    category: 'Economía'
                },
                {
                    id: 2,
                    title: 'Avances en tecnología de IA',
                    source: 'Tech News',
                    publishedAt: new Date(Date.now() - 3600000),
                    category: 'Tecnología'
                },
                {
                    id: 3,
                    title: 'Resultados deportivos del día',
                    source: 'Deportes Hoy',
                    publishedAt: new Date(Date.now() - 7200000),
                    category: 'Deportes'
                },
                {
                    id: 4,
                    title: 'Actualización sobre el clima',
                    source: 'Meteo Chile',
                    publishedAt: new Date(Date.now() - 10800000),
                    category: 'Clima'
                },
                {
                    id: 5,
                    title: 'Novedades en el mundo del cine',
                    source: 'Cine World',
                    publishedAt: new Date(Date.now() - 14400000),
                    category: 'Entretenimiento'
                }
            ];

            this.recentBroadcasts = [
                {
                    id: 1,
                    title: 'Noticiero Matutino',
                    duration: 15,
                    status: 'ready',
                    createdAt: new Date(Date.now() - 86400000)
                },
                {
                    id: 2,
                    title: 'Noticiero Vespertino',
                    duration: 20,
                    status: 'ready',
                    createdAt: new Date(Date.now() - 172800000)
                },
                {
                    id: 3,
                    title: 'Noticiero Nocturno',
                    duration: 30,
                    status: 'generating',
                    createdAt: new Date(Date.now() - 259200000)
                }
            ];

            this.automations = [
                {
                    id: 1,
                    name: 'Scraper Diario',
                    type: 'scraper',
                    status: 'active',
                    lastRun: new Date(Date.now() - 3600000),
                    nextRun: new Date(Date.now() + 82800000)
                },
                {
                    id: 2,
                    name: 'Humanizador de Noticias',
                    type: 'humanizer',
                    status: 'active',
                    lastRun: new Date(Date.now() - 7200000),
                    nextRun: new Date(Date.now() + 79200000)
                },
                {
                    id: 3,
                    name: 'Generador TTS',
                    type: 'tts',
                    status: 'active',
                    lastRun: new Date(Date.now() - 10800000),
                    nextRun: new Date(Date.now() + 75600000)
                },
                {
                    id: 4,
                    name: 'Programador Noticieros',
                    type: 'scheduler',
                    status: 'paused',
                    lastRun: new Date(Date.now() - 86400000),
                    nextRun: null
                },
                {
                    id: 5,
                    name: 'Monitor de Fuentes',
                    type: 'monitor',
                    status: 'active',
                    lastRun: new Date(Date.now() - 1800000),
                    nextRun: new Date(Date.now() + 84600000)
                }
            ];

            this.loading = false;
        }, 1000);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'active':
            case 'ready':
                return 'status-success';
            case 'paused':
            case 'draft':
                return 'status-warning';
            case 'generating':
                return 'status-info';
            case 'failed':
                return 'status-danger';
            default:
                return 'status-default';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'active':
                return 'Activo';
            case 'paused':
                return 'Pausado';
            case 'ready':
                return 'Listo';
            case 'generating':
                return 'Generando';
            case 'failed':
                return 'Fallido';
            case 'draft':
                return 'Borrador';
            default:
                return status;
        }
    }

    formatDate(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        if (days < 7) return `Hace ${days} días`;
        return date.toLocaleDateString('es-ES');
    }
}
