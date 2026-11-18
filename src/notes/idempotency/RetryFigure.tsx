import { useState } from 'react'
import { FigButton, Figure, Toggle } from '../Figure'
import { useInView, useSequence } from '../hooks'

const DELAYS = [600, 2600, 1800, 2800, 2000, 2600, 2200, 2600]

type Packet = { dir: 'right' | 'left'; label: string; lost?: boolean; ok?: boolean }

function packetAt(step: number, keyed: boolean): Packet | null {
	const key = keyed ? ' · key 7f3a' : ''
	if (step === 1) return { dir: 'right', label: `POST /applications${key}` }
	if (step === 3) return { dir: 'left', label: '201 created', lost: true }
	if (step === 5) return { dir: 'right', label: `POST /applications${key}` }
	if (step === 7) return { dir: 'left', label: '201 created', ok: true }
	return null
}

function logFor(step: number, keyed: boolean): string[] {
	const lines: string[] = []
	if (step >= 1) lines.push('app     → POST /applications')
	if (step >= 2) lines.push('server  ✓ application #1 created')
	if (step >= 3) lines.push('network ✕ response lost in a tunnel')
	if (step >= 4) lines.push('app     … no answer after 10s, retrying')
	if (step >= 5) lines.push('app     → POST /applications (again)')
	if (step >= 6)
		lines.push(
			keyed
				? 'server  ↺ key 7f3a seen before, replaying saved 201'
				: 'server  ✓ application #2 created',
		)
	if (step >= 7)
		lines.push(
			keyed
				? 'app     ✓ one application, as intended'
				: 'app     ✓ "success"… and a duplicate in the database',
		)
	return lines
}

export function RetryFigure() {
	const [keyed, setKeyed] = useState(false)
	const seq = useSequence(DELAYS.length, DELAYS)
	const { step, play, reset } = seq
	const ref = useInView<HTMLDivElement>(play)

	const packet = packetAt(step, keyed)
	const rows = [
		...(step >= 2 ? [{ id: 1, dup: false }] : []),
		...(step >= 6 && !keyed ? [{ id: 2, dup: true }] : []),
	]

	return (
		<Figure
			num={1}
			title='a retry over a flaky network'
			caption={
				keyed
					? 'With a key, the server recognises the retry and answers from memory. Still one row.'
					: 'Without a key, the server cannot tell a retry from a new request. Two rows.'
			}
			controls={
				<>
					<Toggle
						label='idempotency key'
						on={keyed}
						onChange={on => {
							setKeyed(on)
							play()
						}}
					/>
					<FigButton onClick={play}>▶ replay</FigButton>
					<FigButton onClick={reset}>reset</FigButton>
				</>
			}
		>
			<div className='retry' ref={ref}>
				<div className='retry-stage'>
					<div className={`node${step === 4 ? ' is-waiting' : ''}`}>
						<span className='node-icon'>▢</span>
						<span>app</span>
					</div>

					<div className='wire'>
						<div className='wire-line' />
						<div className='tunnel'>
							<span>tunnel</span>
						</div>
						{packet && (
							<div
								key={step}
								className={`packet packet-${packet.dir}${packet.lost ? ' is-lost' : ''}${packet.ok ? ' is-ok' : ''}`}
							>
								{packet.label}
							</div>
						)}
					</div>

					<div className={`node${step === 2 || step === 6 ? ' is-busy' : ''}`}>
						<span className='node-icon'>⛁</span>
						<span>server</span>
					</div>
				</div>

				<div className='retry-db'>
					<span className='retry-db-title'>applications</span>
					{rows.length === 0 && <span className='retry-db-empty'>empty</span>}
					{rows.map(row => (
						<span
							key={row.id}
							className={`retry-row${row.dup ? ' is-dup' : ''}`}
						>
							#{row.id} · Alice · {row.dup ? 'duplicate!' : 'pending review'}
						</span>
					))}
				</div>

				<pre className='fig-log'>
					{logFor(step, keyed).map(line => (
						<span key={line}>{line}</span>
					))}
				</pre>
			</div>
		</Figure>
	)
}
