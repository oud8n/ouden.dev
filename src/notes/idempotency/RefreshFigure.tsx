import { useState } from 'react'
import { FigButton, Figure, Toggle } from '../Figure'
import { useInView, useSequence } from '../hooks'

const DELAYS = [800, 2600, 2600, 2800, 2800]

type Line = { who: 'alice' | 'mallory' | 'server'; text: string; tone?: 'bad' | 'good' }

function linesFor(step: number, disabled: boolean): Line[] {
	const lines: Line[] = []
	if (step >= 1)
		lines.push({ who: 'alice', text: 'POST /auth/refresh · key 9c1e · cookie: refresh=…' })
	if (step >= 2)
		lines.push(
			disabled
				? { who: 'server', text: 'handler: token ok → 200 + Set-Cookie (nothing stored)' }
				: { who: 'server', text: 'fingerprint {actor: null, body: null, url: /auth/refresh} → saved 200 { session: alice }' },
		)
	if (step >= 3)
		lines.push({ who: 'mallory', text: 'POST /auth/refresh · key 9c1e · no cookie at all' })
	if (step >= 4)
		lines.push(
			disabled
				? { who: 'server', text: 'handler: no refresh token → 401', tone: 'good' }
				: { who: 'server', text: 'same fingerprint, key seen → replay 200 { session: alice }', tone: 'bad' },
		)
	if (step >= 5)
		lines.push(
			disabled
				? { who: 'mallory', text: 'gets nothing', tone: 'good' }
				: { who: 'mallory', text: 'is now holding Alice’s fresh session', tone: 'bad' },
		)
	return lines
}

const REPLAYED = [
	{ part: 'status code', kept: true },
	{ part: 'response body', kept: true },
	{ part: 'Set-Cookie header', kept: false },
	{ part: 'auth checks', kept: false },
]

export function RefreshFigure() {
	const [disabled, setDisabled] = useState(false)
	const seq = useSequence(DELAYS.length, DELAYS)
	const ref = useInView<HTMLDivElement>(seq.play)
	const lines = linesFor(seq.step, disabled)

	return (
		<Figure
			num={5}
			title='the refresh route under “safe by default”'
			caption={
				disabled
					? 'Opted out: every call reaches the handler, and the handler checks the cookie.'
					: 'No session means no actor, no body means an empty body. Every caller produces the same fingerprint.'
			}
			controls={
				<>
					<FigButton onClick={seq.play}>▶ play</FigButton>
					<Toggle
						label='@DisableIdempotency() on refresh'
						on={disabled}
						onChange={on => {
							setDisabled(on)
							seq.play()
						}}
					/>
				</>
			}
		>
			<div className='refresh' ref={ref}>
				<ul className='refresh-replay'>
					<li className='refresh-replay-title'>a replay restores</li>
					{REPLAYED.map(r => (
						<li key={r.part} className={r.kept ? 'is-kept' : 'is-lost'}>
							<span>{r.kept ? '✓' : '✕'}</span>
							{r.part}
						</li>
					))}
				</ul>
				<ol className='refresh-lines'>
					{lines.map((line, i) => (
						<li key={`${i}-${line.text}`} className={`who-${line.who}${line.tone ? ` is-${line.tone}` : ''}`}>
							<span className='refresh-who'>{line.who}</span>
							<span>{line.text}</span>
						</li>
					))}
					{lines.length === 0 && <li className='refresh-hint'>press play</li>}
				</ol>
			</div>
		</Figure>
	)
}
