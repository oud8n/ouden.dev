import { EXPERIENCE_ITEMS } from '../data/content'

export function Experience() {
	return (
		<section id='experience' className='section'>
			<div className='reveal'>
				<div className='section-content'>
					<h2 className='section-title'>Learning by shipping.</h2>

					<div className='timeline'>
						{EXPERIENCE_ITEMS.map(item => (
							<div key={item.title} className='timeline-item'>
								<span className='timeline-year'>{item.year}</span>
								<div className='timeline-body'>
									<div className='timeline-head'>
										<h3 className='timeline-title'>{item.title}</h3>
										{item.tags.map(tag => (
											<span key={tag} className='chip'>
												{tag}
											</span>
										))}
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
