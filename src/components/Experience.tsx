import type { ReactNode } from 'react'
import { EXPERIENCE_ITEMS } from '../data/content'

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g

function withLinks(text: string): ReactNode[] {
	const nodes: ReactNode[] = []
	let last = 0
	for (const match of text.matchAll(LINK_PATTERN)) {
		const index = match.index ?? 0
		nodes.push(text.slice(last, index))
		nodes.push(
			<a
				key={index}
				href={match[2]}
				target='_blank'
				rel='noopener noreferrer'
				className='text-link'
			>
				{match[1]}
			</a>,
		)
		last = index + match[0].length
	}
	nodes.push(text.slice(last))
	return nodes
}

export function Experience() {
	return (
		<section id='experience' className='section'>
			<div>
				<div className='section-content'>
					<h2 className='section-title'>
						Where I <span className='highlight'>work.</span>
					</h2>

					<div className='timeline'>
						{EXPERIENCE_ITEMS.map(item => (
							<div key={item.title} className='timeline-item'>
								<span className='timeline-year'>{item.year}</span>
								<div className='timeline-body'>
									<div className='timeline-head'>
										<h3 className='timeline-title'>{item.title}</h3>
										{item.tags.map(tag =>
											tag.url ? (
												<a
													key={tag.label}
													href={tag.url}
													target='_blank'
													rel='noopener noreferrer'
													className='chip chip-link'
												>
													{tag.label} ↗
												</a>
											) : (
												<span key={tag.label} className='chip'>
													{tag.label}
												</span>
											),
										)}
									</div>
									<p className='timeline-desc'>{withLinks(item.desc)}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
