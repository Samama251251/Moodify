'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Play, Square, Wind } from 'lucide-react'
import { mp } from '@/lib/mixpanel'

type ExerciseKey = 'box' | '4-7-8' | 'simple'

interface Phase {
  label: string
  duration: number
}

const exercises: Record<ExerciseKey, Phase[]> = {
  box: [
    { label: 'Inhale', duration: 4 },
    { label: 'Hold', duration: 4 },
    { label: 'Exhale', duration: 4 },
    { label: 'Hold', duration: 4 },
  ],
  '4-7-8': [
    { label: 'Inhale', duration: 4 },
    { label: 'Hold', duration: 7 },
    { label: 'Exhale', duration: 8 },
  ],
  simple: [
    { label: 'Inhale', duration: 4 },
    { label: 'Exhale', duration: 4 },
  ],
}

const exerciseLabels: Record<ExerciseKey, string> = {
  box: 'Box Breathing',
  '4-7-8': '4-7-8 Breathing',
  simple: 'Simple Breathing',
}

const exerciseDescriptions: Record<ExerciseKey, string> = {
  box: 'A structured rhythm to calm the nervous system.',
  '4-7-8': 'A relaxation technique to reduce anxiety.',
  simple: 'Gentle breathing to find your center.',
}

const phaseColors: Record<string, { bg: string; glow: string; text: string }> = {
  Inhale: {
    bg: 'from-[#7d5700] to-[#e5a623]',
    glow: 'rgba(229,166,35,0.35)',
    text: '#7d5700',
  },
  Hold: {
    bg: 'from-[#5a7d3a] to-[#8bc46a]',
    glow: 'rgba(139,196,106,0.35)',
    text: '#3d6b1e',
  },
  Exhale: {
    bg: 'from-[#2a6b8a] to-[#5bb4d4]',
    glow: 'rgba(91,180,212,0.35)',
    text: '#1a5a7a',
  },
}

function getPhaseColor(label: string) {
  return phaseColors[label] ?? phaseColors['Inhale']
}

export default function BreathingPage() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseKey>('box')
  const [isRunning, setIsRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [sessionCount, setSessionCount] = useState(0)
  const [totalElapsed, setTotalElapsed] = useState(0)

  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const phases = exercises[selectedExercise]
  const currentPhase = phases[phaseIndex]
  const colors = getPhaseColor(currentPhase?.label ?? 'Inhale')

  const playTone = useCallback((frequency: number, duration: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch {
      // Audio API unavailable — silent fallback
    }
  }, [])

  const acquireWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {
      // Wake lock unavailable — graceful fallback
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
      }
    } catch {
      // ignore
    }
  }, [])

  const stopSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    releaseWakeLock()
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    if (elapsed > 5) {
      mp.track('breathing_completed', {
        exercise_type: selectedExercise,
        sessions: sessionCount,
        duration_seconds: elapsed,
      })
    }
    setIsRunning(false)
    setPhaseIndex(0)
    setCountdown(0)
    setTotalElapsed(0)
  }, [releaseWakeLock, selectedExercise, sessionCount])

  const startSession = useCallback(() => {
    setPhaseIndex(0)
    setSessionCount(0)
    setTotalElapsed(0)
    setCountdown(phases[0].duration)
    setIsRunning(true)
    acquireWakeLock()
    startTimeRef.current = Date.now()
    playTone(432, 0.4)
    mp.track('breathing_started', { exercise_type: selectedExercise })
  }, [phases, acquireWakeLock, playTone, selectedExercise])

  // Countdown timer
  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Advance to next phase
          setPhaseIndex((pi) => {
            const nextIndex = (pi + 1) % phases.length
            if (nextIndex === 0) {
              setSessionCount((s) => s + 1)
            }
            setCountdown(phases[nextIndex].duration)
            playTone(nextIndex === 0 ? 528 : 396, 0.3)
            return nextIndex
          })
          return phases[0].duration // will be overridden above
        }
        setTotalElapsed((e) => e + 1)
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, phases, playTone])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      releaseWakeLock()
    }
  }, [releaseWakeLock])

  const circleScale = currentPhase?.label === 'Inhale' ? 1.3 : currentPhase?.label === 'Exhale' ? 0.75 : 1.0

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="min-h-[100dvh] bg-[#fff9e9] flex flex-col relative overflow-hidden">
      {/* Subtle background overlay */}
      <div
        className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
        style={{
          background: isRunning
            ? `radial-gradient(ellipse at center, ${getPhaseColor(currentPhase?.label ?? 'Inhale').glow} 0%, transparent 70%)`
            : 'transparent',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pt-4 pb-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 min-h-[44px] min-w-[44px] px-2 text-[#7d5700] hover:text-[#e5a623] transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </Link>

        <div className="flex items-center gap-2">
          <Wind className="size-5 text-[#e5a623]" />
          <span className="text-[#7d5700] font-bold text-lg tracking-tight">Moodify Breathing</span>
        </div>

        {sessionCount > 0 && (
          <div className="bg-[#f9f3e3] px-3 py-1.5 rounded-full">
            <span className="text-xs font-semibold text-[#7d5700]">
              {sessionCount} {sessionCount === 1 ? 'cycle' : 'cycles'}
            </span>
          </div>
        )}
        {sessionCount === 0 && <div className="w-[70px]" />}
      </header>

      {/* Exercise selector */}
      <div className="relative z-10 flex justify-center px-4 pb-6">
        <div className="bg-[#f9f3e3] rounded-full p-1 flex gap-1">
          {(Object.keys(exercises) as ExerciseKey[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                if (!isRunning) {
                  setSelectedExercise(key)
                  setPhaseIndex(0)
                  setCountdown(0)
                }
              }}
              disabled={isRunning}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all min-h-[44px] ${
                selectedExercise === key
                  ? 'bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white shadow-md'
                  : 'text-[#7d5700] hover:bg-[#e8e2d3] disabled:opacity-50'
              }`}
            >
              {key === 'box' ? 'Box' : key === '4-7-8' ? '4-7-8' : 'Simple'}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-8 gap-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#7d5700] tracking-tight leading-tight">
            {exerciseLabels[selectedExercise]}
          </h1>
          <p className="text-[#775a00] text-base mt-1 opacity-80">
            {exerciseDescriptions[selectedExercise]}
          </p>
        </div>

        {/* Breathing circle */}
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
          {/* Outer ambient glow */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`glow-${isRunning ? currentPhase?.label : 'idle'}`}
              className="absolute rounded-full"
              style={{
                width: 360,
                height: 360,
                background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                filter: 'blur(20px)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isRunning ? 1 : 0.3, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>

          {/* Breathing circle */}
          <motion.div
            className={`rounded-full bg-gradient-to-br ${colors.bg} shadow-2xl flex flex-col items-center justify-center`}
            style={{ width: 200, height: 200 }}
            animate={
              isRunning
                ? {
                    scale: circleScale,
                    transition: {
                      duration: currentPhase?.duration ?? 4,
                      ease: currentPhase?.label === 'Inhale' ? 'easeIn' : currentPhase?.label === 'Exhale' ? 'easeOut' : 'easeInOut',
                    },
                  }
                : { scale: 1 }
            }
          >
            {isRunning ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentPhase?.label}
                    className="text-white font-bold text-xl tracking-[3px] uppercase"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentPhase?.label}
                  </motion.p>
                </AnimatePresence>
                <p className="text-white/80 text-3xl font-bold mt-1">{countdown}</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Wind className="size-8 text-white/80" />
                <p className="text-white/90 text-sm font-medium tracking-wide">Ready</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Phase steps indicator */}
        {isRunning && (
          <div className="flex items-center gap-2">
            {phases.map((phase, i) => (
              <div
                key={i}
                className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                  i === phaseIndex
                    ? 'bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white px-3 py-1'
                    : 'bg-[#e8e2d3] text-[#b5a08a] size-2'
                }`}
              >
                {i === phaseIndex && (
                  <span className="text-xs font-semibold whitespace-nowrap">{phase.label}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timer display */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-[#7d5700] text-4xl font-medium tracking-[-1px]">
              {formatTime(totalElapsed)}
            </p>
            <p className="text-[#b5a08a] text-sm mt-1">elapsed</p>
          </motion.div>
        )}

        {/* Control buttons */}
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <button
              onClick={startSession}
              className="flex items-center gap-3 bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white font-bold px-8 py-4 rounded-full shadow-[0px_12px_24px_rgba(125,87,0,0.25)] active:scale-95 transition-transform min-h-[56px] text-lg"
            >
              <Play className="size-5 fill-white" />
              Begin Session
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="flex items-center gap-3 bg-white border border-[rgba(213,196,174,0.4)] text-[#ba1a1a] font-bold px-8 py-4 rounded-full shadow-[0px_8px_16px_rgba(125,87,0,0.08)] active:scale-95 transition-transform min-h-[56px] text-sm tracking-[1px] uppercase"
            >
              <Square className="size-4 fill-[#ba1a1a]" />
              End Session
            </button>
          )}
        </div>

        {/* Instructions */}
        {!isRunning && (
          <div className="max-w-sm w-full">
            <div className="bg-[#f9f3e3] rounded-2xl p-4">
              <p className="text-[#7d5700] text-sm font-semibold mb-3">Phases</p>
              <div className="flex flex-col gap-2">
                {phases.map((phase, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`size-2 rounded-full bg-gradient-to-r ${getPhaseColor(phase.label).bg}`}
                    />
                    <span className="text-[#504534] text-sm">
                      <span className="font-medium">{phase.label}</span>
                      <span className="text-[#b5a08a] ml-1">— {phase.duration}s</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
