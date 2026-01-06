import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-timeline-noticiario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './timeline-noticiario.component.html',
    styleUrls: ['./timeline-noticiario.component.scss']
})
export class TimelineNoticiarioComponent implements OnInit {
    // Broadcasts list
    broadcasts: any[] = [];

    // Selected broadcast
    selectedBroadcast: any = null;

    // Timeline events
    timelineEvents: any[] = [];

    // Loading states
    loading = false;
    loadingTimeline = false;

    // View mode
    viewMode = 'grid'; // 'grid' or 'list'

    // Filter options
    statusFilter = 'all';
    dateFilter = 'all';

    // Status options
    statusOptions = ['all', 'ready', 'generating', 'published', 'draft'];

    // Date filters
    dateFilters = [
        { value: 'all', label: 'Todas' },
        { value: 'today', label: 'Hoy' },
        { value: 'week', label: 'Esta semana' },
        { value: 'month', label: 'Este mes' }
    ];

    constructor() { }

    ngOnInit(): void {
        this.loadBroadcasts();
    }

    loadBroadcasts() {
        this.loading = true;

        // Simulate loading broadcasts
        setTimeout(() => {
            this.broadcasts = [
                {
                    id: 1,
                    title: 'Noticiero Matutino - Edición Completa',
                    description: 'Resumen de las noticias más importantes de la mañana',
                    duration: 30,
                    status: 'ready',
                    totalNews: 12,
                    totalReadingTime: 1800,
                    createdAt: new Date(Date.now() - 3600000),
                    publishedAt: new Date(Date.now() - 1800000),
                    createdBy: 'Usuario'
                },
                {
                    id: 2,
                    title: 'Noticiero Vespertino - Destacados',
                    description: 'Las noticias más relevantes del día',
                    duration: 20,
                    status: 'ready',
                    totalNews: 8,
                    totalReadingTime: 1200,
                    createdAt: new Date(Date.now() - 86400000),
                    publishedAt: new Date(Date.now() - 82800000),
                    createdBy: 'Usuario'
                },
                {
                    id: 3,
                    title: 'Noticiero Nocturno - En Progreso',
                    description: 'Noticiero en proceso de generación',
                    duration: 25,
                    status: 'generating',
                    totalNews: 10,
                    totalReadingTime: 1500,
                    createdAt: new Date(Date.now() - 172800000),
                    createdBy: 'Usuario'
                },
                {
                    id: 4,
                    title: 'Noticiero Especial - Tecnología',
                    description: 'Especial sobre avances tecnológicos recientes',
                    duration: 15,
                    status: 'published',
                    totalNews: 6,
                    totalReadingTime: 900,
                    createdAt: new Date(Date.now() - 259200000),
                    publishedAt: new Date(Date.now() - 259200000),
                    createdBy: 'Usuario'
                },
                {
                    id: 5,
                    title: 'Noticiero Semanal - Resumen',
                    description: 'Resumen de las noticias más importantes de la semana',
                    duration: 45,
                    status: 'draft',
                    totalNews: 20,
                    totalReadingTime: 2700,
                    createdAt: new Date(Date.now() - 345600000),
                    createdBy: 'Usuario'
                }
            ];

            this.loading = false;
        }, 1000);
    }

    loadTimeline(broadcastId: number) {
        this.loadingTimeline = true;

        // Simulate loading timeline
        setTimeout(() => {
            this.timelineEvents = [
                {
                    id: 1,
                    type: 'intro',
                    title: 'Introducción',
                    description: 'Bienvenida y presentación del noticiero',
                    startTime: 0,
                    endTime: 30,
                    duration: 30
                },
                {
                    id: 2,
                    type: 'news',
                    title: 'Nuevas políticas económicas',
                    description: 'El gobierno ha anunciado nuevas medidas económicas...',
                    startTime: 30,
                    endTime: 180,
                    duration: 150
                },
                {
                    id: 3,
                    type: 'news',
                    title: 'Avances en tecnología de IA',
                    description: 'Nuevos modelos de IA están revolucionando...',
                    startTime: 180,
                    endTime: 330,
                    duration: 150
                },
                {
                    id: 4,
                    type: 'ad_break',
                    title: 'Pausa Comercial',
                    description: 'Espacio publicitario',
                    startTime: 330,
                    endTime: 390,
                    duration: 60
                },
                {
                    id: 5,
                    type: 'news',
                    title: 'Resultados deportivos',
                    description: 'Los partidos de hoy han sido emocionantes...',
                    startTime: 390,
                    endTime: 540,
                    duration: 150
                },
                {
                    id: 6,
                    type: 'news',
                    title: 'Actualización climática',
                    description: 'Los meteorólogos predicen cambios...',
                    startTime: 540,
                    endTime: 690,
                    duration: 150
                },
                {
                    id: 7,
                    type: 'news',
                    title: 'Novedades en entretenimiento',
                    description: 'Nuevas películas y series llegan a streaming...',
                    startTime: 690,
                    endTime: 840,
                    duration: 150
                },
                {
                    id: 8,
                    type: 'outro',
                    title: 'Cierre',
                    description: 'Despedida y cierre del noticiero',
                    startTime: 840,
                    endTime: 900,
                    duration: 60
                }
            ];

            this.loadingTimeline = false;
        }, 800);
    }

    selectBroadcast(broadcast: any) {
        this.selectedBroadcast = broadcast;
        this.loadTimeline(broadcast.id);
    }

    closeTimeline() {
        this.selectedBroadcast = null;
        this.timelineEvents = [];
    }

    get filteredBroadcasts() {
        return this.broadcasts.filter(broadcast => {
            const statusMatch = this.statusFilter === 'all' || broadcast.status === this.statusFilter;
            const dateMatch = this.dateFilter === 'all' || this.checkDateFilter(broadcast.createdAt);

            return statusMatch && dateMatch;
        });
    }

    checkDateFilter(date: Date): boolean {
        const now = new Date();
        const broadcastDate = new Date(date);

        switch (this.dateFilter) {
            case 'today':
                return broadcastDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return broadcastDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return broadcastDate >= monthAgo;
            default:
                return true;
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'ready':
            case 'published':
                return 'status-success';
            case 'generating':
                return 'status-info';
            case 'draft':
                return 'status-warning';
            case 'failed':
                return 'status-danger';
            default:
                return 'status-default';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'ready':
                return 'Listo';
            case 'generating':
                return 'Generando';
            case 'published':
                return 'Publicado';
            case 'draft':
                return 'Borrador';
            case 'failed':
                return 'Fallido';
            default:
                return status;
        }
    }

    getEventTypeClass(type: string): string {
        switch (type) {
            case 'intro':
                return 'event-intro';
            case 'outro':
                return 'event-outro';
            case 'news':
                return 'event-news';
            case 'ad_break':
                return 'event-ad';
            default:
                return 'event-default';
        }
    }

    formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `0:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatReadingTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes} min ${remainingSeconds > 0 ? remainingSeconds + 's' : ''}`;
        }
        return `${seconds}s`;
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    playBroadcast(broadcast: any) {
        console.log('Playing broadcast:', broadcast);
        alert(`Reproduciendo: ${broadcast.title}`);
    }

    exportTimeline() {
        console.log('Exporting timeline');
        alert('Timeline exportado exitosamente');
    }
}
