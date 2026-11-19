import { useState } from 'react'
import { FigButton, Figure } from '../Figure'
import { useInView, useSequence } from '../hooks'

type Tone = 'idle' | 'run' | 'wait' | 'win' | 'reject'
type Lane = { text: string; tone: Tone }
type Frame = { a: Lane; b: Lane; balance: number; hints: number; note: string }

type Mode = 'none' | 'mutex' | 'procs'

const START = 200
const COST = 50

const idle = (text = 'POST /hint'): Lane => ({ text, tone: 'idle' })

const FRAMES: Record<Mode, Frame[]> = {
	none: [
		{ a: idle(), b: idle(), balance: START, hints: 0, note: 'Two hint requests from the same student arrive together. A hint costs 50.' },
		{ a: { text: 'read wallets.json → 200', tone: 'run' }, b: { text: 'read wallets.json → 200', tone: 'run' }, balance: START, hints: 0, note: 'Both read the file. Both see 200.' },
		{ a: { text: 'check 200 ≥ 50 ✓', tone: 'run' }, b: { text: 'check 200 ≥ 50 ✓', tone: 'run' }, balance: START, hints: 0, note: 'Both checks pass, each against its own copy of the balance.' },
		{ a: { text: 'write 200 − 50 = 150', tone: 'win' }, b: { text: 'check 200 ≥ 50 ✓', tone: 'run' }, balance: 150, hints: 1, note: 'A writes 150 and hands out a hint.' },
		{ a: { text: 'write 200 − 50 = 150', tone: 'win' }, b: { text: 'write 200 − 50 = 150', tone: 'reject' }, balance: 150, hints: 2, note: 'B writes 150 too, right over A. A’s charge is gone.' },
	],
	mutex: [
		{ a: idle(), b: idle(), balance: START, hints: 0, note: 'Same two requests, now with a sync.Mutex around the whole read, check and write.' },
		{ a: { text: 'mu.Lock() ✓', tone: 'win' }, b: { text: 'mu.Lock() … waiting', tone: 'wait' }, balance: START, hints: 0, note: 'A takes the lock. B has to wait for it.' },
		{ a: { text: 'read 200 · check ✓', tone: 'run' }, b: { text: 'mu.Lock() … waiting', tone: 'wait' }, balance: START, hints: 0, note: 'A reads and checks while nobody else can touch the file.' },
		{ a: { text: 'write 150 · unlock', tone: 'win' }, b: { text: 'mu.Lock() … waiting', tone: 'wait' }, balance: 150, hints: 1, note: 'A writes 150 and releases the lock.' },
		{ a: { text: 'write 150 · unlock', tone: 'win' }, b: { text: 'mu.Lock() ✓ · read 150 · check ✓', tone: 'run' }, balance: 150, hints: 1, note: 'Only now B reads, and it sees A’s write.' },
		{ a: { text: 'write 150 · unlock', tone: 'win' }, b: { text: 'write 100 · unlock', tone: 'win' }, balance: 100, hints: 2, note: 'Two hints, 100 credits. Correct.' },
	],
	procs: [
		{ a: idle('POST /hint → process 1'), b: idle('POST /hint → process 2'), balance: START, hints: 0, note: 'Now the same code runs in two processes. Each one has its own mutex in its own memory.' },
		{ a: { text: 'mu.Lock() ✓ (process 1)', tone: 'win' }, b: { text: 'mu.Lock() ✓ (process 2)', tone: 'win' }, balance: START, hints: 0, note: 'Both locks are free, because they are two different locks.' },
		{ a: { text: 'read 200 · check ✓', tone: 'run' }, b: { text: 'read 200 · check ✓', tone: 'run' }, balance: START, hints: 0, note: 'Both read 200. The mutex did not stop anything.' },
		{ a: { text: 'write 150', tone: 'win' }, b: { text: 'read 200 · check ✓', tone: 'run' }, balance: 150, hints: 1, note: 'A writes 150.' },
		{ a: { text: 'write 150', tone: 'win' }, b: { text: 'write 150', tone: 'reject' }, balance: 150, hints: 2, note: 'B writes 150 over it. The lock lived in memory, the balance did not.' },
	],
}

const MODES: { key: Mode; label: string }[] = [
	{ key: 'none', label: 'no lock' },
	{ key: 'mutex', label: 'sync.Mutex' },
	{ key: 'procs', label: 'mutex, two processes' },
]

const DELAYS = [1400, 3000, 3000, 3000, 3000, 3000]

export function LostUpdateFigure() {
	const [mode, setMode] = useState<Mode>('none')
	const frames = FRAMES[mode]
	const seq = useSequence(frames.length - 1, DELAYS)
	const ref = useInView<HTMLDivElement>(seq.play)
	const frame = frames[Math.min(seq.step, frames.length - 1)]
	const done = seq.step >= frames.length - 1
	const should = START - frame.hints * COST
	const lost = frame.balance !== should

	const choose = (m: Mode) => {
		setMode(m)
		seq.play()
	}

	return (
		<Figure
			num={1}
			title='read → check → write, twice at once'
			caption={frame.note}
			controls={
				<>
					{MODES.map(m => (
						<button
							key={m.key}
							className={`chip fp-preset${m.key === mode ? ' is-active' : ''}`}
							onClick={() => choose(m.key)}
						>
							{m.label}
						</button>
					))}
					<FigButton onClick={seq.play}>▶ replay</FigButton>
					<FigButton onClick={seq.next} disabled={done}>
						step →
					</FigButton>
				</>
			}
		>
			<div className='race' ref={ref}>
				<ul className='race-reqs'>
					{(['a', 'b'] as const).map(id => {
						const lane = frame[id]
						return (
							<li key={id} className={`race-req is-${lane.tone}`}>
								<span className='race-id'>{id.toUpperCase()}</span>
								<span key={lane.text} className='race-text'>
									{lane.text}
								</span>
							</li>
						)
					})}
				</ul>
				<div>
					<div className='race-table'>
						<div className='race-table-head'>
							<span>wallet</span>
							<span>balance</span>
							<span>should be</span>
						</div>
						<div key={frame.balance} className={`race-table-row ${lost ? 'is-lost' : 'is-done'}`}>
							<span>student</span>
							<span>{frame.balance}</span>
							<span>{should}</span>
						</div>
					</div>
					<div className={`pipe-verdict is-${done ? (lost ? 'fail' : 'ok') : 'wait'}`}>
						{done
							? lost
								? `${frame.hints} hints for ${START - frame.balance} credits`
								: `${frame.hints} hints for ${START - frame.balance} credits ✓`
							: `hints handed out: ${frame.hints}`}
					</div>
				</div>
			</div>
		</Figure>
	)
}
