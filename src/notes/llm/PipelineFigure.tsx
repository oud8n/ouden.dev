import { useState } from 'react'
import { FigButton, Figure } from '../Figure'
import { useInView, useSequence } from '../hooks'

type Mark = 'ok' | 'fail' | 'fix' | 'skip'
type Stage = { id: string; label: string }

const STAGES: Stage[] = [
	{ id: 'gen', label: 'generate' },
	{ id: 'layout', label: 'layout' },
	{ id: 'calc', label: 'formula' },
	{ id: 'blind', label: 'blind solve' },
	{ id: 'repair', label: 'repair' },
	{ id: 'review', label: 'review' },
]

type Scenario = {
	key: string
	label: string
	marks: Mark[]
	log: string[]
	verdict: { tone: 'ok' | 'fail'; text: string }
}

const SCENARIOS: Scenario[] = [
	{
		key: 'clean',
		label: 'a clean problem',
		marks: ['ok', 'ok', 'ok', 'ok', 'skip', 'ok'],
		log: [
			'generate  №4 kinematics, complicators: units, trap',
			'layout    no tables, answer is one number',
			'formula   v0*t + a*t**2/2 → 24.0, answer says 24',
			'blind     solver got 24',
			'repair    not needed',
			'review    format ok, correct, difficulty 4',
		],
		verdict: { tone: 'ok', text: 'accepted → into the pool' },
	},
	{
		key: 'slip',
		label: 'an arithmetic slip',
		marks: ['ok', 'ok', 'fail', 'skip', 'skip', 'skip'],
		log: [
			'generate  №13 electrostatics, complicators: chain, ratio',
			'layout    fine',
			'formula   q*U/m → 3.2e5, answer says 3.2e4',
			'— rejected before anyone solves it, next attempt —',
		],
		verdict: { tone: 'fail', text: 'rejected at the formula, retry' },
	},
	{
		key: 'ambiguous',
		label: 'an ambiguous condition',
		marks: ['ok', 'ok', 'ok', 'fix', 'ok', 'ok'],
		log: [
			'generate  №2 dynamics, complicators: hidden, context',
			'layout    fine',
			'formula   consistent with its own answer: 12',
			'blind     solver got 8, the friction direction is unclear',
			'repair    author reads the solver, fixes the wording → both get 8',
			'review    format ok, correct, difficulty 4',
		],
		verdict: { tone: 'ok', text: 'accepted after one repair' },
	},
	{
		key: 'easy',
		label: 'too easy',
		marks: ['ok', 'ok', 'ok', 'ok', 'skip', 'fail'],
		log: [
			'generate  №1 kinematics, complicators: context, extra',
			'layout    fine',
			'formula   s/t → 15, answer says 15',
			'blind     solver got 15',
			'review    difficulty 2: "a textbook one-liner"',
		],
		verdict: { tone: 'fail', text: 'kept as a fallback candidate, try again' },
	},
]

const DELAYS = [700, 1500, 1500, 1700, 1900, 1700, 1700, 1500]

export function PipelineFigure() {
	const [scenario, setScenario] = useState(SCENARIOS[0])
	const seq = useSequence(STAGES.length + 1, DELAYS)
	const ref = useInView<HTMLDivElement>(seq.play)
	const step = seq.step

	const choose = (s: Scenario) => {
		setScenario(s)
		seq.play()
	}

	const lastIndex = scenario.marks.reduce((last, m, i) => (m === 'skip' ? last : i), 0)
	const visibleLog = scenario.log.slice(0, Math.min(step, scenario.log.length))
	const done = step > lastIndex + 1

	return (
		<Figure
			num={1}
			title='every generated problem runs a gauntlet'
			caption='Pick a scenario. A problem only reaches a student if every gate on its path lights up green.'
			controls={
				<>
					{SCENARIOS.map(s => (
						<button
							key={s.key}
							className={`chip fp-preset${s.key === scenario.key ? ' is-active' : ''}`}
							onClick={() => choose(s)}
						>
							{s.label}
						</button>
					))}
					<FigButton onClick={seq.play}>▶ replay</FigButton>
				</>
			}
		>
			<div className='pipe' ref={ref}>
				<ol className='pipe-stages'>
					{STAGES.map((stage, i) => {
						const mark = scenario.marks[i]
						const reached = step > i && i <= lastIndex
						const state = reached ? mark : mark === 'skip' && step > i ? 'skip' : 'idle'
						return (
							<li key={stage.id} className={`pipe-stage is-${state}`}>
								<span className='pipe-dot'>
									{state === 'ok' && '✓'}
									{state === 'fail' && '✕'}
									{state === 'fix' && '↻'}
								</span>
								<span className='pipe-label'>{stage.label}</span>
							</li>
						)
					})}
				</ol>

				<pre className='fig-log'>
					{visibleLog.map(line => (
						<span key={line}>{line}</span>
					))}
				</pre>

				<div className={`pipe-verdict is-${done ? scenario.verdict.tone : 'wait'}`}>
					{done ? scenario.verdict.text : 'running…'}
				</div>
			</div>
		</Figure>
	)
}
