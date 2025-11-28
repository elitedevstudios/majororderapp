/**
 * 8-bit style sound effects using Web Audio API
 * No external audio files needed - generates sounds programmatically
 */

type SoundType = 
  | 'timerStart'
  | 'workComplete'
  | 'breakComplete'
  | 'taskComplete'
  | 'badgeUnlock'
  | 'click'
  | 'error';

let audioContext: AudioContext | null = null;
let soundEnabled = true;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
};

export const isSoundEnabled = (): boolean => soundEnabled;

/**
 * Play a simple tone
 */
const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume: number = 0.3
): void => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

/**
 * Play a sequence of tones (arpeggio)
 */
const playArpeggio = (
  frequencies: number[],
  noteDuration: number,
  type: OscillatorType = 'square',
  volume: number = 0.3
): void => {
  const ctx = getAudioContext();
  
  frequencies.forEach((freq, index) => {
    const startTime = ctx.currentTime + index * noteDuration;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * 0.9);

    oscillator.start(startTime);
    oscillator.stop(startTime + noteDuration);
  });
};

/**
 * Sound effect definitions
 */
const sounds: Record<SoundType, () => void> = {
  // Rising beep for timer start
  timerStart: () => {
    playArpeggio([440, 554, 659], 0.08, 'square', 0.2);
  },

  // Victory fanfare for work session complete
  workComplete: () => {
    playArpeggio([523, 659, 784, 1047], 0.15, 'square', 0.25);
    setTimeout(() => {
      playArpeggio([784, 1047], 0.2, 'square', 0.2);
    }, 500);
  },

  // Soft chime for break complete
  breakComplete: () => {
    playArpeggio([659, 784, 659], 0.12, 'sine', 0.2);
  },

  // Coin collect sound for task complete
  taskComplete: () => {
    playArpeggio([987, 1319], 0.08, 'square', 0.2);
  },

  // Level up fanfare for badge unlock
  badgeUnlock: () => {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    playArpeggio(notes, 0.1, 'square', 0.25);
    setTimeout(() => {
      playTone(1568, 0.4, 'square', 0.2);
    }, 700);
  },

  // Simple click
  click: () => {
    playTone(800, 0.05, 'square', 0.15);
  },

  // Error buzz
  error: () => {
    playTone(200, 0.15, 'sawtooth', 0.2);
    setTimeout(() => playTone(150, 0.15, 'sawtooth', 0.2), 150);
  },
};

/**
 * Play a sound effect
 */
export const playSound = (type: SoundType): void => {
  if (!soundEnabled) return;
  
  try {
    // Resume audio context if suspended (browser autoplay policy)
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    sounds[type]();
  } catch (error) {
    console.warn('Failed to play sound:', error);
  }
};

/**
 * Test all sounds (for debugging)
 */
export const testAllSounds = async (): Promise<void> => {
  const soundTypes: SoundType[] = [
    'click',
    'timerStart',
    'taskComplete',
    'workComplete',
    'breakComplete',
    'badgeUnlock',
    'error',
  ];

  for (const type of soundTypes) {
    console.log(`Playing: ${type}`);
    playSound(type);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
};
