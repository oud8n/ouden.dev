import { useState } from 'react'
import { FigButton, Figure, Toggle } from '../Figure'
import { useInView, useSequence } from '../hooks'

type Tone = 'idle' | 'run' | 'wait' | 'win' | 'replay' | 'reject'
type Session = { attempts: number; outcome: string; reward: string; state: 'held' | 'done' | 'lost' | 'open' }
type Frame = { lanes: [string, Tone][]; session: Session; wallet: number; note: string }

const IDS = ['A', 'B', 'C', 'D', 'E']
const all = (text: string, tone: Tone): [string, Tone][] => IDS.map(() => [text, tone])
const open: Session = { attempts: 0, outcome: '—', reward: '—', state: 'open' }

const LOCKED: Frame[] = [
	{ lanes: all('POST /check · answer 24', 'idle'), session: open, wallet: 90, note: 'The student paid 10 for the task. A double click and three retries send five correct answers at once.' },
	{
		lanes: [['SELECT … FOR UPDATE ✓', 'win'], ...all('waiting for the row lock', 'wait').slice(1)],
		session: { ...open, state: 'held' },
		wallet: 90,
		note: 'A locks the session row. The other four queue behind it.',
	},
	{
		lanes: [['attempt 1 · correct · bonus ✓', 'run'], ...all('waiting for the row lock', 'wait').slice(1)],
		session: { attempts: 1, outcome: 'solved', reward: '15', state: 'held' },
		wallet: 90,
		note: 'First try, and the first-try bonus for this number today is still free: the reward is 15.',
	},
	{
		lanes: [['+15 · commit', 'win'], ...all('waiting for the row lock', 'wait').slice(1)],
		session: { attempts: 1, outcome: 'solved', reward: '15', state: 'done' },
		wallet: 105,
		note: 'A credits the wallet and commits in the same transaction. The lock is released.',
	},
	{
		lanes: [['+15 · commit', 'win'], ...all('outcome = solved → no pay', 'replay').slice(1)],
		session: { attempts: 1, outcome: 'solved', reward: '15', state: 'done' },
		wallet: 105,
		note: 'The others get the row one by one, see a finished session and only read the balance. Paid once.',
	},
]

const UNLOCKED: Frame[] = [
	LOCKED[0],
	{
		lanes: all('SELECT → attempts 0, open', 'run'),
		session: open,
		wallet: 90,
		note: 'Without FOR UPDATE all five read the session at once. Each one sees it open.',
	},
	{
		lanes: [['attempt 1 · bonus ✓ → 15', 'run'], ...all('attempt 1 · bonus taken → 10', 'run').slice(1)],
		session: { attempts: 1, outcome: 'solved', reward: '15', state: 'held' },
		wallet: 90,
		note: 'The bonus table still holds: its unique key lets one insert in, so only A gets 15. The others still count as first-try solves worth 10.',
	},
	{
		lanes: [['+15 · commit', 'win'], ...all('+10 · commit', 'reject').slice(1)],
		session: { attempts: 1, outcome: 'solved', reward: '10', state: 'lost' },
		wallet: 145,
		note: 'All five pay out. One solved task brought in 55 credits. The session row was the thing to lock.',
	},
]

const DELAYS = [1400, 3000, 3200, 3000, 3000]

export function RewardFigure() {
	const [unlocked, setUnlocked] = useState(false)
	const frames = unlocked ? UNLOCKED : LOCKED
	const seq = useSequence(frames.length - 1, DELAYS)
	const ref = useInView<HTMLDivElement>(seq.play)
	const frame = frames[Math.min(seq.step, frames.length - 1)]
	const done = seq.step >= frames.length - 1

	return (
		<Figure
			num={3}
			title='five correct answers, one reward'
			caption={frame.note}
			controls={
				<>
					<FigButton onClick={seq.play}>▶ play</FigButton>
					<FigButton onClick={seq.next} disabled={done}>
						step →
					</FigButton>
					<Toggle
						label='without FOR UPDATE'
						on={unlocked}
						onChange={on => {
							setUnlocked(on)
							seq.reset()
						}}
					/>
				</>
			}
		>
			<div className='race' ref={ref}>
				<ul className='race-reqs'>
					{frame.lanes.map(([text, tone], i) => (
						<li key={IDS[i]} className={`race-req is-${tone}`}>
							<span className='race-id'>{IDS[i]}</span>
							<span key={text} className='race-text'>
								{text}
							</span>
						</li>
					))}
				</ul>
				<div>
					<div className='race-table reward-table'>
						<div className='race-table-head'>
							<span>attempts</span>
							<span>outcome</span>
							<span>reward</span>
						</div>
						<div key={`${frame.session.state}-${frame.session.outcome}`} className={`race-table-row is-${frame.session.state}`}>
							<span>{frame.session.attempts}</span>
							<span>{frame.session.outcome}</span>
							<span>{frame.session.reward}</span>
						</div>
					</div>
					<div className={`pipe-verdict is-${done ? (frame.wallet === 105 ? 'ok' : 'fail') : 'wait'}`}>
						wallet: <span key={frame.wallet}>{frame.wallet}</span>
						{done && (frame.wallet === 105 ? ' ✓ paid once' : ' · should be 105')}
					</div>
				</div>
			</div>
		</Figure>
	)
}
