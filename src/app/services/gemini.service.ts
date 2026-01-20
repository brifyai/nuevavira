import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async humanizeText(text: string): Promise<string> {
    if (!text) return '';

    try {
      const prompt = `Actúa como un redactor de noticias de radio/TV profesional. 
      
      Reescribe el siguiente texto para ser LEÍDO EN VOZ ALTA en un noticiero.
      
      Reglas CRÍTICAS:
      1. Usa un lenguaje natural, fluido y directo.
      2. NO uses formato Markdown (nada de negritas **, cursivas *, ni encabezados #).
      3. NO incluyas frases introductorias como "Aquí tienes la reescritura" o "Claro".
      4. NO uses listas con viñetas; usa oraciones completas y conectores.
      5. El texto debe ser plano, listo para el teleprompter.
      
      Texto original:
      ${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Error:', error);
      throw error;
    }
  }
}
