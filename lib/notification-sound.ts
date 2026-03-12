let audioContext: AudioContext | null = null

export function playNotificationSound() {
  try {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    const ctx = audioContext

    // Two-tone chime
    const now = ctx.currentTime
    const gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)
    gainNode.gain.setValueAtTime(0.15, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)

    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)
    osc1.connect(gainNode)
    osc1.start(now)
    osc1.stop(now + 0.15)

    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1174.66, now + 0.15)
    osc2.connect(gainNode)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.4)
  } catch {
    // Audio not supported or blocked
  }
}
