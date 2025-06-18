/**
 * Service for handling notification sounds
 */
class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private notificationBuffer: AudioBuffer | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeAudioContext();
    this.loadNotificationSound();
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Load notification sound (generate a simple notification tone)
   */
  private loadNotificationSound(): void {
    if (!this.audioContext) return;

    try {
      // Create a simple notification sound using Web Audio API
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.3; // 300ms
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate a pleasant notification tone (combination of frequencies)
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Create a pleasant bell-like sound
        const freq1 = 800; // Primary frequency
        const freq2 = 1200; // Harmonic
        const envelope = Math.exp(-t * 3); // Decay envelope
        
        data[i] = envelope * (
          Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
          Math.sin(2 * Math.PI * freq2 * t) * 0.2
        );
      }

      this.notificationBuffer = buffer;
    } catch (error) {
      console.warn('Failed to generate notification sound:', error);
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
  }

  /**
   * Play notification sound
   */
  playNotification(): void {
    if (!this.isEnabled || !this.audioContext || !this.notificationBuffer) {
      return;
    }

    try {
      // Resume audio context if it's suspended (required by browser policies)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create and play the sound
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.notificationBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set volume (adjust as needed)
      gainNode.gain.value = 0.3;
      
      source.start();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  /**
   * Play notification for new message
   */
  playMessageNotification(): void {
    this.playNotification();
  }

  /**
   * Test notification sound (for settings page)
   */
  testNotification(): void {
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
export default notificationSoundService;
