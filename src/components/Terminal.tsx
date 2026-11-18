import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { COMMANDS, run, type Line } from './terminalCommands'

const BOOT: Line[] = [
	{ kind: 'ok', text: 'oud8n.sh 1.0 — you found the terminal.' },
	{ kind: 'out', text: 'type help to see what it can do. esc closes.' },
]

type TerminalProps = {
	open: boolean
	onClose: () => void
	onToggleTheme: () => void
}

export function Terminal({ open, onClose, onToggleTheme }: TerminalProps) {
	const [lines, setLines] = useState<Line[]>(BOOT)
	const [value, setValue] = useState('')
	const [history, setHistory] = useState<string[]>([])
	const [cursor, setCursor] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (open) inputRef.current?.focus()
	}, [open])

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
	}, [lines])

	const submit = () => {
		let cleared = false
		const output = run(value, {
			open: url => window.open(url, url.startsWith('mailto:') ? '_self' : '_blank'),
			toggleTheme: onToggleTheme,
			clear: () => {
				cleared = true
			},
			close: onClose,
		})
		const echo: Line = { kind: 'in', text: value }
		setLines(prev => (cleared ? [] : [...prev, echo, ...output]))
		if (value.trim()) setHistory(prev => [value, ...prev])
		setCursor(-1)
		setValue('')
	}

	const recall = (next: number) => {
		if (next < -1 || next >= history.length) return
		setCursor(next)
		setValue(next === -1 ? '' : history[next])
	}

	const complete = () => {
		const match = COMMANDS.filter(c => c.startsWith(value.trim()))
		if (match.length === 1) setValue(`${match[0]} `)
		if (match.length > 1) setLines(prev => [...prev, { kind: 'out', text: match.join('  ') }])
	}

	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		const actions: Record<string, () => void> = {
			Enter: submit,
			ArrowUp: () => recall(cursor + 1),
			ArrowDown: () => recall(cursor - 1),
			Tab: complete,
			Escape: onClose,
		}
		const action = actions[e.key]
		if (!action) return
		e.preventDefault()
		action()
	}

	return (
		<div
			className={`terminal${open ? ' is-open' : ''}`}
			role='dialog'
			aria-label='Terminal'
			aria-hidden={!open}
			onClick={() => inputRef.current?.focus()}
		>
			<div className='terminal-bar'>
				<span className='terminal-dots'>
					<i />
					<i />
					<i />
				</span>
				<span>oud8n@site: ~</span>
				<button className='terminal-close' onClick={onClose} aria-label='Close terminal'>
					esc
				</button>
			</div>
			<div className='terminal-screen' ref={scrollRef}>
				{lines.map((line, i) => (
					<div key={i} className={`terminal-line is-${line.kind}`}>
						{line.kind === 'in' && <span className='terminal-prompt'>oud8n@site:~$</span>}
						{line.text}
					</div>
				))}
				<label className='terminal-input'>
					<span className='terminal-prompt'>oud8n@site:~$</span>
					<input
						ref={inputRef}
						value={value}
						onChange={e => setValue(e.target.value)}
						onKeyDown={onKeyDown}
						spellCheck={false}
						autoCapitalize='off'
						autoComplete='off'
						tabIndex={open ? 0 : -1}
						aria-label='Command'
					/>
				</label>
			</div>
		</div>
	)
}
