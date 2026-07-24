import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  
  constructor() {}
  
  /**
   * Generate SVG code using Mistral AI
   */
  async generateSvg(prompt: string, temperature: number = 0.2): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ svgCode: string }>('/api/generate-svg', { prompt })
      );
      
      if (response.svgCode) {
        return this.cleanSvgCode(response.svgCode);
      }
      
      throw new Error('No SVG code returned from API');
    } catch (error) {
      console.error('Error generating SVG:', error);
      throw error;
    }
  }
  
  /**
   * Generate enhanced description using Mistral AI
   */
  async enhanceDescription(prompt: string, temperature: number = 0.7): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ enhancedDescription: string }>('/api/enhance-preset', { prompt })
      );
      
      if (response.enhancedDescription) {
        return response.enhancedDescription.trim();
      }
      
      throw new Error('No enhanced description returned from API');
    } catch (error) {
      console.error('Error enhancing description:', error);
      throw error;
    }
  }
  
  /**
   * Generate text content using Mistral AI
   */
  async generateText(prompt: string, temperature: number = 0.7): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ text: string }>('/api/generate-text', { prompt, temperature })
      );
      
      if (response.text) {
        return response.text.trim();
      }
      
      throw new Error('No text returned from API');
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
  
  /**
   * Clean SVG code by removing markdown and other unwanted content
   */
  cleanSvgCode(svgCode: string): string {
    let cleaned = svgCode.trim();
    
    // Remove markdown code blocks
    if (cleaned.includes('```svg')) {
      cleaned = cleaned.split('```svg')[1].split('```')[0].trim();
    } else if (cleaned.includes('```xml')) {
      cleaned = cleaned.split('```xml')[1].split('```')[0].trim();
    } else if (cleaned.includes('```html')) {
      cleaned = cleaned.split('```html')[1].split('```')[0].trim();
    } else if (cleaned.includes('```')) {
      cleaned = cleaned.split('```')[1].split('```')[0].trim();
    }
    
    // Remove XML prolog if present
    cleaned = cleaned.replace(/^<\?xml.*?\?>\s*/i, '');
    
    // Remove comments
    cleaned = cleaned.replace(/<!--.*?-->/gs, '');
    
    // Ensure it starts with <svg
    if (!cleaned.startsWith('<svg')) {
      const svgStart = cleaned.indexOf('<svg');
      if (svgStart > 0) {
        cleaned = cleaned.substring(svgStart);
      }
    }
    
    // Ensure it ends with </svg>
    if (!cleaned.endsWith('</svg>')) {
      const svgEnd = cleaned.lastIndexOf('</svg>');
      if (svgEnd > 0) {
        cleaned = cleaned.substring(0, svgEnd + 6);
      }
    }
    
    return cleaned;
  }
  
  /**
   * Check if Mistral API is configured
   */
  async checkApiConfig(): Promise<{ hasMistral: boolean }> {
    try {
      return await firstValueFrom(
        this.http.get<{ hasMistral: boolean }>('/api/config')
      );
    } catch (error) {
      console.error('Error checking API config:', error);
      return { hasMistral: false };
    }
  }
}
