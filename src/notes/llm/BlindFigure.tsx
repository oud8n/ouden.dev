import { useState } from 'react'
import { FigButton, Figure, Toggle } from '../Figure'
import { useInView, useSequence } from '../hooks'

type Msg = { side: 'author' | 'solver' | 'server'; text: string; tone?: 'ok' | 'bad' }

const CONDITION =
	'A 2 kg box is pulled along the floor by a rope at 30° to the horizontal with a force of 20 N. μ = 0.3. Find the acceleration, m/s².'

function script(disagree: boolean): Msg[] {
	const base: Msg[] = [
		{ side: 'author', text: `temperature 0.9 · writes the problem\n${CONDITION}\nAnswer: 5.7` },
		{ side: 'server', text: 'strips the answer, the hint and the solution' },
		{ side: 'solver', text: `temperature 0.1 · sees only the condition\n${CONDITION}` },
	]
	if (!disagree)
		return [
			...base,
			{ side: 'solver', text: 'N = mg − F sin 30° = 10 N, a = (F cos 30° − μN)/m\nAnswer: 7.2' },
			{ side: 'server', text: 'author 5.7 vs solver 7.2 → off by 21%, mismatch', tone: 'bad' },
			{ side: 'author', text: 'repair: forgot that the rope lifts the box.\nN = 10 N, not 20 N. Answer: 7.2' },
			{ side: 'solver', text: 'solves the repaired version\nAnswer: 7.2' },
			{ side: 'server', text: 'author 7.2 vs solver 7.2 → agreed, on to review', tone: 'ok' },
		]
	return [
		...base,
		{ side: 'solver', text: 'N = mg − F sin 30° = 10 N, a = (F cos 30° − μN)/m\nAnswer: 7.2' },
		{ side: 'server', text: 'author 5.7 vs solver 7.2 → mismatch', tone: 'bad' },
		{ side: 'author', text: 'repair: keeps the wrong N = 20 N, rewrites the story instead.\nAnswer: 5.7' },
		{ side: 'solver', text: 'Answer: 7.2' },
		{ side: 'server', text: 'still disagree after one repair → problem rejected', tone: 'bad' },
	]
}

const DELAYS = [700, 2400, 1800, 2400, 2400, 2200, 2600, 2200, 2400]

export function BlindFigure() {
	const [stubborn, setStubborn] = useState(false)
	const msgs = script(stubborn)
	const seq = useSequence(msgs.length, DELAYS)
	const ref = useInView<HTMLDivElement>(seq.play)

	return (
		<Figure
			num={3}
			title='a second model solves it without the answer'
			caption={
				stubborn
					? 'If the author defends its mistake, the problem is dropped. One repair round, no more.'
					: 'The solver never sees the answer key, so it cannot simply agree with it.'
			}
			controls={
				<>
					<FigButton onClick={seq.play}>▶ replay</FigButton>
					<Toggle
						label='author stays wrong'
						on={stubborn}
						onChange={on => {
							setStubborn(on)
							seq.play()
						}}
					/>
				</>
			}
		>
			<div className='chat' ref={ref}>
				{msgs.slice(0, seq.step).map((m, i) => (
					<div key={`${stubborn}-${i}`} className={`chat-msg is-${m.side}${m.tone ? ` is-${m.tone}` : ''}`}>
						<span className='chat-who'>{m.side}</span>
						<span className='chat-text'>{m.text}</span>
					</div>
				))}
				{seq.step === 0 && <div className='chat-hint'>press replay</div>}
			</div>
		</Figure>
	)
}
