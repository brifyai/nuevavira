import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AzureTtsService {
  private apiUrl = environment.azureWorkerUrl || `${environment.apiUrl}/api/azure-tts`;

  constructor(private http: HttpClient) {}

  async generateSpeech(params: { text: string; voice: string; speed?: number }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post(this.apiUrl, {
          text: params.text,
          voice: params.voice,
          speed: params.speed || 1.0
        }, {
          responseType: 'blob'
        })
      );

      if (response.size === 0) {
        throw new Error('El audio generado está vacío');
      }

      return URL.createObjectURL(response);
    } catch (error: any) {
      console.error('Error generating Azure speech:', error);
      
      // Intentar leer el mensaje de error si viene como Blob
      if (error.error instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
             const errorJson = JSON.parse(reader.result as string);
             console.error('🛑 DETALLE DEL ERROR DEL WORKER:', errorJson);
             // Opcional: Mostrar alerta o notificación
          } catch (e) {
             console.error('🛑 Contenido del error (texto):', reader.result);
          }
        };
        reader.readAsText(error.error);
      }
      
      throw error;
    }
  }

  getVoices(): any[] {
    return [
      { name: 'es-MX-JorgeNeural', gender: 'Male', label: 'Jorge (México)' },
      { name: 'es-US-AlonsoNeural', gender: 'Male', label: 'Alonso (EE.UU.)' },
      { name: 'es-AR-TomasNeural', gender: 'Male', label: 'Tomás (Argentina)' },
      { name: 'es-CL-LorenzoNeural', gender: 'Male', label: 'Lorenzo (Chile)' },
      { name: 'es-AR-ElenaNeural', gender: 'Female', label: 'Elena (Argentina)' },
      { name: 'es-MX-DaliaNeural', gender: 'Female', label: 'Dalia (México)' },
      { name: 'es-US-PalomaNeural', gender: 'Female', label: 'Paloma (EE.UU.)' },
      { name: 'es-CL-CatalinaNeural', gender: 'Female', label: 'Catalina (Chile)' }
    ];
  }
}
