import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../../environments/environment';

export interface VoiceParams {
  text: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  style?: 'Natural' | 'Noticiero' | 'Alegre' | 'Triste' | 'Serio' | 'Susurrar';
  speed?: number; // 0.5 to 2.0
  pitch?: number; // -10 to 10
}

@Injectable({
  providedIn: 'root'
})
export class GeminiTtsService {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: environment.geminiApiKey });
  }

  async generateSpeech(params: VoiceParams): Promise<string> {
    const cleanText = this.stripMarkdown(params.text);
    
    // Simplificación radical: Enviamos solo el texto para evitar que el modelo se confunda con instrucciones complejas.
    const textPrompt = cleanText;

    console.log('--- INICIO GENERACIÓN AUDIO GEMINI ---');
    console.log('Params:', JSON.stringify({ ...params, text: params.text.substring(0, 50) + '...' }));
    console.log('Longitud del texto:', textPrompt.length);

    // Si el texto es muy largo, usar chunking
    if (textPrompt.length > 300) {
      console.log('Texto largo detectado, usando chunking...');
      return this.processLongText(textPrompt, params.voiceName, params.speed);
    }

    try {
      // Usar un modelo que sepamos que responde rápido o ajustar el timeout
      // Si el usuario reportó problemas con "pro", tal vez "flash" sea mejor opción si "pro" es muy lento.
      // Pero mantendremos el que está y subiremos el timeout.
      const modelName = 'gemini-2.5-pro-preview-tts'; 
      console.log('Enviando solicitud a Gemini TTS con modelo:', modelName);
      
      const timeoutMs = 150000; // 150 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Tiempo de espera agotado (${timeoutMs/1000}s) para Gemini TTS`)), timeoutMs)
      );

      const apiCall = this.makeApiCall(modelName, textPrompt, params.voiceName, params.speed);

      console.time('GeminiTTS_Request');
      // Competencia entre la llamada a la API y el timeout
      const response = await Promise.race([apiCall, timeoutPromise]) as any;
      console.timeEnd('GeminiTTS_Request');
      
      return this.processResponse(response);

    } catch (error) {
      console.error('Gemini TTS Error:', error);
      throw error;
    }
  }

  private async processLongText(text: string, voiceName: string, speed?: number): Promise<string> {
    const chunks = this.splitTextIntoChunks(text, 300);
    console.log(`Texto dividido en ${chunks.length} chunks. Procesando con concurrencia...`);

    const modelName = 'gemini-2.5-pro-preview-tts';
    const maxConcurrency = 3; // Procesar máximo 3 chunks a la vez para no saturar y ser más rápidos
    const results: { index: number, buffer: Uint8Array }[] = [];

    // Función auxiliar para procesar un solo chunk con reintentos
    const processChunk = async (chunk: string, index: number) => {
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            attempts++;
            try {
                console.log(`Iniciando chunk ${index + 1}/${chunks.length} (Intento ${attempts})...`);
                const timeoutMs = 150000; 
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Timeout chunk ${index+1}`)), timeoutMs)
                );

                const apiCall = this.makeApiCall(modelName, chunk, voiceName, speed);
                const response = await Promise.race([apiCall, timeoutPromise]) as any;
                const buffer = this.extractAudioBuffer(response);
                
                console.log(`Chunk ${index + 1} completado.`);
                return { index, buffer };
            } catch (error) {
                console.error(`Error chunk ${index + 1} (Intento ${attempts}):`, error);
                if (attempts >= maxAttempts) throw error;
                await new Promise(r => setTimeout(r, 1000 * attempts));
            }
        }
        throw new Error(`Chunk ${index + 1} failed`);
    };

    // Gestión de concurrencia
    const executing = new Set<Promise<any>>();
    const promises: Promise<any>[] = [];

    for (let i = 0; i < chunks.length; i++) {
        const p = processChunk(chunks[i], i).then(result => {
            results.push(result);
            return result;
        });
        
        promises.push(p);
        executing.add(p);
        
        const clean = () => executing.delete(p);
        p.then(clean).catch(clean);

        if (executing.size >= maxConcurrency) {
            await Promise.race(executing);
        }
    }

    await Promise.all(promises);

    // Ordenar resultados por índice original para mantener el orden del texto
    results.sort((a, b) => a.index - b.index);
    const audioBuffers = results.map(r => r.buffer);

    return this.combineAudioBuffers(audioBuffers);
  }

  private splitTextIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    
    // Dividir primero por frases para respetar puntuación
    // Usamos una regex que mantiene el delimitador
    const sentences = text.split(/([.?!]+[\s\n]+)/);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      
      if ((currentChunk.length + sentence.length) > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    
    // Revisión de seguridad: si algún chunk sigue siendo demasiado largo (ej. una frase gigante sin puntos)
    // podríamos forzar un corte, pero por ahora asumimos que el texto tiene puntuación razonable.
    
    return chunks;
  }

  private makeApiCall(modelName: string, text: string, voiceName: string, speed: number = 1.0) {
      // Intentamos pasar la configuración de velocidad.
      // Nota: La API de Gemini TTS es experimental y la ubicación de speakingRate puede variar.
      // Probamos inyectándolo en voiceConfig o speechConfig.
      return this.client.models.generateContent({
        model: modelName,
        contents: [
            {
                parts: [
                    { text: text }
                ]
            }
        ],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: voiceName
                    }
                }
            }
        }
      });
  }

  private extractAudioBuffer(response: any): Uint8Array {
      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
          throw new Error("Respuesta incompleta de Gemini.");
      }

      const audioPart = candidate.content.parts.find((part: any) => part.inlineData && part.inlineData.data);
      const inlineData = audioPart?.inlineData;

      if (!inlineData || !inlineData.data) {
        const textPart = candidate.content.parts.find((part: any) => part.text);
        if (textPart && textPart.text) {
             throw new Error(`El modelo devolvió texto en lugar de audio: "${textPart.text.substring(0, 50)}..."`);
        }
        throw new Error("No se generó audio en la respuesta de Gemini.");
      }

      const binaryString = window.atob(inlineData.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  }

  private processResponse(response: any): string {
      const bytes = this.extractAudioBuffer(response);
      return this.combineAudioBuffers([bytes]);
  }

  private combineAudioBuffers(buffers: Uint8Array[]): string {
      // Calcular tamaño total
      const totalLength = buffers.reduce((acc, curr) => acc + curr.length, 0);
      
      // Concatenar todos los buffers PCM
      const combinedBuffer = new Uint8Array(totalLength);
      let offset = 0;
      for (const buffer of buffers) {
          combinedBuffer.set(buffer, offset);
          offset += buffer.length;
      }

      // Añadir cabecera WAV única
      const sampleRate = 24000;
      const numChannels = 1; 
      const bitsPerSample = 16;
      
      const wavHeader = this.createWavHeader(totalLength, numChannels, sampleRate, bitsPerSample);
      const wavBytes = new Uint8Array(wavHeader.length + totalLength);
      wavBytes.set(wavHeader);
      wavBytes.set(combinedBuffer, wavHeader.length);

      console.log(`Audio combinado generado. Tamaño: ${wavBytes.length} bytes. Duración aprox: ${totalLength / (sampleRate * 2)}s`);

      const blob = new Blob([wavBytes], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
  }

  private createWavHeader(dataLength: number, numChannels: number, sampleRate: number, bitsPerSample: number): Uint8Array {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + dataLength, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    // bits per sample
    view.setUint16(34, bitsPerSample, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, dataLength, true);

    return new Uint8Array(header);
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private stripMarkdown(text: string): string {
     if (!text) return '';
     return text
       // Eliminar introducciones comunes de IA (heurística simple)
       .replace(/^(Aquí tienes|Claro,|Por supuesto,|Esta es una|A continuación|Te presento|Aquí está).+?(:|\n)/i, '')
       // Eliminar encabezados (### Title)
       .replace(/^#+\s+/gm, '')
       // Eliminar negrita/cursiva (***text***, **text**, *text*)
       .replace(/(\*{1,3})(.*?)\1/g, '$2')
       // Eliminar enlaces [text](url)
       .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
       // Eliminar listas (- item)
       .replace(/^\s*[\-\*]\s+/gm, '')
       // Eliminar código (`code`)
       .replace(/`([^`]+)`/g, '$1')
       // Eliminar bloques de código (```code```)
       .replace(/```[\s\S]*?```/g, '')
       .trim();
   }
}
