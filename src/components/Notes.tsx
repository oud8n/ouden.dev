import { NOTES } from '../data/content'
import { ArrowIcon } from './icons'

export function Notes() {
	return (
		<section id='notes' className='section'>
			<div>
				<div className='section-content'>
					<h2 className='section-title'>
						Things I've <span className='highlight'>written.</span>
					</h2>
					<p className='section-description'>
						Notes on problems I ran into at work and in my own projects.
					</p>

					<div className='note-list'>
						{NOTES.map(note => (
							<a
								key={note.slug}
								href={`${import.meta.env.BASE_URL}notes/${note.slug}/`}
								className='note-card'
							>
								<span className='note-card-meta'>
									{note.date} · {note.readTime}
								</span>
								<span className='note-card-title'>{note.title}</span>
								<span className='note-card-summary'>{note.summary}</span>
								<span className='note-card-foot'>
									<span className='note-card-tags'>
										{note.tags.map(tag => (
											<span key={tag} className='chip'>
												{tag}
											</span>
										))}
									</span>
									<span className='note-card-read'>
										read <ArrowIcon />
									</span>
								</span>
							</a>
						))}
					</div>

					<a href={`${import.meta.env.BASE_URL}notes/`} className='project-all'>
						<span>all notes and what’s coming</span>
						<ArrowIcon />
					</a>
				</div>
			</div>
		</section>
	)
}
