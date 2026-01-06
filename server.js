const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = 'https://xetifamvebflkytbwmir.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldGlmYW12ZWJmbGt5dGJ3bWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjU5MTgsImV4cCI6MjA4Mjk0MTkxOH0.4NWmJsj3bsgDKqQevZ1a76DF14miRCtUoKLrWRcaVcc';
const supabase = createClient(supabaseUrl, supabaseKey);

const scrapingBeeApiKey = '0PP8W5U3GBAJ5LCIOHHZ2MDDVYAG4EQK599KIO00EWIVER2I0NN5MKV37TTRM51FWUJCZC56G2ZK0XK3';

// Scrape endpoint
app.post('/api/scrape', async (req, res) => {
    console.log('Scrape request received:', req.body);

    try {
        const { sources } = req.body;

        if (!sources || !Array.isArray(sources) || sources.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No sources provided'
            });
        }

        // Get active sources from Supabase
        const { data: sourcesData, error: sourcesError } = await supabase
            .from('news_sources')
            .select('*')
            .in('id', sources)
            .eq('is_active', true);

        if (sourcesError) {
            console.error('Error fetching sources:', sourcesError);
            throw sourcesError;
        }

        if (!sourcesData || sourcesData.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No active sources found'
            });
        }

        const scrapedNews = [];

        // Scrape each source using ScrapingBee
        for (const source of sourcesData) {
            try {
                console.log(`Scraping source: ${source.name} (${source.url})`);

                // Get HTML with render_js enabled and wait for content to load
                const response = await fetch(
                    `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeApiKey}&url=${encodeURIComponent(source.url)}&render_js=true&wait=3000&window_width=1920&window_height=1080`
                );

                if (!response.ok) {
                    console.error(`Failed to scrape ${source.name}:`, response.status, response.statusText);
                    continue;
                }

                const html = await response.text();
                console.log(`HTML length for ${source.name}:`, html.length);

                // Step 1: Extract news articles with their links
                const newsArticles = [];
                const seenUrls = new Set();

                // Pattern 1: Look for article links with titles
                // Try to find links that look like news articles
                const linkRegex = /<a[^>]*href=["']([^"']*?)["'][^>]*>(.*?)<\/a>/gi;
                let linkMatch;
                
                while ((linkMatch = linkRegex.exec(html)) !== null && newsArticles.length < 10) {
                    const href = linkMatch[1];
                    const linkText = linkMatch[2].replace(/<[^>]*>/g, '').trim();
                    
                    // Build full URL
                    let fullUrl = href;
                    if (href.startsWith('/')) {
                        const urlObj = new URL(source.url);
                        fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
                    } else if (!href.startsWith('http')) {
                        continue; // Skip relative URLs without /
                    }
                    
                    // Filter for news-like URLs and meaningful titles
                    if (linkText.length > 25 &&
                        !seenUrls.has(fullUrl) &&
                        !linkText.toLowerCase().includes('más') &&
                        !linkText.toLowerCase().includes('ver todo') &&
                        !linkText.toLowerCase().includes('menú') &&
                        !linkText.toLowerCase().includes('login') &&
                        !linkText.toLowerCase().includes('registrarse') &&
                        !linkText.toLowerCase().includes('&nbsp;') &&
                        !href.includes('#') &&
                        !href.includes('javascript') &&
                        (href.includes('/tv/') || // Soy Chile specific
                         href.includes('/noticia') || 
                         href.includes('/articulo') || 
                         href.includes('.html') || // Many news sites use .html
                         href.includes('/2024/') || 
                         href.includes('/2025/') || 
                         href.includes('/2026/') ||
                         href.match(/\/\d{4}\/\d{2}\/\d{2}\//) || // Date pattern
                         href.match(/\/[a-z-]+\/\d+/) || // slug with ID
                         (href.startsWith('/') && href.split('/').length > 2))) { // Multi-level path
                        
                        seenUrls.add(fullUrl);
                        newsArticles.push({
                            title: linkText,
                            url: fullUrl
                        });
                    }
                }

                // Pattern 2: Also look for h1-h6 tags that might contain article titles
                const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
                let headingMatch;
                
                while ((headingMatch = headingRegex.exec(html)) !== null && newsArticles.length < 10) {
                    const headingHtml = headingMatch[1];
                    const title = headingHtml.replace(/<[^>]*>/g, '').trim();
                    
                    // Try to find a link within or near this heading
                    const headingLinkMatch = headingHtml.match(/<a[^>]*href=["']([^"']*?)["'][^>]*>/i);
                    
                    if (headingLinkMatch && title.length > 20) {
                        let href = headingLinkMatch[1];
                        let fullUrl = href;
                        
                        if (href.startsWith('/')) {
                            const urlObj = new URL(source.url);
                            fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
                        } else if (!href.startsWith('http')) {
                            continue;
                        }
                        
                        if (!seenUrls.has(fullUrl) && 
                            !href.includes('#') && 
                            !href.includes('javascript')) {
                            seenUrls.add(fullUrl);
                            newsArticles.push({
                                title: title,
                                url: fullUrl
                            });
                        }
                    }
                }

                console.log(`Found ${newsArticles.length} news articles for ${source.name}`);

                if (newsArticles.length === 0) {
                    console.log(`No news articles found for ${source.name}`);
                    continue;
                }

                // Step 2: Visit each article and extract full content
                for (const article of newsArticles) {
                    try {
                        console.log(`Fetching full content from: ${article.url}`);
                        
                        // Fetch the individual article page
                        const articleResponse = await fetch(
                            `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeApiKey}&url=${encodeURIComponent(article.url)}&render_js=true&wait=2000`
                        );

                        if (!articleResponse.ok) {
                            console.error(`Failed to fetch article ${article.url}:`, articleResponse.status);
                            // Use title as content if we can't fetch the article
                            scrapedNews.push({
                                title: article.title,
                                content: `${article.title}\n\nNo se pudo obtener el contenido completo de esta noticia.`,
                                summary: article.title.substring(0, 200),
                                original_url: article.url,
                                image_url: null,
                                published_at: new Date().toISOString(),
                                scraped_at: new Date().toISOString(),
                                is_processed: false,
                                is_selected: false,
                                source_id: source.id
                            });
                            continue;
                        }

                        const articleHtml = await articleResponse.text();
                        console.log(`Article HTML length: ${articleHtml.length}`);

                        // Extract article content
                        let fullContent = '';
                        let imageUrl = null;

                        // Try to find the main article content
                        // Pattern 1: Look for article tag
                        const articleTagMatch = articleHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
                        if (articleTagMatch) {
                            const articleContent = articleTagMatch[1];
                            
                            // Extract all paragraphs from article
                            const paragraphRegex = /<p[^>]*>([^<]+(?:<[^/][^>]*>[^<]*<\/[^>]+>)*[^<]*)<\/p>/gi;
                            const paragraphs = [];
                            let pMatch;
                            
                            while ((pMatch = paragraphRegex.exec(articleContent)) !== null) {
                                const text = pMatch[1]
                                    .replace(/<[^>]*>/g, '')
                                    .replace(/&nbsp;/g, ' ')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&amp;/g, '&')
                                    .replace(/&#\d+;/g, '')
                                    .trim();
                                if (text.length > 30 &&
                                    !text.toLowerCase().includes('cookie') &&
                                    !text.toLowerCase().includes('suscríbete') &&
                                    !text.toLowerCase().includes('newsletter') &&
                                    !text.toLowerCase().includes('términos y condiciones') &&
                                    !text.toLowerCase().includes('todos los derechos reservados') &&
                                    !text.toLowerCase().includes('beginning of dialog') &&
                                    !text.toLowerCase().includes('escape will cancel')) {
                                    paragraphs.push(text);
                                }
                            }
                            
                            fullContent = paragraphs.join('\n\n');
                        }

                        // Pattern 2: If no article tag, look for main content area with specific classes
                        if (!fullContent || fullContent.length < 100) {
                            const contentPatterns = [
                                /<div[^>]*class=["'][^"']*(?:article-content|post-content|entry-content|story-content|news-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
                                /<div[^>]*id=["'][^"']*(?:article|content|post|entry)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
                                /<main[^>]*>([\s\S]*?)<\/main>/i
                            ];
                            
                            for (const pattern of contentPatterns) {
                                const match = articleHtml.match(pattern);
                                if (match && match[1]) {
                                    const content = match[1];
                                    const paragraphRegex = /<p[^>]*>([^<]+(?:<[^/][^>]*>[^<]*<\/[^>]+>)*[^<]*)<\/p>/gi;
                                    const paragraphs = [];
                                    let pMatch;
                                    
                                    while ((pMatch = paragraphRegex.exec(content)) !== null) {
                                        const text = pMatch[1]
                                            .replace(/<[^>]*>/g, '')
                                            .replace(/&nbsp;/g, ' ')
                                            .replace(/&quot;/g, '"')
                                            .replace(/&amp;/g, '&')
                                            .replace(/&#\d+;/g, '')
                                            .trim();
                                        if (text.length > 30 &&
                                            !text.toLowerCase().includes('cookie') &&
                                            !text.toLowerCase().includes('suscríbete') &&
                                            !text.toLowerCase().includes('newsletter') &&
                                            !text.toLowerCase().includes('beginning of dialog')) {
                                            paragraphs.push(text);
                                        }
                                    }
                                    
                                    if (paragraphs.length > 0) {
                                        fullContent = paragraphs.join('\n\n');
                                        break;
                                    }
                                }
                            }
                        }

                        // Pattern 3: Last resort - get all meaningful paragraphs but filter better
                        if (!fullContent || fullContent.length < 100) {
                            const paragraphRegex = /<p[^>]*>([^<]{80,})<\/p>/gi;
                            const paragraphs = [];
                            let pMatch;
                            
                            while ((pMatch = paragraphRegex.exec(articleHtml)) !== null && paragraphs.length < 8) {
                                const text = pMatch[1]
                                    .replace(/&nbsp;/g, ' ')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&amp;/g, '&')
                                    .replace(/&#\d+;/g, '')
                                    .trim();
                                if (text.length > 80 &&
                                    !text.toLowerCase().includes('cookie') &&
                                    !text.toLowerCase().includes('suscríbete') &&
                                    !text.toLowerCase().includes('newsletter') &&
                                    !text.toLowerCase().includes('términos y condiciones') &&
                                    !text.toLowerCase().includes('política de privacidad') &&
                                    !text.toLowerCase().includes('todos los derechos reservados') &&
                                    !text.toLowerCase().includes('beginning of dialog') &&
                                    !text.toLowerCase().includes('escape will cancel') &&
                                    !text.toLowerCase().includes('región sostenible') &&
                                    !text.toLowerCase().includes('conversamos en extenso')) {
                                    paragraphs.push(text);
                                }
                            }
                            
                            fullContent = paragraphs.join('\n\n');
                        }

                        // Extract image
                        const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/i;
                        const imgMatch = articleHtml.match(imgRegex);
                        if (imgMatch) {
                            imageUrl = imgMatch[1];
                            // Make sure image URL is absolute
                            if (imageUrl.startsWith('/')) {
                                const urlObj = new URL(article.url);
                                imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
                            }
                        }

                        // If still no content, use title
                        if (!fullContent || fullContent.length < 50) {
                            fullContent = `${article.title}\n\nNo se pudo extraer el contenido completo de esta noticia. Por favor, visita el enlace original para leer más.`;
                        }

                        const newsItem = {
                            title: article.title,
                            content: fullContent,
                            summary: fullContent.substring(0, 200) + (fullContent.length > 200 ? '...' : ''),
                            original_url: article.url,
                            image_url: imageUrl,
                            published_at: new Date().toISOString(),
                            scraped_at: new Date().toISOString(),
                            is_processed: false,
                            is_selected: false,
                            source_id: source.id
                        };

                        scrapedNews.push(newsItem);
                        console.log(`Successfully scraped: ${article.title} (${fullContent.length} chars)`);

                    } catch (error) {
                        console.error(`Error scraping article ${article.url}:`, error);
                        // Add article with limited content on error
                        scrapedNews.push({
                            title: article.title,
                            content: `${article.title}\n\nError al obtener el contenido completo.`,
                            summary: article.title.substring(0, 200),
                            original_url: article.url,
                            image_url: null,
                            published_at: new Date().toISOString(),
                            scraped_at: new Date().toISOString(),
                            is_processed: false,
                            is_selected: false,
                            source_id: source.id
                        });
                    }
                }

                console.log(`Successfully processed ${newsArticles.length} articles from ${source.name}`);
            } catch (error) {
                console.error(`Error scraping ${source.name}:`, error);
                continue;
            }
        }

        // Insert scraped news into Supabase
        if (scrapedNews.length > 0) {
            const { error: insertError } = await supabase
                .from('scraped_news')
                .insert(scrapedNews);

            if (insertError) {
                console.error('Error inserting scraped news:', insertError);
                throw insertError;
            }
        }

        res.json({
            success: true,
            count: scrapedNews.length,
            message: `Successfully scraped ${scrapedNews.length} news items`
        });
    } catch (error) {
        console.error('Error in scrape endpoint:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = 8888;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Scrape endpoint: http://localhost:${PORT}/api/scrape`);
});
