import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        console.log('Initializing Supabase client...');
        console.log('Supabase URL:', environment.supabaseUrl);
        console.log('Supabase Anon Key:', environment.supabaseAnonKey ? 'Present' : 'Missing');
        this.supabase = createClient(
            environment.supabaseUrl,
            environment.supabaseAnonKey
        );
        console.log('Supabase client initialized successfully');
    }

    // Get the Supabase client instance
    getClient(): SupabaseClient {
        return this.supabase;
    }

    // ============================================
    // USERS METHODS
    // ============================================

    async getCurrentUser() {
        const { data: { user } } = await this.supabase.auth.getUser();
        return user;
    }

    // async getUserProfile(userId: string) {
    //     const { data, error } = await this.supabase
    //         .from('users')
    //         .select('*')
    //         .eq('id', userId)
    //         .single();

    //     if (error) throw error;
    //     return data;
    // }

    // async updateUserProfile(userId: string, updates: any) {
    //     const { data, error } = await this.supabase
    //         .from('users')
    //         .update(updates)
    //         .eq('id', userId)
    //         .select()
    //         .single();

    //     if (error) throw error;
    //     return data;
    // }

    // ============================================
    // NEWS SOURCES METHODS
    // ============================================

    async getNewsSources() {
        const { data, error } = await this.supabase
            .from('news_sources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getNewsSourceById(id: string) {
        const { data, error } = await this.supabase
            .from('news_sources')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createNewsSource(source: any) {
        const { data, error } = await this.supabase
            .from('news_sources')
            .insert(source)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateNewsSource(id: string, updates: any) {
        const { data, error } = await this.supabase
            .from('news_sources')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteNewsSource(id: string) {
        const { error } = await this.supabase
            .from('news_sources')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // SCRAPED NEWS METHODS
    // ============================================

    async getScrapedNews(options?: { limit?: number; offset?: number; sourceId?: string }) {
        let query = this.supabase
            .from('news_with_source')
            .select('*')
            .order('published_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        if (options?.sourceId) {
            query = query.eq('source_id', options.sourceId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async getScrapedNewsById(id: string) {
        const { data, error } = await this.supabase
            .from('scraped_news')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createScrapedNews(news: any) {
        const { data, error } = await this.supabase
            .from('scraped_news')
            .insert(news)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateScrapedNews(id: string, updates: any) {
        const { data, error } = await this.supabase
            .from('scraped_news')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteScrapedNews(id: string) {
        const { error } = await this.supabase
            .from('scraped_news')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // HUMANIZED NEWS METHODS
    // ============================================

    async getHumanizedNews(options?: { limit?: number; offset?: number }) {
        let query = this.supabase
            .from('humanized_news')
            .select('*')
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async getHumanizedNewsById(id: string) {
        const { data, error } = await this.supabase
            .from('humanized_news')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createHumanizedNews(news: any) {
        const { data, error } = await this.supabase
            .from('humanized_news')
            .insert(news)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateHumanizedNews(id: string, updates: any) {
        const { data, error } = await this.supabase
            .from('humanized_news')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // NEWS BROADCASTS METHODS
    // ============================================

    async getNewsBroadcasts(options?: { limit?: number; offset?: number; status?: string }) {
        let query = this.supabase
            .from('news_broadcasts')
            .select('*')
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        if (options?.status) {
            query = query.eq('status', options.status);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async getNewsBroadcastById(id: string) {
        const { data, error } = await this.supabase
            .from('news_broadcasts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createNewsBroadcast(broadcast: any) {
        const { data, error } = await this.supabase
            .from('news_broadcasts')
            .insert(broadcast)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateNewsBroadcast(id: string, updates: any) {
        const { data, error } = await this.supabase
            .from('news_broadcasts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteNewsBroadcast(id: string) {
        const { error } = await this.supabase
            .from('news_broadcasts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // BROADCAST NEWS ITEMS METHODS
    // ============================================

    async getBroadcastNewsItems(broadcastId: string) {
        const { data, error } = await this.supabase
            .from('broadcast_news_items')
            .select('*')
            .eq('broadcast_id', broadcastId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data;
    }

    async createBroadcastNewsItem(item: any) {
        const { data, error } = await this.supabase
            .from('broadcast_news_items')
            .insert(item)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteBroadcastNewsItem(id: string) {
        const { error } = await this.supabase
            .from('broadcast_news_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // TTS AUDIO FILES METHODS
    // ============================================

    async getTtsAudioFiles(options?: { limit?: number; offset?: number }) {
        let query = this.supabase
            .from('tts_audio_files')
            .select('*')
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async createTtsAudioFile(audio: any) {
        const { data, error } = await this.supabase
            .from('tts_audio_files')
            .insert(audio)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // AUTOMATION ASSETS METHODS
    // ============================================

    async getAutomationAssets(options?: { limit?: number; offset?: number; type?: string; isActive?: boolean }) {
        let query = this.supabase
            .from('automation_assets')
            .select('*')
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        if (options?.type) {
            query = query.eq('type', options.type);
        }

        if (options?.isActive !== undefined) {
            query = query.eq('is_active', options.isActive);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async getAutomationAssetById(id: string) {
        const { data, error } = await this.supabase
            .from('automation_assets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createAutomationAsset(asset: any) {
        const { data, error } = await this.supabase
            .from('automation_assets')
            .insert(asset)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateAutomationAsset(id: string, updates: any) {
        const { data, error } = await this.supabase
            .from('automation_assets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteAutomationAsset(id: string) {
        const { error } = await this.supabase
            .from('automation_assets')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // AUTOMATION RUNS METHODS
    // ============================================

    async getAutomationRuns(assetId?: string, options?: { limit?: number; offset?: number }) {
        let query = this.supabase
            .from('automation_runs')
            .select('*')
            .order('started_at', { ascending: false });

        if (assetId) {
            query = query.eq('asset_id', assetId);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async createAutomationRun(run: any) {
        const { data, error } = await this.supabase
            .from('automation_runs')
            .insert(run)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateAutomationRun(id: string, updates: any) {
        const { data, error } = await this.supabase
            .from('automation_runs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // TIMELINE EVENTS METHODS
    // ============================================

    async getTimelineEvents(broadcastId: string) {
        const { data, error } = await this.supabase
            .from('timeline_events')
            .select('*')
            .eq('broadcast_id', broadcastId)
            .order('start_time_seconds', { ascending: true });

        if (error) throw error;
        return data;
    }

    async createTimelineEvent(event: any) {
        const { data, error } = await this.supabase
            .from('timeline_events')
            .insert(event)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // SETTINGS METHODS
    // ============================================

    async getSettings() {
        const { data, error } = await this.supabase
            .from('settings')
            .select('*');

        if (error) throw error;
        return data;
    }

    async getSettingByKey(key: string) {
        const { data, error } = await this.supabase
            .from('settings')
            .select('*')
            .eq('key', key)
            .single();

        if (error) throw error;
        return data;
    }

    async updateSetting(key: string, value: any) {
        const { data, error } = await this.supabase
            .from('settings')
            .update({ value })
            .eq('key', key)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // VIEWS METHODS
    // ============================================

    async getBroadcastDetails() {
        const { data, error } = await this.supabase
            .from('broadcast_details')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getNewsWithSource() {
        const { data, error } = await this.supabase
            .from('news_with_source')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getAutomationStatus() {
        const { data, error } = await this.supabase
            .from('automation_status')
            .select('*');

        if (error) throw error;
        return data;
    }

    // ============================================
    // REALTIME SUBSCRIPTIONS
    // ============================================

    subscribeToTable(tableName: string, callback: (payload: any) => void) {
        return this.supabase
            .channel(`public:${tableName}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
            .subscribe();
    }

    subscribeToBroadcast(broadcastId: string, callback: (payload: any) => void) {
        return this.supabase
            .channel(`broadcast:${broadcastId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'broadcast_news_items',
                filter: `broadcast_id=eq.${broadcastId}`
            }, callback)
            .subscribe();
    }

    // Unsubscribe from channel
    unsubscribe(channel: any) {
        this.supabase.removeChannel(channel);
    }
}
