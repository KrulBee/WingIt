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
