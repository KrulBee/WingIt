/**
 * Service for handling notification sounds
 */
class NotificationSoundService {
  private isEnabled: boolean = false;
  private audioContext: AudioContext | null = null;
  private isAudioContextReady: boolean = false;

  constructor() {
    // Initialize user interaction listener
    this.setupUserInteractionListener();
  }
  /**
   * Setup listener for user interaction to initialize AudioContext
   */
  private setupUserInteractionListener(): void {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const initAudioContext = () => {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          console.log('🎵 AudioContext created on user interaction');
        } catch (error) {
          console.warn('Failed to create AudioContext:', error);
          return;
        }
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.isAudioContextReady = true;
          console.log('🎵 AudioContext resumed and ready for notifications');
        }).catch(error => {
          console.warn('Failed to resume AudioContext:', error);
        });
      } else {
        this.isAudioContextReady = true;
        console.log('🎵 AudioContext ready for notifications');
      }

      // Remove listeners after first successful initialization
      document.removeEventListener('click', initAudioContext);
      document.removeEventListener('keydown', initAudioContext);
      document.removeEventListener('touchstart', initAudioContext);
    };

    // Listen for various user interactions
    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('keydown', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });
  }
  /**
   * Set whether notification sounds are enabled
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    // If enabling notifications and AudioContext isn't ready, try to initialize it
    if (enabled && !this.isAudioContextReady) {
      this.tryInitializeAudioContext();
    }
  }
  /**
   * Try to initialize AudioContext manually
   */
  private tryInitializeAudioContext(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('🎵 AudioContext created manually');
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.isAudioContextReady = true;
          console.log('🎵 AudioContext manually resumed and ready');
        }).catch(error => {
          console.log('ℹ️ AudioContext resume requires user interaction');
        });
      } else {
        this.isAudioContextReady = true;
        console.log('🎵 AudioContext manually initialized and ready');
      }
    } catch (error) {
      console.log('ℹ️ AudioContext initialization requires user interaction');
    }
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

    if (!this.audioContext || !this.isAudioContextReady) {
      console.log('🔇 AudioContext not ready - user interaction required first');
      this.showAudioContextNotice();
      return;
    }

    try {
      console.log('📢 Playing notification with pre-initialized AudioContext...');
      this.generateAndPlayTone(this.audioContext);
      
    } catch (error) {
      console.warn('❌ Failed to play notification sound:', error);
      this.systemNotification();
    }
  }

  /**
   * Show notice about audio context requirement
   */
  private showAudioContextNotice(): void {
    console.log('ℹ️ Notification sound requires user interaction first. Click anywhere on the page to enable audio.');
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
  }  /**
   * System notification fallback
   */
  private systemNotification(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Option 1: Try browser notification with sound
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          console.log('📢 Using system notification with sound...');
          new Notification('New message', { 
            silent: false,
            tag: 'wingit-message',
            icon: '/logo.svg',
            body: 'You have a new message'
          });
          return;
        } else if (Notification.permission === 'default') {
          // Request permission for future notifications
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              console.log('✅ Notification permission granted for future use');
            }
          });
        }
      }

      // Option 2: Vibration API (mobile devices)
      if ('vibrate' in navigator) {
        console.log('📳 Using vibration as notification fallback...');
        navigator.vibrate([200, 100, 200]);
        return;
      }

      console.log('🔇 No notification methods available');
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
