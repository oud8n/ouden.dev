import { EXPERIENCE_ITEMS } from '../data/content'

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
									<p className='timeline-desc'>{item.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
