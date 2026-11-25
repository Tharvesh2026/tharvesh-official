// Procedural Web Audio API cosmic ambient drone & subtle UI harmonic chime
// Opt-in only: AudioContext is created strictly on explicit user interaction.

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = false;
  private oscNodes: OscillatorNode[] = [];
  private lfoNode: OscillatorNode | null = null;

  public toggle(): boolean {
    if (this.enabled) {
      this.stop();
      return false;
    }
    this.start();
    return true;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public start(): void {
    if (this.enabled) return;
    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.065, now + 1.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);
      filter.Q.setValueAtTime(1.2, now);

      // Slow breathing LFO modulating filter cutoff
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.09, now);
      lfoGain.gain.setValueAtTime(110, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);

      filter.connect(master);
      master.connect(this.ctx.destination);

      // Warm futuristic D-minor / suspended cosmic pad voices
      const freqs = [73.42, 110.0, 146.83, 220.0];
      const types: OscillatorType[] = ['sine', 'triangle', 'sine', 'sine'];
      const detunes = [-4, 3, -2, 5];

      this.oscNodes = freqs.map((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const voiceGain = this.ctx!.createGain();
        osc.type = types[idx];
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detunes[idx], now);
        voiceGain.gain.setValueAtTime(idx === 0 ? 0.45 : 0.18, now);
        osc.connect(voiceGain);
        voiceGain.connect(filter);
        osc.start(now);
        return osc;
      });

      this.masterGain = master;
      this.lfoNode = lfo;
      this.enabled = true;
    } catch {
      this.enabled = false;
    }
  }

  public playCrystalChime(pitchOffset = 0): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 587.33 + (pitchOffset % 5) * 74;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.015, now + 0.28);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Ignore transient audio scheduling issues
    }
  }

  public stop(): void {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    }

    const oldOscs = [...this.oscNodes];
    const oldLfo = this.lfoNode;
    window.setTimeout(() => {
      oldOscs.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // Already stopped
        }
      });
      try {
        oldLfo?.stop();
        oldLfo?.disconnect();
      } catch {
        // Already stopped
      }
    }, 480);

    this.oscNodes = [];
    this.lfoNode = null;
    this.enabled = false;
  }

  public dispose(): void {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}

export const cosmicAudio = new CosmicAudioEngine();
