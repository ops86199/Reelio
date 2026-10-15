import { Song } from '../types';

export const DEFAULT_SONGS_CATALOG: Song[] = [
  {
    id: 'song_lofi_tokyo',
    title: 'Midnight in Tokyo',
    artist: 'Komorebi Sound',
    duration: 164,
    bpm: 78,
    genre: 'Lofi Chillhop',
    coverUrl: '/src/assets/images/post_japan_street_1792082891402.jpg',
    mood: 'Relaxed & Nostalgic',
  },
  {
    id: 'song_nordic_mist',
    title: 'Fjord Solitude',
    artist: 'Nordic Echoes',
    duration: 192,
    bpm: 84,
    genre: 'Ambient Atmospheric',
    coverUrl: '/src/assets/images/post_nordic_nature_1792082891528.jpg',
    mood: 'Peaceful & Deep',
  },
  {
    id: 'song_golden_hour',
    title: 'Golden Hour Concrete',
    artist: 'Aura Studio',
    duration: 145,
    bpm: 96,
    genre: 'Chill Indie Pop',
    coverUrl: '/src/assets/images/post_architecture_1792082891037.jpg',
    mood: 'Warm & Uplifting',
  },
  {
    id: 'song_cafe_morning',
    title: 'Matcha & Sunday Mornings',
    artist: 'Vesterbro Trio',
    duration: 158,
    bpm: 88,
    genre: 'Acoustic Soul',
    coverUrl: '/src/assets/images/post_coffee_brunch_1792082890280.jpg',
    mood: 'Cozy & Gentle',
  },
  {
    id: 'song_synth_night',
    title: 'Neon Skyline Horizon',
    artist: 'Cyber Pulse',
    duration: 178,
    bpm: 110,
    genre: 'Synthwave / Electronic',
    coverUrl: '/src/assets/images/post_japan_street_1792082891402.jpg',
    mood: 'Energetic & Vibrant',
  },
  {
    id: 'song_minimal_groove',
    title: 'Velvet Cantilever',
    artist: 'Studio Mono',
    duration: 135,
    bpm: 92,
    genre: 'Minimal Deep House',
    coverUrl: '/src/assets/images/post_architecture_1792082891037.jpg',
    mood: 'Hypnotic & Sleek',
  },
  {
    id: 'song_trap_beat',
    title: '808 Drift City',
    artist: 'Metro Sub',
    duration: 140,
    bpm: 130,
    genre: 'Trap / Hip Hop',
    coverUrl: '/src/assets/images/post_japan_street_1792082891402.jpg',
    mood: 'Heavy & Confident',
  },
  {
    id: 'song_phonk_speed',
    title: 'Tokyo Midnight Phonk',
    artist: 'Kensei Beats',
    duration: 124,
    bpm: 140,
    genre: 'Drift Phonk',
    coverUrl: '/src/assets/images/post_architecture_1792082891037.jpg',
    mood: 'Adrenaline & High Energy',
  },
];

export let SONGS_CATALOG: Song[] = [...DEFAULT_SONGS_CATALOG];

class MusicEngine {
  private ctx: AudioContext | null = null;
  private currentSong: Song | null = null;
  private playing: boolean = false;
  private intervalId: number | null = null;
  private step: number = 0;
  private masterGain: GainNode | null = null;
  private listeners: Set<(song: Song | null, playing: boolean) => void> = new Set();
  private analyser: AnalyserNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private volumeLevel: number = 0.5;

  constructor() {
    this.loadUserSongs();
  }

  private loadUserSongs() {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('reelio_user_songs');
        if (stored) {
          const parsed: Song[] = JSON.parse(stored);
          SONGS_CATALOG = [...DEFAULT_SONGS_CATALOG, ...parsed];
        }
      }
    } catch {
      // fallback
    }
  }

  public addUserSong(song: Song) {
    const exists = SONGS_CATALOG.some((s) => s.id === song.id);
    if (!exists) {
      SONGS_CATALOG = [song, ...SONGS_CATALOG];
      try {
        if (typeof window !== 'undefined') {
          const userOnly = SONGS_CATALOG.filter((s) => s.isUserUploaded);
          localStorage.setItem('reelio_user_songs', JSON.stringify(userOnly));
        }
      } catch {
        // ignore storage errors
      }
    }
    this.notify();
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volumeLevel * 0.4, this.ctx.currentTime);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public subscribe(cb: (song: Song | null, playing: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentSong, this.playing);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentSong, this.playing));
  }

  public getCurrentSong(): Song | null {
    return this.currentSong;
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  public setVolume(vol: number) {
    this.volumeLevel = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volumeLevel * 0.4, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volumeLevel;
    }
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public playSong(song: Song) {
    if (this.currentSong?.id === song.id && this.playing) {
      return;
    }

    this.stopPlayback();
    this.currentSong = song;
    this.playing = true;
    this.step = 0;
    this.notify();

    // If song has an audioUrl (e.g. user uploaded audio file or recorded voice memo)
    if (song.audioUrl && typeof Audio !== 'undefined') {
      try {
        if (!this.audioElement) {
          this.audioElement = new Audio();
          this.audioElement.loop = true;
          this.audioElement.addEventListener('ended', () => {
            this.playing = false;
            this.notify();
          });
        }
        this.audioElement.src = song.audioUrl;
        this.audioElement.volume = this.volumeLevel;
        this.audioElement.play().catch(() => {
          // If browser restricts autoplay without interaction, fallback to Web Audio synthesis
          this.startSynthPlayback(song);
        });
        return;
      } catch {
        // Fallback to synth
      }
    }

    this.startSynthPlayback(song);
  }

  private startSynthPlayback(song: Song) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Start beat and musical synthesis loop based on genre / bpm
    const stepDurationMs = (60 / song.bpm / 2) * 1000;

    this.intervalId = window.setInterval(() => {
      this.playMusicalStep(song);
      this.step++;
    }, stepDurationMs);
  }

  public pauseSong() {
    this.stopPlayback();
    this.playing = false;
    this.notify();
  }

  public toggleSong(song: Song) {
    if (this.currentSong?.id === song.id && this.playing) {
      this.pauseSong();
    } else {
      this.playSong(song);
    }
  }

  private stopPlayback() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {
        // ignore
      }
    }
  }

  // Synthesize musical chord progression + melody + percussion
  private playMusicalStep(song: Song) {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const isLofi = song.id.includes('lofi') || song.id.includes('cafe');
    const isSynth = song.id.includes('synth') || song.id.includes('groove') || song.id.includes('phonk');
    const isTrap = song.id.includes('trap') || song.id.includes('phonk');

    // Musical scales (Pentatonic / Minor 7th chords)
    const chordScales = [
      [261.63, 311.13, 392.00, 466.16], // Cm7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [349.23, 440.00, 523.25, 622.25], // F7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];
    const currentChordIdx = Math.floor(this.step / 8) % chordScales.length;
    const currentChord = chordScales[currentChordIdx];

    // 1. Kick on steps
    if (isTrap) {
      if (this.step % 16 === 0 || this.step % 16 === 6 || this.step % 16 === 10) {
        this.play808Kick(ctx, t);
      }
    } else {
      if (this.step % 8 === 0 || this.step % 8 === 6) {
        this.playKick(ctx, t);
      }
    }

    // 2. Snare / Soft Rim
    if (this.step % 8 === 4) {
      this.playSnare(ctx, t, isLofi);
    }

    // 3. Hi-hat on every step with swing or trap rolls
    if (isTrap && this.step % 8 === 7) {
      // Rapid trap roll
      this.playHiHat(ctx, t);
      this.playHiHat(ctx, t + 0.05);
    } else if (this.step % 2 === 0) {
      this.playHiHat(ctx, t);
    }

    // 4. Bass note on downbeats
    if (this.step % 4 === 0) {
      const bassFreq = currentChord[0] / 2;
      this.playBass(ctx, t, bassFreq, isSynth);
    }

    // 5. Chord Pad / keys on chord change
    if (this.step % 8 === 0) {
      this.playChord(ctx, t, currentChord, isLofi);
    }

    // 6. Melodic sparkle / guitar plucks
    if (this.step % 4 === 2 || this.step % 8 === 7) {
      const melodyNote = currentChord[(this.step + 1) % currentChord.length] * 2;
      this.playPluck(ctx, t, melodyNote, isSynth);
    }
  }

  private play808Kick(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  private playKick(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  private playSnare(ctx: AudioContext, t: number, isLofi: boolean) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isLofi ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  private playHiHat(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(4500, t);
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  private playBass(ctx: AudioContext, t: number, freq: number, isSynth: boolean) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isSynth ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  private playChord(ctx: AudioContext, t: number, chord: number[], isLofi: boolean) {
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = isLofi ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isLofi ? 900 : 1800, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.9);
    });
  }

  private playPluck(ctx: AudioContext, t: number, freq: number, isSynth: boolean) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isSynth ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.25);
  }
}

export const musicEngine = new MusicEngine();
