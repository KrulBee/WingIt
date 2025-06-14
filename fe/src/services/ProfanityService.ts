import { createAuthHeaders } from './AuthService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Interface for profanity detection results
export interface ProfanityResult {
  is_profane: boolean;
  confidence: number;
  toxic_spans: number[][];
  processed_text: string;
  error?: string;
}

class ProfanityService {
  /**
   * Check if text contains profanity
   * @param text The text to check
   * @returns Promise<ProfanityResult>
   */
  async checkProfanity(text: string): Promise<ProfanityResult> {
    try {
      const aiServerUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:5000';
      const response = await fetch(`${aiServerUrl}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking profanity:', error);
      // Return safe result on error to not block user
      return {
        is_profane: false,
        confidence: 0,
        toxic_spans: [],
        processed_text: text,
        error: 'Could not check profanity. Content allowed.',
      };
    }
  }

  /**
   * Check if AI server is healthy
   * @returns Promise<boolean>
   */
  async isServerHealthy(): Promise<boolean> {
    try {
      const aiServerUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:5000';
      const response = await fetch(`${aiServerUrl}/health`);
      const result = await response.json();
      return result.status === 'healthy' && result.model_loaded;
    } catch {
      return false;
    }
  }

  /**
   * Get model information
   * @returns Promise<object>
   */
  async getModelInfo(): Promise<any> {
    try {
      const aiServerUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:5000';
      const response = await fetch(`${aiServerUrl}/model_info`);
      return await response.json();
    } catch (error) {
      console.error('Error getting model info:', error);
      return null;
    }
  }

  /**
   * Handle profanity error from backend
   * @param error The error message
   * @returns boolean indicating if error is profanity-related
   */
  isProfanityError(error: string): boolean {
    return error.includes('từ ngữ không phù hợp') || 
           error.includes('chứa từ ngữ không phù hợp') ||
           error.includes('inappropriate content');
  }

  /**
   * Format profanity error message for user
   * @param error The error message
   * @returns Formatted user-friendly message
   */
  formatProfanityError(error: string): string {
    if (this.isProfanityError(error)) {
      return "Nội dung của bạn chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.";
    }
    return error;
  }
}

export default new ProfanityService();
