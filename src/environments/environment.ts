export const environment = {
    production: false,

    // App Configuration
    apiUrl: 'http://localhost:8888',
    azureWorkerUrl: 'https://text-to-speech-worker.brifyaimaster.workers.dev',
    appUrl: 'http://localhost:4200',

    // Supabase Configuration
    supabaseUrl: 'https://xetifamvebflkytbwmir.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldGlmYW12ZWJmbGt5dGJ3bWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjU5MTgsImV4cCI6MjA4Mjk0MTkxOH0.4NWmJsj3bsgDKqQevZ1a76DF14miRCtUoKLrWRcaVcc',

    // ScrapingBee
    scrapingBeeApiKey: '0PP8W5U3GBAJ5LCIOHHZ2MDDVYAG4EQK599KIO00EWIVER2I0NN5MKV37TTRM51FWUJCZC56G2ZK0XK3',

    // Cron Secret
    cronSecret: 'a043d01651cec42c77433fd1f8754bdd01d43b0e56a6f451195e711b1fc95bbb',

    // Google OAuth
    googleClientId: '1079436946260-uop6ddr4mbc4u6ea27ng1a4brnpc2tn7.apps.googleusercontent.com',
    googleClientSecret: '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',
    googleRedirectUri: 'http://localhost:8888/api/auth/google/callback',

    // Gemini AI
    geminiApiKey: 'AIzaSyCvgEjsSLxBC-UCUGiWg7CsbPe8IXx8EPc',

    // Google Cloud TTS
    googleCloudTtsApiKey: 'AIzaSyCvgEjsSLxBC-UCUGiWg7CsbPe8IXx8EPc',

    // Default voice settings
    defaultVoiceSettings: {
        language: 'es-ES',
        voice: 'es-ES-Wavenet-B', // Changed from Standard-A to Wavenet-B for better quality
        speakingRate: 1.0,
        pitch: 0.0 // Slightly lower pitch can sound more authoritative for news
    }
};
