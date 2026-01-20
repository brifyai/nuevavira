import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupabaseService } from '../../services/supabase.service';
import { environment } from '../../../environments/environment';

export interface ScrapedNews {
    id: string;
    title: string;
    content: string;
    summary?: string;
    original_url?: string;
    image_url?: string;
    published_at?: Date;
    scraped_at: Date;
    is_processed: boolean;
    is_selected: boolean;
    source_id: string;
    source_name?: string;
    category?: string;
    source?: string;
    publishedAt?: Date;
    readingTime?: number;
    humanizedContent?: string;
}

@Component({
    selector: 'app-crear-noticiario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './crear-noticiario.component.html',
    styleUrls: ['./crear-noticiario.component.scss']
})
export class CrearNoticiarioComponent implements OnInit {
    // Form data
    broadcastTitle = '';
    broadcastDescription = '';
    duration = 15;
    selectedNews: ScrapedNews[] = [];

    // Available news
    availableNews: ScrapedNews[] = [];

    // Filter options
    categoryFilter = 'all';
    sourceFilter = 'all';
    dateFilter = 'all';

    // Source selection for scraping
    selectedSourceId: string = 'all';

    // Loading states
    loading = false;
    generating = false;
    humanizing = false;

    // News detail modal
    selectedNewsDetail: ScrapedNews | null = null;

    // Categories
    categories = ['all', 'general', 'deportes', 'tecnología', 'economía', 'política', 'entretenimiento'];

    // Sources
    sources: any[] = [];
    sourceNames: string[] = [];

    // Date filters
    dateFilters = [
        { value: 'all', label: 'Todas' },
        { value: 'today', label: 'Hoy' },
        { value: 'week', label: 'Esta semana' },
        { value: 'month', label: 'Este mes' }
    ];

    constructor(
        private supabaseService: SupabaseService,
        private cdr: ChangeDetectorRef,
        private snackBar: MatSnackBar
    ) { }

    async ngOnInit(): Promise<void> {
        await Promise.all([
            this.loadAvailableNews(),
            this.loadSources()
        ]);
    }

    async loadAvailableNews(): Promise<void> {
        this.loading = true;
        this.cdr.detectChanges();

        try {
            console.log('Loading scraped news...');
            const data = await this.supabaseService.getScrapedNews();
            console.log('Scraped news loaded:', data);

            // Map database fields to interface
            this.availableNews = (data || []).map(item => ({
                id: item.id,
                title: item.title,
                content: item.content,
                summary: item.summary,
                original_url: item.original_url,
                image_url: item.image_url,
                published_at: item.published_at ? new Date(item.published_at) : undefined,
                scraped_at: new Date(item.scraped_at),
                is_processed: item.is_processed,
                is_selected: item.is_selected,
                source_id: item.source_id,
                source_name: item.source_name || 'Fuente desconocida',
                category: item.source_category || 'General',
                publishedAt: item.published_at ? new Date(item.published_at) : undefined,
                readingTime: Math.floor(Math.random() * 60) + 30 // Simulated reading time
            }));

            console.log('Available news mapped:', this.availableNews);
        } catch (error) {
            console.error('Error loading news:', error);
            this.snackBar.open('Error al cargar noticias', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    async loadSources(): Promise<void> {
        try {
            const sources = await this.supabaseService.getNewsSources();
            // Map database fields to interface fields
            this.sources = (sources || []).map(item => ({
                id: item.id,
                name: item.name,
                url: item.url,
                category: item.category,
                active: item.is_active,
                lastScraped: item.last_scraped || null,
                createdAt: item.created_at
            }));
            // Extract source names for the dropdown
            this.sourceNames = ['all', ...(sources || []).map(s => s.name)];
            console.log('Sources loaded:', this.sources);
        } catch (error) {
            console.error('Error loading sources:', error);
        }
    }

    get filteredNews() {
        return this.availableNews.filter(news => {
            const sourceMatch = this.sourceFilter === 'all' || news.source_name === this.sourceFilter;
            const dateMatch = this.dateFilter === 'all' || (news.publishedAt && this.checkDateFilter(news.publishedAt));
            const notSelected = !this.selectedNews.find(n => n.id === news.id);

            return sourceMatch && dateMatch && notSelected;
        });
    }

    checkDateFilter(date: Date): boolean {
        const now = new Date();
        const newsDate = new Date(date);

        switch (this.dateFilter) {
            case 'today':
                return newsDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return newsDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return newsDate >= monthAgo;
            default:
                return true;
        }
    }

    selectNews(news: any) {
        this.selectedNews.push(news);
    }

    removeNews(news: any) {
        const index = this.selectedNews.findIndex(n => n.id === news.id);
        if (index > -1) {
            this.selectedNews.splice(index, 1);
        }
    }

    getTotalReadingTime(): number {
        return this.selectedNews.reduce((total, news) => total + (news.readingTime || 0), 0);
    }

    canCreateBroadcast(): boolean {
        return this.broadcastTitle.trim() !== '' &&
            this.selectedNews.length > 0 &&
            this.getTotalReadingTime() <= this.duration * 60;
    }

    createBroadcast() {
        if (!this.canCreateBroadcast()) return;

        this.generating = true;

        // Simulate broadcast creation
        setTimeout(() => {
            console.log('Creating broadcast:', {
                title: this.broadcastTitle,
                description: this.broadcastDescription,
                duration: this.duration,
                news: this.selectedNews
            });

            this.generating = false;
            alert('¡Noticiero creado exitosamente!');

            // Reset form
            this.broadcastTitle = '';
            this.broadcastDescription = '';
            this.duration = 15;
            this.selectedNews = [];
        }, 2000);
    }

    moveNewsUp(index: number) {
        if (index > 0) {
            [this.selectedNews[index], this.selectedNews[index - 1]] =
                [this.selectedNews[index - 1], this.selectedNews[index]];
        }
    }

    moveNewsDown(index: number) {
        if (index < this.selectedNews.length - 1) {
            [this.selectedNews[index], this.selectedNews[index + 1]] =
                [this.selectedNews[index + 1], this.selectedNews[index]];
        }
    }

    formatDate(date: Date | undefined): string {
        if (!date) return 'Sin fecha';
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

    formatReadingTime(seconds: number | undefined): string {
        if (!seconds) return '-';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes} min ${remainingSeconds > 0 ? remainingSeconds + 's' : ''}`;
        }
        return `${seconds}s`;
    }

    async scrapeNews(): Promise<void> {
        if (this.sources.length === 0) {
            this.snackBar.open('No hay fuentes configuradas para scrapear', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
            return;
        }

        this.loading = true;
        this.cdr.detectChanges();

        try {
            console.log('Scraping news from selected sources...');

            // Get source IDs based on selection
            let sourceIds: string[];
            if (this.selectedSourceId === 'all') {
                const activeSources = this.sources.filter(s => s.active !== false);
                sourceIds = activeSources.map(s => s.id);
            } else {
                sourceIds = [this.selectedSourceId];
            }

            console.log('Selected sources:', sourceIds);

            // Call the backend API to scrape news
            const response = await fetch(`${environment.apiUrl}/api/scrape`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sources: sourceIds
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error scraping news:', errorData);
                throw new Error(errorData.error || 'Error al obtener noticias');
            }

            const data = await response.json();
            console.log('Scraping response:', data);

            this.snackBar.open(
                `Noticias obtenidas exitosamente: ${data.count} noticias`,
                'Cerrar',
                {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                }
            );

            // Reload news after scraping
            await this.loadAvailableNews();
        } catch (error) {
            console.error('Error scraping sources:', error);
            this.snackBar.open(
                'Error al obtener noticias. Por favor intenta nuevamente.',
                'Cerrar',
                {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: ['error-snackbar']
                }
            );
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    viewNewsDetail(news: ScrapedNews): void {
        this.selectedNewsDetail = news;
    }

    closeNewsDetail(): void {
        this.selectedNewsDetail = null;
    }

    async humanizeNews(): Promise<void> {
        if (this.selectedNews.length === 0) {
            this.snackBar.open('No hay noticias seleccionadas para humanizar', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
            return;
        }

        this.humanizing = true;
        this.cdr.detectChanges();

        try {
            console.log('Humanizing news with Gemini AI...');

            let successCount = 0;
            let errorCount = 0;

            for (const news of this.selectedNews) {
                try {
                    // Call Gemini API to humanize the content
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${environment.geminiApiKey}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{
                                        text: `Reescribe la siguiente noticia de manera más natural, humana y atractiva para un noticiero de radio o TV. Mantén la información factual pero hazla más conversacional y fácil de entender. No agregues información que no esté en el texto original.

Título: ${news.title}

Contenido: ${news.content}

Por favor, proporciona solo el texto reescrito sin introducción ni explicaciones adicionales.`
                                    }]
                                }]
                            })
                        }
                    );

                    if (!response.ok) {
                        console.error(`Error humanizing news ${news.id}:`, response.status);
                        errorCount++;
                        continue;
                    }

                    const data = await response.json();
                    
                    if (data.candidates && data.candidates.length > 0) {
                        const humanizedText = data.candidates[0].content.parts[0].text;
                        news.humanizedContent = humanizedText;
                        
                        // Update in database
                        await this.supabaseService.updateScrapedNews(news.id, {
                            content: humanizedText,
                            is_processed: true
                        });
                        
                        successCount++;
                    } else {
                        console.error(`No content generated for news ${news.id}`);
                        errorCount++;
                    }

                } catch (error) {
                    console.error(`Error processing news ${news.id}:`, error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                this.snackBar.open(
                    `${successCount} noticias humanizadas exitosamente${errorCount > 0 ? ` (${errorCount} errores)` : ''}`,
                    'Cerrar',
                    {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    }
                );
            } else {
                throw new Error('No se pudo humanizar ninguna noticia');
            }

        } catch (error) {
            console.error('Error humanizing news:', error);
            this.snackBar.open(
                'Error al humanizar noticias. Por favor intenta nuevamente.',
                'Cerrar',
                {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: ['error-snackbar']
                }
            );
        } finally {
            this.humanizing = false;
            this.cdr.detectChanges();
        }
    }
}
