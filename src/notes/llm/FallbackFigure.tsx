import { useEffect, useRef, useState } from 'react'
import { Figure } from '../Figure'
import { useInView } from '../hooks'

type Route = {
	key: string
	label: string
	seconds: number
	steps: { at: number; text: string; tone?: 'ok' | 'bad' }[]
	result: string
}

const ROUTES: Route[] = [
	{
		key: 'pool',
		label: 'pool has one',
		seconds: 0.1,
		steps: [
			{ at: 0, text: 'take from pool: DELETE … FOR UPDATE SKIP LOCKED' },
			{ at: 0.1, text: 'got a checked problem instantly', tone: 'ok' },
			{ at: 0.1, text: 'background: refill the pool for this number' },
		],
		result: 'generated problem, ~0 s',
	},
	{
		key: 'live',
		label: 'pool empty',
		seconds: 13,
		steps: [
			{ at: 0, text: 'pool for №13 is empty' },
			{ at: 0, text: 'generate live with a 20 s deadline' },
			{ at: 9, text: 'formula ok, blind solve agrees' },
			{ at: 13, text: 'review passed', tone: 'ok' },
		],
		result: 'generated problem, 13 s',
	},
	{
		key: 'timeout',
		label: 'model is slow',
		seconds: 20,
		steps: [
			{ at: 0, text: 'pool for №13 is empty' },
			{ at: 0, text: 'generate live with a 20 s deadline' },
			{ at: 11, text: 'blind solve disagrees, repairing…' },
			{ at: 20, text: 'deadline hit', tone: 'bad' },
			{ at: 20, text: 'official FIPI problem №13 this student has not solved', tone: 'ok' },
		],
		result: 'real exam problem, 20 s',
	},
]

const SPEED = 3

export function FallbackFigure() {
	const [route, setRoute] = useState(ROUTES[1])
	const [t, setT] = useState(0)
	const [started, setStarted] = useState(false)
	const raf = useRef(0)

	const start = (r: Route) => {
		setRoute(r)
		setStarted(true)
		setT(0)
		cancelAnimationFrame(raf.current)
		let begin = -1
		const tick = (now: number) => {
			if (begin < 0) begin = now
			const elapsed = ((now - begin) / 1000) * SPEED
			setT(Math.min(elapsed, r.seconds))
			if (elapsed < r.seconds) raf.current = requestAnimationFrame(tick)
		}
		raf.current = requestAnimationFrame(tick)
	}

	useEffect(() => () => cancelAnimationFrame(raf.current), [])

	const ref = useInView<HTMLDivElement>(() => start(ROUTES[1]))

	const done = t >= route.seconds
	const shown = started ? route.steps.filter(s => s.at <= t) : []

	return (
		<Figure
			num={5}
			title='a student never waits more than 20 seconds'
			caption='Time runs three times faster here. Every route ends with a problem whose answer was checked.'
			controls={ROUTES.map(r => (
				<button
					key={r.key}
					className={`chip fp-preset${r.key === route.key ? ' is-active' : ''}`}
					onClick={() => start(r)}
				>
					▶ {r.label}
				</button>
			))}
		>
			<div className='fall' ref={ref}>
				<div className='fall-bar'>
					<div className='fall-fill' style={{ width: `${(t / 20) * 100}%` }} />
					<span className='fall-deadline'>20 s</span>
					<span className='fall-time'>{t.toFixed(1)} s</span>
				</div>
				<ol className='refresh-lines fall-lines'>
					{shown.map(s => (
						<li key={s.text} className={s.tone ? `is-${s.tone === 'ok' ? 'good' : 'bad'}` : ''}>
							<span className='refresh-who'>{s.at.toFixed(0)} s</span>
							<span>{s.text}</span>
						</li>
					))}
					{!started && <li className='refresh-hint'>pick a route</li>}
				</ol>
				{started && done && <div className='fp-verdict is-ok'>student gets: {route.result}</div>}
			</div>
		</Figure>
	)
}
