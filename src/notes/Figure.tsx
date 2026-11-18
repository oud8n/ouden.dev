import type { ReactNode } from 'react'

type FigureProps = {
	num: number
	title: string
	caption: ReactNode
	controls?: ReactNode
	children: ReactNode
}

export function Figure({ num, title, caption, controls, children }: FigureProps) {
	return (
		<figure className='fig'>
			<div className='fig-head'>
				<span className='fig-num'>fig. {num}</span>
				<span className='fig-title'>{title}</span>
			</div>
			<div className='fig-body'>{children}</div>
			{controls && <div className='fig-controls'>{controls}</div>}
			<figcaption className='fig-caption'>{caption}</figcaption>
		</figure>
	)
}

type ToggleProps = {
	label: string
	on: boolean
	onChange: (on: boolean) => void
}

export function Toggle({ label, on, onChange }: ToggleProps) {
	return (
		<button
			className={`fig-toggle${on ? ' is-on' : ''}`}
			role='switch'
			aria-checked={on}
			onClick={() => onChange(!on)}
		>
			<span className='fig-toggle-track'>
				<span className='fig-toggle-thumb' />
			</span>
			{label}
		</button>
	)
}

export function FigButton({
	children,
	onClick,
	disabled,
}: {
	children: ReactNode
	onClick: () => void
	disabled?: boolean
}) {
	return (
		<button className='fig-btn' onClick={onClick} disabled={disabled}>
			{children}
		</button>
	)
}
