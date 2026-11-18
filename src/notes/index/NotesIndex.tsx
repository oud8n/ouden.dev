import { ArrowIcon } from '../../components/icons'
import { NOTES, NOTES_UPCOMING } from '../../data/content'
import { NoteShell } from '../NoteLayout'

export function NotesIndex() {
	const base = import.meta.env.BASE_URL

	return (
		<NoteShell>
			<main className='note notes-index'>
				<div className='note-meta'>
					<span>{NOTES.length} published</span>
					<span>·</span>
					<span>{NOTES_UPCOMING.length} on the desk</span>
				</div>
				<h1 className='note-title'>
					Notes<span className='highlight'>.</span>
				</h1>
				<p className='note-lead'>
					Problems I ran into at work and in my own projects, written up with
					diagrams you can poke at.
				</p>

				<section className='notes-block'>
					<h2 className='notes-heading'>
						<span className='h-num'>01</span>published
					</h2>
					<div className='note-list'>
						{NOTES.map((note, i) => (
							<a
								key={note.slug}
								href={`${base}notes/${note.slug}/`}
								className='note-card'
								style={{ animationDelay: `${0.08 * i}s` }}
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
				</section>

				<section className='notes-block'>
					<h2 className='notes-heading'>
						<span className='h-num'>02</span>on the desk
					</h2>
					<ol className='upcoming'>
						{NOTES_UPCOMING.map((note, i) => (
							<li
								key={note.title}
								className={`upcoming-item is-${note.status}`}
								style={{ animationDelay: `${0.08 * (i + NOTES.length)}s` }}
							>
								<span className='upcoming-status'>{note.status}</span>
								<span className='upcoming-title'>{note.title}</span>
								<span className='upcoming-pitch'>{note.pitch}</span>
							</li>
						))}
					</ol>
					<p className='notes-ask'>
						Want one of these sooner? Tell me on{' '}
						<a className='text-link' href='https://t.me/oud8n' target='_blank' rel='noopener noreferrer'>
							Telegram
						</a>
						.
					</p>
				</section>
			</main>
		</NoteShell>
	)
}
