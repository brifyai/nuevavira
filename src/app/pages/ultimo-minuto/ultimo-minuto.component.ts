import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { GeminiService } from '../../services/gemini.service';
import { GoogleTtsService } from '../../services/google-tts.service';
import { GeminiTtsService } from '../../services/gemini-tts.service';
import { AzureTtsService } from '../../services/azure-tts.service';

interface NewsSource {
    id: string;
    name: string;
    active: boolean;
}

@Component({
    selector: 'app-ultimo-minuto',
    standalone: true,
    imports: [CommonModule, FormsModule, MatSnackBarModule],
    templateUrl: './ultimo-minuto.component.html',
    styleUrls: ['./ultimo-minuto.component.scss']
})
export class UltimoMinutoComponent implements OnInit {
    // Breaking news
    breakingNews: any[] = [];

    // Filter options
    sourceFilter = 'all';

    // Loading state
    loading = false;
    refreshing = false;
    statusMessage = '';

    // Sources
    sources: NewsSource[] = [];

    // Auto-refresh settings
    autoRefresh = false;
    refreshInterval = 60; // seconds

    // Pagination
    currentPage = 1;
    itemsPerPage = 9;

    // Express News State
    showExpressPanel = false;
    selectedNews: any = null;
    humanizedText = '';
    generatedAudioUrl = '';
    isHumanizing = false;
    isGeneratingAudio = false;
    isSavingExpress = false;

    // Advanced Voice Settings
    // ttsEngine: 'google' | 'gemini' | 'azure' = 'google';
    // geminiVoice = 'Fenrir';
    // geminiStyle = 'Noticiero';
    // geminiVoices = [
    //     { id: 'Fenrir', name: 'Fenrir (Hombre - Profundo)', gender: 'Male' },
    //     { id: 'Puck', name: 'Puck (Hombre - Energético)', gender: 'Male' },
    //     { id: 'Zephyr', name: 'Zephyr (Hombre - Suave)', gender: 'Male' },
    //     { id: 'Kore', name: 'Kore (Mujer - Clara)', gender: 'Female' },
    //     { id: 'Charon', name: 'Charon (Mujer - Profunda)', gender: 'Female' }
    // ];
    // geminiStyles = ['Noticiero', 'Natural', 'Alegre', 'Serio', 'Susurrar'];
    // geminiSpeed = 1.0;

    // Azure Settings
    azureVoice = 'es-CL-LorenzoNeural';
    azureSpeed = 1.0;
    azureVoices: any[] = [];

    constructor(
        private supabaseService: SupabaseService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        private geminiService: GeminiService,
        private googleTtsService: GoogleTtsService,
        private geminiTtsService: GeminiTtsService,
        private azureTtsService: AzureTtsService
    ) {
        this.azureVoices = this.azureTtsService.getVoices();
    }

    ngOnInit(): void {
        this.loadSources();
        this.loadScrapedNews();
    }

    async loadSources() {
        try {
            const sources = await this.supabaseService.getNewsSources();
            if (sources) {
                // Filter only active sources for the dropdown
                this.sources = sources
                    .filter((s: any) => s.is_active)
                    .map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        active: s.is_active
                    }));
            }
        } catch (error) {
            console.error('Error loading sources:', error);
            this.snackBar.open('Error al cargar las fuentes', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
        }
    }

    async loadScrapedNews(isBackground: boolean = false) {
        if (!isBackground) {
            this.loading = true;
        }
        try {
            const news = await this.supabaseService.getScrapedNews({ limit: 50 });
            if (news) {
                this.breakingNews = news.map((n: any) => {
                    const publishedAt = new Date(n.published_at);
                    return {
                        id: n.id,
                        title: n.title,
                        content: n.content || n.summary,
                        source: n.source_name || 'Fuente desconocida',
                        source_id: n.source_id,
                        publishedAt: publishedAt,
                        timeAgo: this.calculateTimeAgo(publishedAt),
                        priority: 'medium',
                        imageUrl: n.image_url,
                        url: n.original_url
                    };
                }).filter((item: any) => {
                    // Filter out invalid content client-side
                    const invalidPhrases = [
                        'Error de conexión', 
                        'timeout', 
                        'Ver términos y condiciones', 
                        'Suscríbete', 
                        'Inicia sesión',
                        'No se pudo extraer',
                        'Puertos y Logística Radio Temporada II'
                    ];
                    const content = (item.content || '').toLowerCase();
                    const title = (item.title || '').toLowerCase();
                    
                    const isInvalid = invalidPhrases.some(phrase => 
                        content.includes(phrase.toLowerCase()) || title.includes(phrase.toLowerCase())
                    );
                    
                    return !isInvalid && item.title && item.content && item.content.length > 5;
                });

                // Deduplicate by URL and Title
                const seenUrls = new Set();
                const seenTitles = new Set();
                this.breakingNews = this.breakingNews.filter(item => {
                    if (seenUrls.has(item.url) || seenTitles.has(item.title)) {
                        return false;
                    }
                    seenUrls.add(item.url);
                    seenTitles.add(item.title);
                    return true;
                });
                
                if (this.sources.length > 0) {
                     this.breakingNews.forEach(item => {
                        const source = this.sources.find(s => s.id === item.source_id);
                        if (source) {
                            item.source = source.name;
                        }
                     });
                }
            }
        } catch (error) {
            console.error('Error loading news:', error);
            this.snackBar.open('Error al cargar noticias', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
        } finally {
            if (!isBackground) {
                this.loading = false;
            }
            this.cdr.detectChanges();
        }
    }

    calculateTimeAgo(date: Date): string {
        if (!date) return '';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        return date.toLocaleDateString('es-ES');
    }

    async refreshNews() {
        this.refreshing = true;
        this.statusMessage = 'Contactando fuentes...';
        this.cdr.detectChanges(); // Ensure initial state is rendered

        try {
            // Determine sources to scrape based on filter
            let sourceIds: string[] = [];
            if (this.sourceFilter === 'all') {
                sourceIds = this.sources.filter(s => s.active).map(s => s.id);
            } else {
                sourceIds = [this.sourceFilter];
            }

            if (sourceIds.length === 0) {
                this.snackBar.open('No hay fuentes activas seleccionadas para actualizar', 'Cerrar', {
                    duration: 3000
                });
                this.refreshing = false;
                this.statusMessage = '';
                return;
            }

            console.log('Scraping sources:', sourceIds);
            
            // Call scraping API with streaming support
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
                throw new Error('Error de conexión con el servidor');
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                
                // Process all complete lines
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    try {
                        const data = JSON.parse(line);
                        
                        switch (data.type) {
                            case 'start':
                                this.statusMessage = data.message;
                                break;
                            case 'progress':
                                this.statusMessage = data.message;
                                break;
                            case 'saving':
                                this.statusMessage = data.message;
                                break;
                            case 'complete':
                                this.snackBar.open(
                                    data.message,
                                    'Cerrar',
                                    { duration: 3000, verticalPosition: 'top' }
                                );
                                break;
                            case 'error':
                                throw new Error(data.error);
                        }
                        // Force update UI for progress
                        this.cdr.detectChanges();
                    } catch (e) {
                        console.error('Error parsing stream data:', e);
                    }
                }
            }

            this.statusMessage = 'Actualizando lista...';
            this.cdr.detectChanges();
            
            // Reload news to show latest
            await this.loadScrapedNews(true);

        } catch (error: any) {
            console.error('Error refreshing news:', error);
            this.snackBar.open(error.message || 'Error al actualizar noticias', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
        } finally {
            this.refreshing = false;
            this.statusMessage = '';
            this.cdr.detectChanges();
        }
    }

    get filteredNews() {
        return this.breakingNews.filter(news => {
            // Filter by selected source
            const sourceMatch = this.sourceFilter === 'all' || news.source_id === this.sourceFilter;
            
            // Allow news with "Unknown" source if they have no ID (legacy/test data)
            // Or if they map to a valid active source
            const isSourceActive = !news.source_id || this.sources.some(s => s.id === news.source_id);
            
            return sourceMatch && isSourceActive;
        }).sort((a: any, b: any) => {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
    }

    // Express News Methods
    openExpressPanel(news: any) {
        this.selectedNews = news;
        this.humanizedText = ''; // Start empty so user knows it needs humanization
        this.generatedAudioUrl = '';
        this.showExpressPanel = true;
        
        setTimeout(() => {
            const panel = document.getElementById('express-news-panel');
            if (panel) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    closeExpressPanel() {
        this.showExpressPanel = false;
        this.selectedNews = null;
        this.humanizedText = '';
        this.generatedAudioUrl = '';
    }

    async humanizeNews() {
        if (!this.selectedNews) return;
        
        this.isHumanizing = true;
        try {
            this.humanizedText = await this.geminiService.humanizeText(this.selectedNews.content);
        } catch (error) {
            console.error('Error humanizing news:', error);
            this.snackBar.open('Error al humanizar la noticia', 'Cerrar', { duration: 3000 });
        } finally {
            this.isHumanizing = false;
            this.cdr.detectChanges();
        }
    }

    async generateAudio() {
        if (!this.humanizedText) return;
        
        this.isGeneratingAudio = true;
        try {
            // Always use Azure TTS
            this.generatedAudioUrl = await this.azureTtsService.generateSpeech({
                text: this.humanizedText,
                voice: this.azureVoice,
                speed: this.azureSpeed
            });
        } catch (error: any) {
            console.error('Error generating audio:', error);
            const errorMessage = error.message || 'Error al generar audio';
            this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 5000 });
        } finally {
            this.isGeneratingAudio = false;
            this.cdr.detectChanges();
        }
    }

    insertTag(tag: string) {
        const textarea = document.getElementById('humanizedTextarea') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = this.humanizedText;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);
            
            this.humanizedText = before + tag + after;
            
            // Restore focus and cursor position after update
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + tag.length, start + tag.length);
            }, 0);
        } else {
            this.humanizedText += tag;
        }
    }

    async saveExpressNews() {
        if (!this.selectedNews || !this.humanizedText) return;

        this.isSavingExpress = true;
        try {
            const newsData = {
                scraped_news_id: this.selectedNews.id,
                title: this.selectedNews.title,
                content: this.humanizedText,
                audio_url: this.generatedAudioUrl,
                status: 'draft'
            };

            await this.supabaseService.createHumanizedNews(newsData);
            this.snackBar.open('Noticia Express guardada correctamente', 'Cerrar', { duration: 3000 });
            this.closeExpressPanel();
        } catch (error) {
            console.error('Error saving express news:', error);
            this.snackBar.open('Error al guardar noticia express', 'Cerrar', { duration: 3000 });
        } finally {
            this.isSavingExpress = false;
            this.cdr.detectChanges();
        }
    }

    get paginatedNews() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredNews.slice(startIndex, startIndex + this.itemsPerPage);
    }

    get totalPages() {
        return Math.ceil(this.filteredNews.length / this.itemsPerPage);
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
        // Here you would implement adding to a broadcast queue in Supabase
        this.snackBar.open(`"${news.title}" agregada al noticiero`, 'Cerrar', {
            duration: 2000
        });
    }

    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
        // Logic for auto-refresh interval could be implemented here using setInterval
        if (this.autoRefresh) {
             this.snackBar.open('Auto-refresh activado', 'Cerrar', { duration: 2000 });
        }
    }
}
