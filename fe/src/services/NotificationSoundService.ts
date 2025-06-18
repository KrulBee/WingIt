/**
 * Service for handling notification sounds
 */
class NotificationSoundService {
  private isEnabled: boolean = false;
  private audio: HTMLAudioElement | null = null;
  private audioReady: boolean = false;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize audio with real audio file and proper preloading
   */
  private initializeAudio(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Use the actual audio file from public/sounds/
      this.audio = new Audio('/sounds/notification.mp3');
      this.audio.volume = 0.5;
      this.audio.preload = 'auto';
      
      // Set up event listeners to ensure audio is fully loaded
      this.audio.addEventListener('canplaythrough', () => {
        this.audioReady = true;
        console.log('🔊 Notification audio is ready to play (canplaythrough)');
      });

      this.audio.addEventListener('loadeddata', () => {
        console.log('🔊 Notification audio data loaded');
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('🔊 Audio load error:', e);
        this.audioReady = false;
      });
      
      // Try to preload the audio to bypass some autoplay restrictions
      this.audio.load();
      
      console.log('🔊 Notification audio file loading from /sounds/notification.mp3');
    } catch (error) {
      console.warn('Failed to load notification audio file:', error);
      this.audioReady = false;
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
   * Play notification sound using HTML5 Audio with proper readiness check
   */
  playNotification(): void {
    console.log('🔊 Attempting to play notification sound. Enabled:', this.isEnabled, 'Ready:', this.audioReady);
    
    if (!this.isEnabled) {
      console.log('🔇 Cannot play notification - disabled');
      return;
    }

    if (!this.audio) {
      console.log('🔇 Audio file not loaded');
      this.systemNotification();
      return;
    }

    // Check if audio is ready before playing
    if (!this.audioReady) {
      console.log('🔇 Audio not ready yet, waiting for canplaythrough...');
      
      // Try to wait for audio to be ready, but don't wait too long
      const waitForReady = () => {
        if (this.audioReady) {
          this.playAudioNow();
        } else if (this.audio && this.audio.readyState >= 3) {
          // readyState 3 = HAVE_FUTURE_DATA (enough to start playing)
          console.log('🔊 Audio ready via readyState check');
          this.audioReady = true;
          this.playAudioNow();
        } else {
          console.log('🔇 Audio still not ready, using fallback notification');
          this.systemNotification();
        }
      };

      // Wait a bit for audio to load, then try anyway
      setTimeout(waitForReady, 100);
      return;
    }

    this.playAudioNow();
  }

  /**
   * Actually play the audio (assumes audio is ready)
   */
  private playAudioNow(): void {
    if (!this.audio) return;

    try {
      // Reset audio to beginning to ensure full playback
      this.audio.currentTime = 0;
      
      console.log('📢 Playing notification with HTML5 Audio file...');
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Notification sound played successfully');
          })
          .catch(error => {
            console.warn('❌ HTML5 Audio play failed:', error);
            this.systemNotification();
          });
      }
    } catch (error) {
      console.warn('❌ Error playing notification sound:', error);
      this.systemNotification();
    }
  }

  /**
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
  }

  /**
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
  (window as any).testNotificationSound = () => notificationSoundService.testNotification();
  (window as any).notificationSoundService = notificationSoundService;
}

export default notificationSoundService;
