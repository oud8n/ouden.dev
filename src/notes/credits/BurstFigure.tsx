import { useEffect, useRef, useState } from 'react'
import { FigButton, Figure, Toggle } from '../Figure'
import { useInView } from '../hooks'

type Tile = 'idle' | 'wait' | 'read' | 'ok' | 'no'

const START = 100
const COST = 10
const SIZES = [12, 20, 30]

const READ_ALL_MS = 2200
const OK_MS = 900
const NO_MS = 450

type State = { tiles: Tile[]; balance: number; charged: number }

function initial(size: number): State {
	return { tiles: Array(size).fill('idle'), balance: START, charged: 0 }
}

export function BurstFigure() {
	const [size, setSize] = useState(20)
	const [naive, setNaive] = useState(false)
	const [state, setState] = useState<State>(() => initial(20))
	const [running, setRunning] = useState(false)
	const timers = useRef<number[]>([])

	const clear = () => {
		timers.current.forEach(t => window.clearTimeout(t))
		timers.current = []
	}

	const run = (n = size, isNaive = naive) => {
		clear()
		setRunning(true)
		const tiles: Tile[] = Array(n).fill(isNaive ? 'read' : 'wait')
		setState({ tiles: [...tiles], balance: START, charged: 0 })

		let at = READ_ALL_MS
		let balance = START
		let charged = 0
		for (let i = 0; i < n; i++) {
			let tile: Tile
			if (isNaive) {
				tile = 'ok'
				balance = START - COST
				charged += COST
			} else if (balance >= COST) {
				tile = 'ok'
				balance -= COST
				charged += COST
			} else {
				tile = 'no'
			}
			const snapshot = { index: i, tile, balance, charged }
			timers.current.push(
				window.setTimeout(() => {
					setState(s => {
						const next = [...s.tiles]
						next[snapshot.index] = snapshot.tile
						return { tiles: next, balance: snapshot.balance, charged: snapshot.charged }
					})
				}, at),
			)
			at += tile === 'no' ? NO_MS : OK_MS
		}
		timers.current.push(window.setTimeout(() => setRunning(false), at))
	}

	useEffect(() => clear, [])

	const ref = useInView<HTMLDivElement>(() => run())

	const served = state.tiles.filter(t => t === 'ok').length
	const refused = state.tiles.filter(t => t === 'no').length
	const finished = !running && served + refused === state.tiles.length
	const honest = state.balance === START - served * COST

	return (
		<Figure
			num={2}
			title={`${size} spends of ${COST} against a balance of ${START}`}
			caption={
				naive
					? 'Read in Go, then write: every request reads 100 before anyone writes, so every check passes and every write leaves 90.'
					: 'One conditional UPDATE: each request waits for the row lock, then re-checks the balance the previous one left. Exactly ten get through.'
			}
			controls={
				<>
					{SIZES.map(n => (
						<button
							key={n}
							className={`chip fp-preset${n === size ? ' is-active' : ''}`}
							onClick={() => {
								setSize(n)
								run(n)
							}}
						>
							{n} requests
						</button>
					))}
					<FigButton onClick={() => run()}>▶ replay</FigButton>
					<Toggle
						label='read in Go, then write'
						on={naive}
						onChange={on => {
							setNaive(on)
							run(size, on)
						}}
					/>
				</>
			}
		>
			<div className='burst' ref={ref}>
				<div className='burst-wallet'>
					<span className='burst-label'>wallets.balance</span>
					<span key={state.balance} className={`burst-num${honest ? '' : ' is-bad'}`}>
						{state.balance}
					</span>
					<div className='burst-bar'>
						<div className='burst-fill' style={{ width: `${(state.balance / START) * 100}%` }} />
					</div>
				</div>
				<ol className='burst-grid'>
					{state.tiles.map((tile, i) => (
						<li key={i} className={`burst-tile is-${tile}`}>
							{tile === 'ok' ? `−${COST}` : tile === 'no' ? '0 rows' : tile === 'read' ? 'read 100' : tile === 'wait' ? 'lock…' : '·'}
						</li>
					))}
				</ol>
				<div className={`pipe-verdict is-${finished ? (honest ? 'ok' : 'fail') : 'wait'}`}>
					{finished
						? honest
							? `${served} served, ${refused} refused, ${state.charged} charged ✓`
							: `${served} served for ${START - state.balance} credits, should have cost ${served * COST}`
						: `served ${served} · refused ${refused}`}
				</div>
			</div>
		</Figure>
	)
}
