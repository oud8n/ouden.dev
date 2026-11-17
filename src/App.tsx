import { useEffect, useRef, useState } from 'react'
import './App.scss'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Experience } from './components/Experience'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { Stack } from './components/Stack'
import {
	useAsciiBackground,
	useMagnetic,
	useMusicPlayer,
	useRevealAll,
} from './hooks'

export default function App() {
	const [isDark, setIsDark] = useState(() => {
		const saved = localStorage.getItem('theme')
		if (saved) return saved === 'dark'
		return true
	})

	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const music = useMusicPlayer()
	const asciiCanvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		document.documentElement.classList.toggle('dark-theme', isDark)
		localStorage.setItem('theme', isDark ? 'dark' : 'light')
	}, [isDark])

	useEffect(() => {
		document.body.style.overflow = isMenuOpen ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [isMenuOpen])

	useRevealAll()
	useMagnetic()
	useAsciiBackground(asciiCanvasRef, isDark)

	const handleScroll = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
	}

	const handleNavClick = (e: React.MouseEvent<HTMLElement>, id: string) => {
		e.preventDefault()
		setIsMenuOpen(false)
		handleScroll(id)
	}

	return (
		<>
			<div className='noise-overlay' />

			<Header
				isDark={isDark}
				onToggleTheme={() => setIsDark(!isDark)}
				isMenuOpen={isMenuOpen}
				onToggleMenu={() => setIsMenuOpen(prev => !prev)}
				onNavClick={handleNavClick}
			/>

			<main className={isMenuOpen ? 'is-blurred' : ''}>
				<Hero
					asciiCanvasRef={asciiCanvasRef}
					music={music}
					onScrollTo={handleScroll}
				/>
				<About />
				<Stack />
				<Experience />
				<Projects />
				<Contact onScrollTo={handleScroll} />
			</main>

			<Footer />
		</>
	)
}
