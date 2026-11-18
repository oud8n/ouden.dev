import { useState } from 'react'
import { FigButton, Figure, Toggle } from '../Figure'
import { useInView, useSequence } from '../hooks'

const DELAYS = [400, 1300, 1300, 1400, 1300, 1400, 1300]

type Row = { status: string; body: string; state: 'held' | 'done' | 'gone' }

type Req = { id: string; text: string; tone: 'win' | 'wait' | 'replay' | 'reject' | 'run' | 'idle' }

function scene(step: number, fails: boolean): { row: Row | null; reqs: Req[]; note: string } {
	const reqs: Req[] = [
		{ id: 'A', text: 'POST /orders · key 7f3a', tone: 'idle' },
		{ id: 'B', text: 'POST /orders · key 7f3a', tone: 'idle' },
		{ id: 'C', text: 'retry · key 7f3a', tone: 'idle' },
		{ id: 'D', text: 'other body · key 7f3a', tone: 'idle' },
	]
	const set = (id: string, tone: Req['tone'], text?: string) => {
		const req = reqs.find(r => r.id === id)!
		req.tone = tone
		if (text) req.text = text
	}

	if (step === 0) return { row: null, reqs, note: 'Two identical requests are about to arrive at the same moment.' }

	let row: Row | null = { status: '—', body: '—', state: 'held' }
	set('A', 'win', 'INSERT ✓ reserved the key')
	set('B', 'wait', 'INSERT ✕ unique violation')
	if (step === 1) return { row, reqs, note: 'Both try to reserve. The unique constraint lets exactly one insert through.' }

	set('B', 'reject', '409 in progress')
	set('A', 'run', 'handler running…')
	if (step === 2) return { row, reqs, note: 'The loser reads the row, sees no status yet and answers 409 in progress.' }

	if (fails) {
		row = { status: '—', body: '—', state: 'gone' }
		set('A', 'reject', 'handler threw → row released')
		if (step === 3) return { row, reqs, note: 'The handler fails. The reservation is deleted, so the same key can be used again.' }
		set('C', 'win', 'INSERT ✓ fresh attempt')
		if (step === 4) return { row: { status: '—', body: '—', state: 'held' }, reqs, note: 'The retry reserves the key from scratch and runs the handler for real.' }
		set('C', 'run', 'handler running…')
		row = { status: '201', body: '{ id: 18 }', state: 'done' }
		set('C', 'replay', '201 created')
		return { row, reqs, note: 'A failure never gets cached. Only a finished answer is worth replaying.' }
	}

	row = { status: '201', body: '{ id: 18 }', state: 'done' }
	set('A', 'win', '201 created → saved to the row')
	if (step === 3) return { row, reqs, note: 'The handler finishes. Status and body are stored next to the key.' }

	set('C', 'replay', 'fingerprint ✓ → replay 201')
	if (step === 4) return { row, reqs, note: 'A later retry with the same request gets the stored answer. The handler does not run again.' }

	set('D', 'reject', 'fingerprint ✕ → 409 key reused')
	return { row, reqs, note: 'Same key, different request: refused, so a key can never return an answer to a question it did not ask.' }
}

export function RaceFigure() {
	const [fails, setFails] = useState(false)
	const steps = fails ? 6 : 5
	const seq = useSequence(steps, DELAYS)
	const ref = useInView<HTMLDivElement>(seq.play)
	const { row, reqs, note } = scene(seq.step, fails)

	return (
		<Figure
			num={3}
			title='reserve → work → complete or release'
			caption={note}
			controls={
				<>
					<FigButton onClick={seq.play}>▶ play</FigButton>
					<FigButton onClick={seq.next} disabled={seq.step >= steps}>
						step →
					</FigButton>
					<Toggle
						label='handler throws'
						on={fails}
						onChange={on => {
							setFails(on)
							seq.reset()
						}}
					/>
				</>
			}
		>
			<div className='race' ref={ref}>
				<ul className='race-reqs'>
					{reqs.map(req => (
						<li key={req.id} className={`race-req is-${req.tone}`}>
							<span className='race-id'>{req.id}</span>
							<span key={req.text} className='race-text'>
								{req.text}
							</span>
						</li>
					))}
				</ul>
				<div className='race-table'>
					<div className='race-table-head'>
						<span>key</span>
						<span>status</span>
						<span>response</span>
					</div>
					{row ? (
						<div key={`${row.state}-${row.status}`} className={`race-table-row is-${row.state}`}>
							<span>7f3a</span>
							<span>{row.status}</span>
							<span>{row.body}</span>
						</div>
					) : (
						<div className='race-table-empty'>no rows</div>
					)}
				</div>
			</div>
		</Figure>
	)
}
