/**
 * Service for handling notification sounds
 */
class NotificationSoundService {
  private isEnabled: boolean = false;

  constructor() {    // No initialization needed - we'll use Web Audio API directly
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
      // Use Web Audio API directly (more reliable than HTML5 Audio for generated sounds)
      console.log('📢 Playing notification with Web Audio API...');
      this.playWithWebAudio();
      
    } catch (error) {
      console.warn('❌ Failed to play notification sound:', error);
      this.systemNotification();
    }
  }

  /**
   * Play notification using Web Audio API
   */
  private playWithWebAudio(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required by browser policies)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          this.generateAndPlayTone(audioContext);
        });
      } else {
        this.generateAndPlayTone(audioContext);
      }
      
    } catch (error) {
      console.warn('❌ Web Audio API failed:', error);
      this.systemNotification();
    }
  }

  /**
   * Generate and play notification tone
   */
  private generateAndPlayTone(audioContext: AudioContext): void {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant notification sound (two-tone beep)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);

      console.log('✅ Notification sound played with Web Audio API');
    } catch (error) {
      console.warn('❌ Tone generation failed:', error);
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
