/**
 * Service for handling notification sounds
 */
class NotificationSoundService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize audio element with a simple beep sound
   */
  private initializeAudio(): void {
    try {
      // Create a simple data URL for a notification beep
      // This creates a short beep sound that should work across browsers
      this.audio = new Audio();
      
      // Use a simple beep sound data URL (short sine wave)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Alternative: use a simple notification sound URL or create one
      // For now, we'll use the HTML5 Audio with a programmatically generated tone
      this.generateNotificationSound();
      
    } catch (error) {
      console.warn('Failed to initialize notification audio:', error);
    }
  }

  /**
   * Generate a simple notification sound
   */
  private generateNotificationSound(): void {
    try {
      // Create a simple notification beep using data URL
      // This is a fallback that should work on most browsers
      this.audio = new Audio();
      this.audio.volume = 0.3;
      this.audio.preload = 'auto';
      
      // Simple beep sound as data URL (very basic but reliable)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // We'll use a different approach - create multiple audio elements for reliability
      this.createFallbackAudio();
      
    } catch (error) {
      console.warn('Failed to generate notification sound:', error);
    }
  }
  /**
   * Create fallback audio using multiple methods
   */
  private createFallbackAudio(): void {
    // Method 1: Create a simple beep using data URL
    try {
      this.audio = new Audio();
      this.audio.volume = 0.3;
      this.audio.preload = 'auto';
      
      // Simple notification beep as data URL
      // This creates a 0.5 second 800Hz sine wave
      const sampleRate = 8000;
      const duration = 0.5;
      const samples = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);
      
      // Generate sine wave data
      let offset = 44;
      for (let i = 0; i < samples; i++) {
        const sample = Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.3 * (1 - i / samples);
        view.setInt16(offset, sample * 32767, true);
        offset += 2;
      }
      
      // Create blob and object URL
      const blob = new Blob([buffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      this.audio.src = url;
      
      console.log('✅ Created notification audio with data URL');
      
    } catch (error) {
      console.warn('Data URL audio creation failed, using simple approach:', error);
      // Simple fallback
      this.audio = new Audio();
      this.audio.volume = 0.3;
      // Use a very simple approach - just set up the audio element for Web Audio API
    }
  }

  /**
   * Set whether notification sounds are enabled
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if notification sounds are enabled
   */
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }  /**
   * Play notification sound
   */
  playNotification(): void {
    console.log('🔊 Attempting to play notification sound. Enabled:', this.isEnabled);
    
    if (!this.isEnabled) {
      console.log('🔇 Cannot play notification - disabled');
      return;
    }

    try {
      // Method 1: Try HTML5 Audio if available
      if (this.audio) {
        console.log('📢 Playing notification with HTML5 Audio...');
        this.audio.currentTime = 0; // Reset to beginning
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Notification sound played successfully with HTML5 Audio');
            })
            .catch(error => {
              console.warn('❌ HTML5 Audio play failed:', error);
              this.fallbackNotification();
            });
        }
        return;
      }

      // Method 2: Fallback to Web Audio API
      this.fallbackNotification();
      
    } catch (error) {
      console.warn('❌ Failed to play notification sound:', error);
      this.fallbackNotification();
    }
  }

  /**
   * Fallback notification using Web Audio API
   */
  private fallbackNotification(): void {
    try {
      console.log('📢 Using Web Audio API fallback...');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      console.log('✅ Notification sound played with Web Audio API');
    } catch (error) {
      console.warn('❌ Web Audio API fallback failed:', error);
      // Method 3: System notification (if available)
      this.systemNotification();
    }
  }

  /**
   * System notification fallback
   */
  private systemNotification(): void {
    try {
      // Try to use the browser's notification API for sound
      if ('Notification' in window && Notification.permission === 'granted') {
        console.log('📢 Using system notification sound...');
        // This might play a system sound on some browsers
        new Notification('New message', { 
          silent: false,
          tag: 'wingit-message',
          icon: '/logo.svg'
        });
      } else {
        console.log('🔇 No notification methods available');
      }
    } catch (error) {
      console.warn('❌ System notification failed:', error);
    }
  }
  /**
   * Play notification for new message
   */
  playMessageNotification(): void {
    console.log('📬 Playing message notification...');
    this.playNotification();
  }  /**
   * Test notification sound (for settings page)
   */
  testNotification(): void {
    console.log('🧪 Testing notification sound...');
    // Temporarily enable sound for testing
    const wasEnabled = this.isEnabled;
    this.isEnabled = true;
    this.playNotification();
    this.isEnabled = wasEnabled;
  }

  /**
   * Force play notification for debugging (always plays regardless of settings)
   */
  debugPlayNotification(): void {
    console.log('🐛 Debug: Force playing notification...');
    const wasEnabled = this.isEnabled;
    this.isEnabled = true;
    
    // Try the simplest possible approach first
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('🔊 Debug notification played with basic Web Audio');
    } catch (error) {
      console.error('❌ Debug notification failed:', error);
    }
    
    this.isEnabled = wasEnabled;
  }

  /**
   * Initialize from user settings
   */
  initializeFromSettings(allowSearchEngines: boolean): void {
    this.setEnabled(allowSearchEngines);
  }
}

// Export singleton instance
export const notificationSoundService = new NotificationSoundService();

// Add to window for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testNotificationSound = () => notificationSoundService.debugPlayNotification();
  (window as any).notificationSoundService = notificationSoundService;
}

export default notificationSoundService;
