import { useEffect, useRef, useState } from 'react'

export function useSequence(length: number, delays: number[]) {
	const [step, setStep] = useState(0)
	const [playing, setPlaying] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	useEffect(() => {
		if (!playing || step >= length) return
		timer.current = window.setTimeout(
			() => setStep(s => s + 1),
			delays[step] ?? 900,
		)
		return () => window.clearTimeout(timer.current)
	}, [playing, step, length, delays])

	const play = () => {
		window.clearTimeout(timer.current)
		setStep(0)
		setPlaying(true)
	}

	const reset = () => {
		window.clearTimeout(timer.current)
		setPlaying(false)
		setStep(0)
	}

	const next = () => {
		setPlaying(false)
		setStep(s => Math.min(length, s + 1))
	}

	return { step, playing: playing && step < length, play, reset, next }
}

export function useInView<T extends HTMLElement>(onEnter: () => void) {
	const ref = useRef<T>(null)
	const enter = useRef(onEnter)

	useEffect(() => {
		enter.current = onEnter
	})

	useEffect(() => {
		const el = ref.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					enter.current()
					observer.disconnect()
				}
			},
			{ threshold: 0.45 },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return ref
}
