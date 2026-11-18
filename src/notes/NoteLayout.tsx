import { useEffect, useState, type ReactNode } from 'react'

function readTheme(): boolean {
	try {
		return localStorage.getItem('theme') !== 'light'
	} catch {
		return true
	}
}

function useReadingProgress(): number {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const update = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight
			setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
		}
		update()
		window.addEventListener('scroll', update, { passive: true })
		window.addEventListener('resize', update)
		return () => {
			window.removeEventListener('scroll', update)
			window.removeEventListener('resize', update)
		}
	}, [])

	return progress
}

type NoteLayoutProps = {
	title: ReactNode
	date: string
	readTime: string
	lead: string
	children: ReactNode
}

export function NoteLayout({
	title,
	date,
	readTime,
	lead,
	children,
}: NoteLayoutProps) {
	const [isDark, setIsDark] = useState(readTheme)
	const progress = useReadingProgress()
	const home = import.meta.env.BASE_URL

	useEffect(() => {
		document.documentElement.classList.toggle('dark-theme', isDark)
		try {
			localStorage.setItem('theme', isDark ? 'dark' : 'light')
		} catch {
			return
		}
	}, [isDark])

	return (
		<>
			<div
				className='note-progress'
				style={{ transform: `scaleX(${progress})` }}
				aria-hidden='true'
			/>
			<header className='note-header'>
				<a href={home} className='note-brand'>
					<span className='note-brace'>{'{'}</span> ouden{' '}
					<span className='note-brace'>{'}'}</span>
				</a>
				<nav className='note-nav'>
					<a href={`${home}#notes`}>← all notes</a>
					<button
						className='note-theme'
						onClick={() => setIsDark(prev => !prev)}
						aria-label='Toggle theme'
					>
						{isDark ? '☾' : '☀'}
					</button>
				</nav>
			</header>

			<main className='note'>
				<div className='note-meta'>
					<span>{date}</span>
					<span>·</span>
					<span>{readTime}</span>
				</div>
				<h1 className='note-title'>{title}</h1>
				<p className='note-lead'>{lead}</p>
				<article className='note-body'>{children}</article>
			</main>

			<footer className='note-footer'>
				<a href={home} className='text-link'>
					← back to ouden
				</a>
				<span>written by @oud8n</span>
			</footer>
		</>
	)
}
