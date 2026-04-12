import type { MusicTrackId, PhaseKey, ToneId } from './meditation'

type Layer = {
  stop: (fadeOutMs?: number) => void
}

const PHASE_FREQUENCIES: Record<PhaseKey, number> = {
  inhale: 432,
  holdIn: 528,
  exhale: 396,
  holdOut: 288,
}

export class MeditationAudioController {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicBus: GainNode | null = null
  private effectsBus: GainNode | null = null
  private previewBus: GainNode | null = null
  private activeMusicLayer: Layer | null = null
  private previewMusicLayer: Layer | null = null
  private previewStopTimer: number | null = null
  private tone: ToneId = 'softBell'
  private volume = 0.55
  private lastVolumeFeedbackAt = 0
  private noiseBuffer: AudioBuffer | null = null

  async unlock() {
    const context = this.ensureContext()
    if (context.state !== 'running') {
      await context.resume()
    }
  }

  isUnlocked() {
    return this.context?.state === 'running'
  }

  setVolume(volume: number) {
    this.volume = volume
    if (!this.masterGain || !this.context) {
      return
    }

    const now = this.context.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 0.08)
  }

  setTone(tone: ToneId) {
    this.tone = tone
  }

  startSessionMusic(track: MusicTrackId) {
    const context = this.ensureContext()
    if (!this.musicBus) {
      return
    }

    if (track === 'none') {
      this.stopSessionMusic()
      return
    }

    this.activeMusicLayer?.stop(1100)
    this.activeMusicLayer = createMusicLayer(context, track, this.musicBus, this)
  }

  stopSessionMusic() {
    this.activeMusicLayer?.stop(900)
    this.activeMusicLayer = null
  }

  previewMusic(track: MusicTrackId, durationMs = 5000, sessionActive = false) {
    if (track === 'none') {
      this.previewMusicLayer?.stop(400)
      this.previewMusicLayer = null
      return
    }

    if (sessionActive) {
      this.startSessionMusic(track)
      return
    }

    const context = this.ensureContext()
    if (!this.previewBus) {
      return
    }

    this.previewMusicLayer?.stop(400)
    this.previewMusicLayer = createMusicLayer(
      context,
      track,
      this.previewBus,
      this,
      0.7,
    )

    if (this.previewStopTimer) {
      window.clearTimeout(this.previewStopTimer)
    }

    this.previewStopTimer = window.setTimeout(() => {
      this.previewMusicLayer?.stop(1000)
      this.previewMusicLayer = null
    }, durationMs)
  }

  previewTone(tone: ToneId, durationMs = 2000) {
    const context = this.ensureContext()
    if (!this.previewBus) {
      return
    }

    playTone(context, this.previewBus, tone, {
      duration: durationMs / 1000,
      frequency: 512,
      gain: 0.22,
    })
  }

  playPhaseCue(phase: PhaseKey) {
    const context = this.ensureContext()
    if (!this.effectsBus) {
      return
    }

    playTone(context, this.effectsBus, this.tone, {
      duration: phase === 'holdOut' ? 0.26 : 0.38,
      frequency: PHASE_FREQUENCIES[phase],
      gain: 0.18,
    })
  }

  playCompletionCue() {
    const context = this.ensureContext()
    if (!this.effectsBus) {
      return
    }

    const steps = [396, 528, 660]
    steps.forEach((frequency, index) => {
      window.setTimeout(() => {
        playTone(context, this.effectsBus!, this.tone, {
          duration: 0.9,
          frequency,
          gain: 0.24,
        })
      }, index * 220)
    })
  }

  playVolumeFeedback() {
    const now = Date.now()
    if (now - this.lastVolumeFeedbackAt < 140) {
      return
    }

    this.lastVolumeFeedbackAt = now
    const context = this.ensureContext()
    if (!this.previewBus) {
      return
    }

    playTone(context, this.previewBus, this.tone, {
      duration: 0.18,
      frequency: 480,
      gain: 0.12,
    })
  }

  createNoiseBuffer() {
    const context = this.ensureContext()
    if (this.noiseBuffer) {
      return this.noiseBuffer
    }

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.random() * 2 - 1
    }
    this.noiseBuffer = buffer
    return buffer
  }

  private ensureContext() {
    if (this.context) {
      return this.context
    }

    const context = new AudioContext()
    const masterGain = context.createGain()
    const musicBus = context.createGain()
    const effectsBus = context.createGain()
    const previewBus = context.createGain()

    masterGain.gain.value = this.volume
    musicBus.gain.value = 0.82
    effectsBus.gain.value = 1
    previewBus.gain.value = 0.94

    musicBus.connect(masterGain)
    effectsBus.connect(masterGain)
    previewBus.connect(masterGain)
    masterGain.connect(context.destination)

    this.context = context
    this.masterGain = masterGain
    this.musicBus = musicBus
    this.effectsBus = effectsBus
    this.previewBus = previewBus

    return context
  }
}

function createMusicLayer(
  context: AudioContext,
  track: MusicTrackId,
  destination: AudioNode,
  controller: MeditationAudioController,
  peakGain = 1,
): Layer {
  const output = context.createGain()
  output.gain.value = 0
  output.connect(destination)

  if (track === 'aurora') {
    return createAuroraLayer(context, output, peakGain)
  }

  if (track === 'temple') {
    return createTempleLayer(context, output, controller, peakGain)
  }

  return createForestLayer(context, output, peakGain)
}

function createAuroraLayer(
  context: AudioContext,
  output: GainNode,
  peakGain: number,
): Layer {
  const low = context.createOscillator()
  const middle = context.createOscillator()
  const high = context.createOscillator()
  const lowGain = context.createGain()
  const middleGain = context.createGain()
  const highGain = context.createGain()
  const shimmer = context.createOscillator()
  const shimmerGain = context.createGain()

  low.type = 'sine'
  middle.type = 'triangle'
  high.type = 'sine'
  shimmer.type = 'sine'

  low.frequency.value = 110
  middle.frequency.value = 165
  high.frequency.value = 220
  shimmer.frequency.value = 0.08

  lowGain.gain.value = 0.18 * peakGain
  middleGain.gain.value = 0.06 * peakGain
  highGain.gain.value = 0.03 * peakGain
  shimmerGain.gain.value = 0.02

  shimmer.connect(shimmerGain)
  shimmerGain.connect(lowGain.gain)
  shimmerGain.connect(middleGain.gain)

  low.connect(lowGain)
  middle.connect(middleGain)
  high.connect(highGain)
  lowGain.connect(output)
  middleGain.connect(output)
  highGain.connect(output)

  low.start()
  middle.start()
  high.start()
  shimmer.start()

  fadeIn(context, output, peakGain, 1.1)

  return {
    stop(fadeOutMs = 900) {
      fadeOut(context, output, fadeOutMs)
      window.setTimeout(() => {
        safeStop(low)
        safeStop(middle)
        safeStop(high)
        safeStop(shimmer)
      }, fadeOutMs + 60)
    },
  }
}

function createTempleLayer(
  context: AudioContext,
  output: GainNode,
  controller: MeditationAudioController,
  peakGain: number,
): Layer {
  const drone = context.createOscillator()
  const droneGain = context.createGain()
  const harmony = context.createOscillator()
  const harmonyGain = context.createGain()
  const noise = context.createBufferSource()
  const noiseFilter = context.createBiquadFilter()
  const noiseGain = context.createGain()

  drone.type = 'sine'
  harmony.type = 'triangle'
  drone.frequency.value = 147
  harmony.frequency.value = 294
  droneGain.gain.value = 0.12 * peakGain
  harmonyGain.gain.value = 0.045 * peakGain

  noise.buffer = controller.createNoiseBuffer()
  noise.loop = true
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = 500
  noiseFilter.Q.value = 0.4
  noiseGain.gain.value = 0.055 * peakGain

  drone.connect(droneGain)
  harmony.connect(harmonyGain)
  droneGain.connect(output)
  harmonyGain.connect(output)
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(output)

  drone.start()
  harmony.start()
  noise.start()

  fadeIn(context, output, peakGain, 1.2)

  return {
    stop(fadeOutMs = 900) {
      fadeOut(context, output, fadeOutMs)
      window.setTimeout(() => {
        safeStop(drone)
        safeStop(harmony)
        safeStop(noise)
      }, fadeOutMs + 60)
    },
  }
}

function createForestLayer(
  context: AudioContext,
  output: GainNode,
  peakGain: number,
): Layer {
  const root = context.createOscillator()
  const rootGain = context.createGain()
  const overtone = context.createOscillator()
  const overtoneGain = context.createGain()

  root.type = 'sine'
  overtone.type = 'triangle'
  root.frequency.value = 196
  overtone.frequency.value = 294
  rootGain.gain.value = 0.08 * peakGain
  overtoneGain.gain.value = 0.025 * peakGain

  root.connect(rootGain)
  overtone.connect(overtoneGain)
  rootGain.connect(output)
  overtoneGain.connect(output)

  root.start()
  overtone.start()

  fadeIn(context, output, peakGain, 0.9)

  const notes = [392, 440, 494, 523.25]
  const interval = window.setInterval(() => {
    const note = notes[Math.floor(Math.random() * notes.length)]
    playTone(context, output, 'crystal', {
      duration: 1.4,
      frequency: note,
      gain: 0.07 * peakGain,
    })
  }, 2400)

  return {
    stop(fadeOutMs = 900) {
      window.clearInterval(interval)
      fadeOut(context, output, fadeOutMs)
      window.setTimeout(() => {
        safeStop(root)
        safeStop(overtone)
      }, fadeOutMs + 60)
    },
  }
}

function playTone(
  context: AudioContext,
  destination: AudioNode,
  tone: ToneId,
  options: {
    duration: number
    frequency: number
    gain: number
  },
) {
  const now = context.currentTime
  const main = context.createOscillator()
  const harmonic = context.createOscillator()
  const envelope = context.createGain()
  const harmonicGain = context.createGain()

  main.frequency.value = options.frequency
  harmonic.frequency.value =
    tone === 'wooden' ? options.frequency * 2 : options.frequency * 1.5

  if (tone === 'softBell') {
    main.type = 'sine'
    harmonic.type = 'triangle'
  } else if (tone === 'crystal') {
    main.type = 'triangle'
    harmonic.type = 'sine'
  } else {
    main.type = 'triangle'
    harmonic.type = 'square'
  }

  envelope.gain.setValueAtTime(0.0001, now)
  envelope.gain.linearRampToValueAtTime(options.gain, now + 0.04)
  envelope.gain.exponentialRampToValueAtTime(
    0.0001,
    now + options.duration,
  )

  harmonicGain.gain.value =
    tone === 'wooden' ? options.gain * 0.16 : options.gain * 0.35

  main.connect(envelope)
  harmonic.connect(harmonicGain)
  harmonicGain.connect(envelope)
  envelope.connect(destination)

  main.start(now)
  harmonic.start(now)
  main.stop(now + options.duration + 0.05)
  harmonic.stop(now + options.duration + 0.05)
}

function fadeIn(
  context: AudioContext,
  output: GainNode,
  peakGain: number,
  durationSeconds: number,
) {
  output.gain.cancelScheduledValues(context.currentTime)
  output.gain.setValueAtTime(0.0001, context.currentTime)
  output.gain.exponentialRampToValueAtTime(
    peakGain,
    context.currentTime + durationSeconds,
  )
}

function fadeOut(
  context: AudioContext,
  output: GainNode,
  fadeOutMs: number,
) {
  const now = context.currentTime
  output.gain.cancelScheduledValues(now)
  output.gain.setValueAtTime(Math.max(output.gain.value, 0.0001), now)
  output.gain.exponentialRampToValueAtTime(0.0001, now + fadeOutMs / 1000)
}

function safeStop(node: AudioScheduledSourceNode) {
  try {
    node.stop()
  } catch {
    // Nodes may already be stopped, which is fine.
  }
}
