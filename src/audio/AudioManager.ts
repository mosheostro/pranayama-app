export type PhaseType = 'inhale' | 'hold' | 'exhale' | 'pause' | 'wolfActive' | 'wolfRest';

function clamp(v: number) { return Math.max(0, Math.min(1, v)); }

function getAudioCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || (window as any).webkitAudioContext || null;
}

export class AudioManager {
  private ctx: AudioContext | null = null;
  private musicMaster: GainNode | null = null;
  private toneMaster: GainNode | null = null;
  private musicOscs: OscillatorNode[] = [];
  private musicGains: GainNode[] = [];
  private musicLFO: OscillatorNode | null = null;
  private musicLFOGain: GainNode | null = null;
  private currentMusicId: string | null = null;
  private musicPlaying = false;

  // Wolf breath loop
  private wolfBreathInterval: ReturnType<typeof setInterval> | null = null;
  private wolfBreathNodes: AudioNode[] = [];

  private _musicVol = 0.35;
  private _toneVol  = 0.55;
  private _musicOn  = true;
  private _toneOn   = true;

  async unlock(): Promise<void> {
    if (!this.ctx) {
      const Ctor = getAudioCtor();
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.musicMaster = this.ctx.createGain();
      this.toneMaster  = this.ctx.createGain();
      this.musicMaster.gain.value = this._musicOn ? this._musicVol * 0.28 : 0;
      this.toneMaster.gain.value  = this._toneOn  ? this._toneVol  : 0;
      this.musicMaster.connect(this.ctx.destination);
      this.toneMaster.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch {}
    }
  }

  // ── Volume ────────────────────────────────────────────────────────────
  setMusicVolume(v: number) {
    this._musicVol = clamp(v);
    if (this.ctx && this.musicMaster)
      this.musicMaster.gain.setTargetAtTime(
        this._musicOn ? this._musicVol * 0.28 : 0, this.ctx.currentTime, 0.05);
  }
  setToneVolume(v: number) {
    this._toneVol = clamp(v);
    if (this.ctx && this.toneMaster)
      this.toneMaster.gain.setTargetAtTime(
        this._toneOn ? this._toneVol : 0, this.ctx.currentTime, 0.05);
  }
  setMusicEnabled(on: boolean) {
    this._musicOn = on;
    if (!on) this.stopMusic();
    else if (this.currentMusicId) void this.startMusic(this.currentMusicId);
  }
  setToneEnabled(on: boolean) {
    this._toneOn = on;
    if (this.ctx && this.toneMaster)
      this.toneMaster.gain.setTargetAtTime(on ? this._toneVol : 0, this.ctx.currentTime, 0.1);
  }
  setTimerEnabled(on: boolean) { this.setToneEnabled(on); }

  // ── Music ─────────────────────────────────────────────────────────────
  async startMusic(id: string): Promise<void> {
    await this.unlock();
    if (!this.ctx || !this.musicMaster) return;
    if (this.currentMusicId === id && this.musicPlaying) return;
    this._stopMusicNodes();
    this.currentMusicId = id;

    const profiles: Record<string, { freqs: number[]; types: OscillatorType[]; weights: number[]; lfo: number }> = {
      tibetan:        { freqs: [136.1, 204.15, 272.2, 340.3], types: ['sine','triangle','sine','sine'],     weights: [0.40, 0.22, 0.12, 0.08], lfo: 0.07 },
      ambientYoga:    { freqs: [174,   261.6,  348,   435  ], types: ['triangle','sine','sine','triangle'], weights: [0.35, 0.20, 0.12, 0.07], lfo: 0.10 },
      himalayanBowls: { freqs: [110,   165,    247.5, 330  ], types: ['sine','triangle','sine','sine'],     weights: [0.42, 0.20, 0.12, 0.06], lfo: 0.05 },
      deepPranayama:  { freqs: [96,    144,    192,   288  ], types: ['sine','sine','triangle','sine'],     weights: [0.38, 0.18, 0.10, 0.06], lfo: 0.04 },
      'Aurora Drift': { freqs: [174,   261.6,  348   ],       types: ['triangle','sine','sine'],            weights: [0.38, 0.20, 0.10],        lfo: 0.09 },
    };
    const pr = profiles[id] ?? profiles.deepPranayama;
    const ctx = this.ctx;

    this.musicLFO = ctx.createOscillator();
    this.musicLFOGain = ctx.createGain();
    this.musicLFO.frequency.value = pr.lfo;
    this.musicLFOGain.gain.value  = 0.05;
    this.musicLFO.connect(this.musicLFOGain);
    this.musicLFOGain.connect(this.musicMaster.gain);
    this.musicLFO.start();

    this.musicOscs = pr.freqs.map((freq, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type  = pr.types[i];
      osc.frequency.value = freq;
      osc.detune.value    = (Math.random() - 0.5) * 6;
      g.gain.value = pr.weights[i];
      osc.connect(g);
      g.connect(this.musicMaster!);
      osc.start();
      this.musicGains.push(g);
      return osc;
    });

    this.musicMaster.gain.setValueAtTime(0, ctx.currentTime);
    this.musicMaster.gain.linearRampToValueAtTime(
      this._musicOn ? this._musicVol * 0.28 : 0, ctx.currentTime + 2);
    this.musicPlaying = true;
  }

  private _stopMusicNodes() {
    this.musicOscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
    this.musicGains.forEach(g => { try { g.disconnect(); } catch {} });
    if (this.musicLFO)     { try { this.musicLFO.stop(); this.musicLFO.disconnect(); } catch {} }
    if (this.musicLFOGain) { try { this.musicLFOGain.disconnect(); } catch {} }
    this.musicOscs = []; this.musicGains = [];
    this.musicLFO = null; this.musicLFOGain = null;
    this.musicPlaying = false;
  }

  pauseMusic() {
    if (this.musicMaster && this.ctx)
      this.musicMaster.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    setTimeout(() => this._stopMusicNodes(), 800);
  }
  stopMusic() { this.pauseMusic(); this.currentMusicId = null; }

  async changeTrack(id: string): Promise<void> {
    if (this.currentMusicId === id && this.musicPlaying) return;
    await this.startMusic(id);
  }

  // ── Wolf breath sound loop ────────────────────────────────────────────
  // Rhythmic Kapalabhati/Bhastrika-style breath using filtered noise bursts
  // soft, natural airflow — inhale + exhale cycle repeated rapidly
  private _playBreathBurst(isInhale: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.toneMaster || !this._toneOn) return;

    const now = ctx.currentTime;
    const vol = this._toneVol * 0.28;

    // White noise source
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter — higher freq on inhale (nasal), lower on exhale (mouth)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = isInhale ? 3200 : 1800;
    filter.Q.value = isInhale ? 1.2 : 0.9;

    // Second filter to shape breath texture
    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'highshelf';
    filter2.frequency.value = isInhale ? 2000 : 1000;
    filter2.gain.value = isInhale ? 6 : 3;

    const gain = ctx.createGain();
    // Envelope: quick attack, sustain, quick release
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), now + (isInhale ? 0.03 : 0.04));
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol * 0.6), now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    noise.connect(filter);
    filter.connect(filter2);
    filter2.connect(gain);
    gain.connect(this.toneMaster);
    noise.start(now);
    noise.stop(now + 0.15);

    this.wolfBreathNodes.push(noise, filter, filter2, gain);
    // Auto-clean after burst completes
    setTimeout(() => {
      try { noise.disconnect(); filter.disconnect(); filter2.disconnect(); gain.disconnect(); } catch {}
      this.wolfBreathNodes = this.wolfBreathNodes || [];
	  this.wolfBreathNodes = this.wolfBreathNodes.filter(n => n !== noise && n !== filter && n !== filter2 && n !== gain);
    }, 300);
  }

  // Start wolf breathing loop — rapid inhale/exhale alternating
  // bpm parameter controls pace (default ~60 breaths/min = 0.5s per half-breath)
  startWolfBreathLoop() {
    this.stopWolfBreathLoop();
    if (!this._toneOn) return;

    let toggle = true; // true = inhale, false = exhale
    // Rapid pace: each half-breath ~400ms → ~75 breaths per minute
    this.wolfBreathInterval = setInterval(() => {
      this._playBreathBurst(toggle);
      toggle = !toggle;
    }, 400);
  }

  stopWolfBreathLoop() {
    if (this.wolfBreathInterval !== null) {
      clearInterval(this.wolfBreathInterval);
      this.wolfBreathInterval = null;
    }
    // Clean up any lingering nodes
    this.wolfBreathNodes.forEach(n => { try { n.disconnect(); } catch {} });
    this.wolfBreathNodes = [];
  }

  // ── Phase tones (non-wolf) ────────────────────────────────────────────
  async playPhaseSound(soundId: string, phase: PhaseType): Promise<void> {
    // Wolf breath loop is handled separately — skip bowl tones for wolf phases
    if (phase === 'wolfActive' || phase === 'wolfRest') return;
    if (!this._toneOn) return;
    await this.unlock();
    const ctx = this.ctx;
    if (!ctx || !this.toneMaster) return;

    const profiles: Record<string, { baseFreq: number; decay: number; spread: number }> = {
      softBell:        { baseFreq: 256, decay: 3.5, spread: 0.40 },
      woodenClick:     { baseFreq: 180, decay: 2.0, spread: 0.25 },
      lightChime:      { baseFreq: 320, decay: 4.0, spread: 0.35 },
      tibetanMiniBowl: { baseFreq: 216, decay: 5.5, spread: 0.50 },
      earthDrone:      { baseFreq: 72,  decay: 3.5, spread: 0.55 },
      'Soft Bell':     { baseFreq: 256, decay: 3.5, spread: 0.40 },
    };
    const phaseRatio: Partial<Record<PhaseType, number>> = {
      inhale: 1.0, hold: 1.125, exhale: 0.889, pause: 0.75,
    };
    const prof = profiles[soundId] ?? profiles.tibetanMiniBowl;
    const freq = prof.baseFreq * (phaseRatio[phase] ?? 1.0);
    const now  = ctx.currentTime;

    [[1.0, 0.60], [2.01, 0.22], [0.5, 0.12]].forEach(([mult, weight]) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type  = 'sine';
      osc.frequency.value = freq * mult;
      const amp = prof.spread * weight * this._toneVol;
      g.gain.setValueAtTime(0.001, now);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, amp), now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + prof.decay * (0.5 + mult * 0.25));
      osc.connect(g); g.connect(this.toneMaster!);
      osc.start(now);
      osc.stop(now + prof.decay + 0.1);
    });
  }

  async previewTone(soundId: string): Promise<void> {
    await this.playPhaseSound(soundId, 'inhale');
  }

  // ── Music preview — isolated, non-looping, max 5s ─────────────────
  // Completely separate from session music. Own gain node, own oscillators.
  // Calling again immediately cancels any in-progress preview.
  private _previewGain: GainNode | null = null;
  private _previewOscs: OscillatorNode[] = [];
  private _previewTimer: ReturnType<typeof setTimeout> | null = null;

  private _stopPreview(): void {
    // Cancel fade timer
    if (this._previewTimer !== null) {
      clearTimeout(this._previewTimer);
      this._previewTimer = null;
    }
    // Stop all preview oscillators immediately
    this._previewOscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
    this._previewOscs = [];
    // Disconnect gain node
    if (this._previewGain) { try { this._previewGain.disconnect(); } catch {} }
    this._previewGain = null;
  }

  async previewMusic(musicId: string): Promise<void> {
    // Stop any currently playing preview immediately
    this._stopPreview();

    await this.unlock();
    const ctx = this.ctx;
    if (!ctx) return;

    // Isolated gain node — not connected to musicMaster, no effect on session
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(this._musicOn ? this._musicVol * 0.22 : 0.18, ctx.currentTime + 0.6);
    gain.connect(ctx.destination);
    this._previewGain = gain;

    // Frequency profiles (same as startMusic)
    const profiles: Record<string, { freqs: number[]; types: OscillatorType[]; weights: number[] }> = {
      tibetan:        { freqs: [136.1, 204.15, 272.2], types: ['sine', 'triangle', 'sine'],     weights: [0.42, 0.22, 0.12] },
      ambientYoga:    { freqs: [174,   261.6,  348  ], types: ['triangle', 'sine', 'sine'],      weights: [0.38, 0.20, 0.11] },
      himalayanBowls: { freqs: [110,   165,    247.5], types: ['sine', 'triangle', 'sine'],      weights: [0.44, 0.20, 0.11] },
      deepPranayama:  { freqs: [96,    144,    192  ], types: ['sine', 'sine', 'triangle'],      weights: [0.40, 0.18, 0.10] },
      'Aurora Drift': { freqs: [174,   261.6,  348  ], types: ['triangle', 'sine', 'sine'],      weights: [0.38, 0.20, 0.10] },
    };
    const pr = profiles[musicId] ?? profiles.deepPranayama;

    const oscs: OscillatorNode[] = pr.freqs.map((freq, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type  = pr.types[i];
      osc.frequency.value = freq;
      osc.detune.value    = (Math.random() - 0.5) * 5;
      g.gain.value = pr.weights[i];
      osc.connect(g);
      g.connect(gain);
      osc.start();
      return osc;
    });
    this._previewOscs = oscs;

    // Auto-stop after exactly 5 seconds — fade out then kill nodes
    this._previewTimer = setTimeout(() => {
      if (this._previewGain && ctx) {
        this._previewGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      }
      // Kill nodes after fade completes (~1.5s)
      setTimeout(() => { this._stopPreview(); }, 1500);
    }, 5000);
  }

  async playSessionEndSound(): Promise<void> {
    if (!this._toneOn) return;
    await this.unlock();
    const ctx = this.ctx;
    if (!ctx || !this.toneMaster) return;
    [216, 270, 324].forEach((freq, i) => {
      const delay = i * 1.4;
      const now = ctx.currentTime + delay;
      [[1.0, 0.45], [2.01, 0.15], [0.5, 0.10]].forEach(([m, w]) => {
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.type  = 'sine';
        osc.frequency.value = freq * m;
        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(Math.max(0.001, w * this._toneVol), now + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + 5.0);
        osc.connect(g); g.connect(this.toneMaster!);
        osc.start(now); osc.stop(now + 5.1);
      });
    });
  }

  dispose() {
    this.stopWolfBreathLoop();
    this._stopPreview();
    this._stopMusicNodes();
    if (this.ctx?.state !== 'closed') this.ctx?.close().catch(() => {});
  }
}
