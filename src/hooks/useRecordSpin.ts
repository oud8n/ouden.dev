import { useEffect, useRef, type RefObject } from 'react'

const SPIN_MS = 14000
const REWIND_MS_PER_TURN = 1600

function currentAngle(el: HTMLElement) {
	const t = getComputedStyle(el).transform
	if (!t || t === 'none') return 0
	const [a, b] = t.slice(t.indexOf('(') + 1, -1).split(',').map(Number)
	const deg = (Math.atan2(b, a) * 180) / Math.PI
	return (deg + 360) % 360
}

// Spins the element while playing; on pause it winds back counter-clockwise
// to 0°, like a rotary phone dial returning home.
export function useRecordSpin(
	ref: RefObject<HTMLElement | null>,
	isPlaying: boolean,
) {
	const anim = useRef<Animation | null>(null)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

		const from = currentAngle(el)
		anim.current?.cancel()

		if (isPlaying) {
			anim.current = el.animate(
				[
					{ transform: `rotate(${from}deg)` },
					{ transform: `rotate(${from + 360}deg)` },
				],
				{ duration: SPIN_MS, iterations: Infinity, easing: 'linear' },
			)
		} else if (from > 0.5) {
			anim.current = el.animate(
				[{ transform: `rotate(${from}deg)` }, { transform: 'rotate(0deg)' }],
				{
					duration: Math.max(350, (from / 360) * REWIND_MS_PER_TURN),
					easing: 'cubic-bezier(0.3, 0, 0.2, 1)',
					fill: 'forwards',
				},
			)
		}
	}, [ref, isPlaying])

	useEffect(() => () => anim.current?.cancel(), [])
}
