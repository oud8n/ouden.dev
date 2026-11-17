import { useEffect } from 'react'

const TARGETS = [
	'.section-title',
	'.section-description',
	'.section-text',
	'.facts-card',
	'.chapter',
	'.timeline-item',
	'.project',
	'.project-all',
	'.contact-row',
	'.contact-closing',
].join(',')

const STAGGER = 0.08
const MAX_STEPS = 6

export function useRevealAll() {
	useEffect(() => {
		document
			.querySelectorAll<HTMLElement>(TARGETS)
			.forEach(el => el.classList.add('reveal'))

		const revealEls = document.querySelectorAll<HTMLElement>('.reveal')
		if (!revealEls.length) return

		const observer = new IntersectionObserver(
			entries => {
				entries
					.filter(entry => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
					.forEach((entry, i) => {
						const el = entry.target as HTMLElement
						el.style.setProperty(
							'--r-delay',
							`${Math.min(i, MAX_STEPS) * STAGGER}s`,
						)
						el.classList.add('is-visible')
						observer.unobserve(el)
					})
			},
			{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
		)

		revealEls.forEach(el => observer.observe(el))
		return () => observer.disconnect()
	}, [])
}
