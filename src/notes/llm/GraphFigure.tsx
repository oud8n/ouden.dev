import { useState } from 'react'
import { Figure } from '../Figure'

type Graph = { x_label: string; y_label: string; points: [number, number][] }

const INITIAL = '{"x_label": "t, s", "y_label": "v_x, m/s", "points": [[0, 6], [3, -6], [5, -6]]}'

const W = 320
const H = 200
const PAD = 34

function parse(text: string): Graph | string {
	try {
		const g = JSON.parse(text) as Graph
		if (!Array.isArray(g.points) || g.points.length < 2) return 'need at least two points'
		if (!g.points.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)))
			return 'points must be [x, y] pairs of numbers'
		return g
	} catch {
		return 'not valid JSON yet'
	}
}

function describe(g: Graph): string[] {
	const lines = [`Graph of ${g.y_label} against ${g.x_label}, a broken line through:`]
	g.points.forEach(([x, y]) => lines.push(`  (${x}; ${y})`))
	lines.push('Straight segments between consecutive points.')
	return lines
}

function Plot({ g }: { g: Graph }) {
	const xs = g.points.map(p => p[0])
	const ys = [...g.points.map(p => p[1]), 0]
	const [x0, x1] = [Math.min(...xs, 0), Math.max(...xs)]
	const [y0, y1] = [Math.min(...ys), Math.max(...ys)]
	const sx = (x: number) => PAD + ((x - x0) / (x1 - x0 || 1)) * (W - PAD * 1.6)
	const sy = (y: number) => H - PAD - ((y - y0) / (y1 - y0 || 1)) * (H - PAD * 1.6)
	const path = g.points.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x)},${sy(y)}`).join(' ')

	return (
		<svg className='graph-svg' viewBox={`0 0 ${W} ${H}`} role='img' aria-label='rendered graph'>
			<line x1={sx(x0)} y1={sy(0)} x2={W - 8} y2={sy(0)} className='graph-axis' />
			<line x1={sx(0)} y1={H - 8} x2={sx(0)} y2={10} className='graph-axis' />
			<text x={W - 8} y={sy(0) - 6} textAnchor='end' className='graph-label'>
				{g.x_label}
			</text>
			<text x={sx(0) + 6} y={16} className='graph-label'>
				{g.y_label}
			</text>
			<path key={path} d={path} className='graph-line' pathLength={1} />
			{g.points.map(([x, y]) => (
				<g key={`${x}-${y}`}>
					<line x1={sx(x)} y1={sy(y)} x2={sx(x)} y2={sy(0)} className='graph-guide' />
					<circle cx={sx(x)} cy={sy(y)} r={3} className='graph-dot' />
					<text x={sx(x)} y={sy(0) + 14} textAnchor='middle' className='graph-tick'>
						{x}
					</text>
				</g>
			))}
		</svg>
	)
}

export function GraphFigure() {
	const [text, setText] = useState(INITIAL)
	const g = parse(text)

	return (
		<Figure
			num={4}
			title='the model describes, the server draws'
			caption='The generator writes a [[GRAPH …]] marker instead of a picture. The student sees the drawing, the blind solver gets the same points as text. Edit the JSON.'
		>
			<div className='graph'>
				<textarea
					className='graph-json'
					value={text}
					onChange={e => setText(e.target.value)}
					spellCheck={false}
					aria-label='graph marker JSON'
				/>
				<div className='graph-out'>
					<div className='graph-pane'>
						<span className='fp-card-title'>student sees</span>
						{typeof g === 'string' ? <span className='graph-err'>{g}</span> : <Plot g={g} />}
					</div>
					<div className='graph-pane'>
						<span className='fp-card-title'>solver reads</span>
						<pre className='graph-text'>
							{typeof g === 'string' ? '…' : describe(g).join('\n')}
						</pre>
					</div>
				</div>
			</div>
		</Figure>
	)
}
