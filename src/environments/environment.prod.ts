export const environment = {
    production: true,

    // App Configuration
    apiUrl: 'https://virav3.netlify.app',
    appUrl: 'https://virav3.netlify.app',

    // Supabase Configuration
    supabaseUrl: 'YOUR_SUPABASE_URL',
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',

    // ScrapingBee
    scrapingBeeApiKey: '0PP8W5U3GBAJ5LCIOHHZ2MDDVYAG4EQK599KIO00EWIVER2I0NN5MKV37TTRM51FWUJCZC56G2ZK0XK3',

    // Cron Secret
    cronSecret: 'a043d01651cec42c77433fd1f8754bdd01d43b0e56a6f451195e711b1fc95bbb',

    // Google OAuth
    googleClientId: '1079436946260-uop6ddr4mbc4u6ea27ng1a4brnpc2tn7.apps.googleusercontent.com',
    googleClientSecret: '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',
    googleRedirectUri: 'https://virav3.netlify.app/api/auth/google/callback',

    // Gemini AI
    geminiApiKey: 'AIzaSyBbhTtunEQ4VDV2L1DnQ63q0OobLVu-aEk',

    // Google Cloud TTS
    googleCloudTtsApiKey: 'AQ.Ab8RN6JclgD9eTb7VI1-j4PJIAdGuZ0l-d_wubhqmMQnM3qYfg',

    // Default voice settings
    defaultVoiceSettings: {
        language: 'es-ES',
        voice: 'es-ES-Standard-A',
        speakingRate: 1.0,
        pitch: 1.0
    }
};
