# VIRA - Sistema de Noticias Automatizado

VIRA es una aplicación moderna de Angular para la gestión automatizada de noticias, que permite scrapeo, humanización y generación de noticieros con texto a voz.

## 🚀 Características

- **Dashboard**: Vista general con estadísticas y métricas del sistema
- **Crear Noticiario**: Interfaz para seleccionar noticias y crear noticieros personalizados
- **Último Minuto**: Noticias de última hora en tiempo real con filtros
- **Timeline Noticiario**: Visualización detallada de noticieros creados con timeline
- **Automatización Activos**: Gestión de automatizaciones (scrapers, humanizadores, TTS, etc.)

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Angular CLI
- Cuenta de Supabase
- API Keys de:
  - ScrapingBee
  - Google Gemini AI
  - Google Cloud TTS
  - Google OAuth

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd virafinal
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Edita el archivo `src/environments/environment.ts` con tus credenciales:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8888',
  appUrl: 'http://localhost:8888',
  
  // Supabase Configuration
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  
  // ScrapingBee
  scrapingBeeApiKey: 'YOUR_SCRAPINGBEE_API_KEY',
  
  // Google OAuth
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  googleClientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  googleRedirectUri: 'http://localhost:8888/api/auth/google/callback',
  
  // Gemini AI
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
  
  // Google Cloud TTS
  googleCloudTtsApiKey: 'YOUR_GOOGLE_TTS_API_KEY'
};
```

### 4. Configurar Supabase

#### Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y la Anon Key

#### Ejecutar migraciones de base de datos

```bash
# Usando Supabase CLI
supabase db push

# O ejecuta manualmente el SQL desde:
supabase/migrations/001_initial_schema.sql
```

#### Configurar Google OAuth en Supabase

1. Ve a Authentication > Providers
2. Habilita Google OAuth
3. Configura las credenciales de tu proyecto Google Cloud

### 5. Ejecutar la aplicación

```bash
# Modo desarrollo
ng serve

# Modo producción
ng build --configuration production
```

La aplicación estará disponible en `http://localhost:4200`

## 📁 Estructura del Proyecto

```
virafinal/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── crear-noticiario/
│   │   │   ├── ultimo-minuto/
│   │   │   ├── timeline-noticiario/
│   │   │   └── automatizacion-activos/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.scss
│   └── index.html
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── angular.json
├── package.json
└── README.md
```

## 🗄️ Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema con roles (admin, editor, viewer)
- **news_sources**: Fuentes de noticias para scrapeo
- **scraped_news**: Noticias scrapeadas
- **humanized_news**: Noticias humanizadas para TTS
- **news_broadcasts**: Noticieros creados
- **broadcast_news_items**: Items de noticias en noticieros
- **tts_audio_files**: Archivos de audio generados
- **automation_assets**: Configuraciones de automatización
- **automation_runs**: Historial de ejecuciones
- **timeline_events**: Eventos del timeline de noticieros
- **settings**: Configuraciones del sistema

### Roles de Usuario

- **admin**: Acceso completo a todas las funcionalidades
- **editor**: Puede crear y editar noticieros, ver automatizaciones
- **viewer**: Solo lectura de noticieros y noticias

## 🔧 Funcionalidades por Componente

### Dashboard
- Estadísticas en tiempo real
- Noticias recientes
- Noticieros recientes
- Estado de automatizaciones

### Crear Noticiario
- Selección de noticias con filtros
- Configuración de duración
- Reordenamiento de noticias
- Vista previa del timeline
- Generación de noticiero

### Último Minuto
- Noticias en tiempo real
- Filtros por categoría y fuente
- Prioridad de noticias (alta, media, baja)
- Auto-refresh configurable
- Agregar noticias a noticieros

### Timeline Noticiario
- Vista de cuadrícula y lista
- Timeline detallado de noticieros
- Información de eventos
- Exportación de timeline

### Automatización Activos
- Gestión de scrapers
- Gestión de humanizadores
- Gestión de TTS
- Programación con cron
- Historial de ejecuciones
- Crear, editar, eliminar automatizaciones

## 🔐 Seguridad

- Row Level Security (RLS) en todas las tablas
- Políticas basadas en roles
- Autenticación con Google OAuth
- Variables de entorno para credenciales

## 🎨 Diseño

- Interfaz moderna e intuitiva
- Diseño responsive (móvil, tablet, desktop)
- Tema oscuro con gradientes
- Animaciones suaves
- Accesibilidad (WCAG 2.1)

## 🚀 Despliegue

### Netlify

```bash
ng build --configuration production
netlify deploy --prod --dir=dist/vira-app
```

### Vercel

```bash
ng build --configuration production
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4200
CMD ["npm", "run", "start"]
```

## 📚 APIs Externas

### ScrapingBee
- URL: `https://app.scrapingbee.com/api/v1/`
- Documentación: [ScrapingBee Docs](https://www.scrapingbee.com/documentation)

### Google Gemini AI
- URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Documentación: [Gemini API Docs](https://ai.google.dev/docs)

### Google Cloud TTS
- URL: `https://texttospeech.googleapis.com/v1/text:synthesize`
- Documentación: [Google Cloud TTS Docs](https://cloud.google.com/text-to-speech/docs)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles

## 👥 Soporte

Para soporte, abre un issue en el repositorio o contacta al equipo de desarrollo.

## 🙏 Agradecimientos

- Angular Team por el framework
- Supabase por la base de datos y autenticación
- Google por las APIs de IA y TTS
- ScrapingBee por el servicio de web scraping

---

**Desarrollado con ❤️ usando Angular 18+**
