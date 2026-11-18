import { useState } from 'react'
import { Figure } from '../Figure'

const FUNCS: Record<string, unknown> = {
	sqrt: Math.sqrt,
	sin: Math.sin,
	cos: Math.cos,
	tan: Math.tan,
	ln: Math.log,
	log10: Math.log10,
	exp: Math.exp,
	pi: Math.PI,
}

const SAFE = /^[\w\s+\-*/().,]*$/
const IDENT = /(?:^|[^\w.])([A-Za-z_]\w*)/g

type Vars = Record<string, number>

type Result =
	| { kind: 'value'; value: number }
	| { kind: 'free'; names: string[] }
	| { kind: 'error'; message: string }

function freeNames(expr: string, vars: Vars): string[] {
	const names = new Set<string>()
	for (const m of expr.matchAll(IDENT)) {
		const id = m[1]
		if (!(id in FUNCS) && !(id in vars)) names.add(id)
	}
	return [...names]
}

function evalWith(expr: string, env: Record<string, unknown>): number {
	const keys = Object.keys(env)
	const fn = new Function(...keys, `return (${expr})`)
	const out = fn(...keys.map(k => env[k]))
	if (typeof out !== 'number') throw new Error('not a number')
	return out
}

function evaluate(expr: string, vars: Vars): Result {
	if (!expr.trim()) return { kind: 'error', message: 'empty formula' }
	if (!SAFE.test(expr)) return { kind: 'error', message: 'only numbers, names and + - * / ** ( )' }
	const free = freeNames(expr, vars)
	try {
		if (free.length === 0) return { kind: 'value', value: evalWith(expr, { ...FUNCS, ...vars }) }
		const seed = (s: number) => Object.fromEntries(free.map((n, i) => [n, s * (i + 2)]))
		const a = evalWith(expr, { ...FUNCS, ...vars, ...seed(1.7) })
		const b = evalWith(expr, { ...FUNCS, ...vars, ...seed(2.9) })
		if (Math.abs(a - b) > 1e-9 * Math.max(1, Math.abs(a))) return { kind: 'free', names: free }
		return { kind: 'value', value: a }
	} catch {
		return { kind: 'error', message: 'the formula does not compute' }
	}
}

function tolerance(answer: string, want: number): number {
	const dot = answer.indexOf('.')
	const decimals = dot >= 0 ? answer.length - dot - 1 : 0
	return Math.max(0.02 * Math.abs(want), 0.5 * 10 ** -decimals)
}

const PRESETS = [
	{
		label: 'correct',
		expr: 'm*(v0-v)/(q*E)/1e-9',
		answer: '284',
	},
	{
		label: 'forgot the units',
		expr: 'm*(v0-v)/(q*E)',
		answer: '284',
	},
	{
		label: 'missing data',
		expr: 'm*(v0-v)/(q*E*d)/1e-9',
		answer: '284',
	},
]

const VARS: Vars = { m: 9.1e-31, v0: 5e6, v: 2e6, q: 1.6e-19, E: 60 }

function fmt(n: number): string {
	if (!Number.isFinite(n)) return String(n)
	return Math.abs(n) >= 1e5 || (Math.abs(n) < 1e-3 && n !== 0)
		? n.toExponential(3)
		: String(Number(n.toPrecision(5)))
}

export function CalcFigure() {
	const [expr, setExpr] = useState(PRESETS[0].expr)
	const [answer, setAnswer] = useState(PRESETS[0].answer)

	const want = Number(answer.replace(',', '.'))
	const result = evaluate(expr, VARS)
	const tol = Number.isFinite(want) ? tolerance(answer.replace(',', '.'), want) : 0
	const ok = result.kind === 'value' && Math.abs(result.value - want) <= tol

	const span = Math.max(tol * 4, 1e-12)
	const pos = (x: number) => Math.min(100, Math.max(0, 50 + ((x - want) / span) * 50))

	return (
		<Figure
			num={2}
			title='the formula has to agree with the answer'
			caption='An electron slows from 5·10⁶ to 2·10⁶ m/s in a field of 60 V/m. How long does it take, in ns? Edit the formula or the answer and watch the check.'
			controls={PRESETS.map(p => (
				<button
					key={p.label}
					className={`chip fp-preset${p.expr === expr && p.answer === answer ? ' is-active' : ''}`}
					onClick={() => {
						setExpr(p.expr)
						setAnswer(p.answer)
					}}
				>
					{p.label}
				</button>
			))}
		>
			<div className='calc'>
				<div className='calc-json'>
					<span className='tok-com'>Calc:</span>
					<span>{'{"expr": "'}</span>
					<input
						className='calc-expr'
						value={expr}
						onChange={e => setExpr(e.target.value)}
						aria-label='formula'
						spellCheck={false}
					/>
					<span>{'", "vars": {'}</span>
					<span className='calc-vars'>
						{Object.entries(VARS).map(([k, v]) => (
							<span key={k}>
								<span className='tok-str'>"{k}"</span>: <span className='tok-lit'>{v}</span>
							</span>
						))}
					</span>
					<span>{'}}'}</span>
				</div>

				<label className='calc-answer'>
					<span>Answer:</span>
					<input value={answer} onChange={e => setAnswer(e.target.value)} aria-label='answer' />
					<span className='calc-unit'>ns</span>
				</label>

				{result.kind === 'value' && Number.isFinite(want) && (
					<div className='calc-line'>
						<div
							className='calc-band'
							style={{ left: `${pos(want - tol)}%`, right: `${100 - pos(want + tol)}%` }}
						/>
						<div className='calc-want' style={{ left: '50%' }}>
							<span>answer {answer}</span>
						</div>
						<div
							className={`calc-got${ok ? ' is-ok' : ' is-off'}`}
							style={{ left: `${pos(result.value)}%` }}
						>
							<span>formula {fmt(result.value)}</span>
						</div>
					</div>
				)}

				<div
					key={`${result.kind}-${ok}`}
					className={`fp-verdict is-${ok ? 'ok' : result.kind === 'free' ? 'reject' : 'leak'}`}
				>
					{result.kind === 'free' &&
						`answer depends on ${result.names.join(', ')}, which has no value → the condition is missing data`}
					{result.kind === 'error' && result.message}
					{result.kind === 'value' &&
						(ok
							? `formula gives ${fmt(result.value)}, within ±${fmt(tol)} of the answer → pass`
							: `formula gives ${fmt(result.value)}, answer says ${answer} → reject`)}
				</div>
			</div>
		</Figure>
	)
}
