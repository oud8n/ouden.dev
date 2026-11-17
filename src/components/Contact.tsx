import { CONTACTS } from '../data/content'
import { ArrowIcon } from './icons'

type ContactProps = {
	onScrollTo: (id: string) => void
}

export function Contact({ onScrollTo }: ContactProps) {
	return (
		<section id='contact' className='section contact-section'>
			<div>
				<div className='section-content'>
					<h2 className='section-title contact-title'>Get in touch.</h2>
					<p className='section-description'>
						Open to internships and project work, or just a chat about code.
						Telegram is the fastest way to reach me.
					</p>

					<div className='contact-table'>
						<div className='contact-row contact-row-head'>
							<span className='contact-row-index'>#</span>
							<span className='contact-row-channel-label'>channel</span>
							<span className='contact-row-handle-label'>handle</span>
						</div>

						{CONTACTS.map((contact, i) => (
							<a
								key={contact.id}
								href={contact.url}
								target={
									contact.url.startsWith('mailto:') ? undefined : '_blank'
								}
								rel={
									contact.url.startsWith('mailto:')
										? undefined
										: 'noopener noreferrer'
								}
								className='contact-row'
							>
								<span className='contact-row-index'>
									{String(i + 1).padStart(2, '0')}
								</span>
								<div className='contact-row-channel'>
									<span className='contact-row-icon'>
										<contact.Icon />
									</span>
									<div className='contact-row-text'>
										<span className='contact-row-name'>
											{contact.name.toLowerCase()}
										</span>
										<span className='contact-row-sub'>{contact.sub}</span>
									</div>
								</div>
								<span className='contact-row-handle'>{contact.handle}</span>
								<span className='contact-row-arrow'>
									<ArrowIcon />
								</span>
							</a>
						))}
					</div>

					<div
						className='contact-closing'
					>
						<a
							href='#hero-top'
							onClick={e => {
								e.preventDefault()
								onScrollTo('hero-top')
							}}
							className='contact-back-top magnetic'
						>
							back to top
							<span className='contact-back-top-arrow'>↑</span>
						</a>
					</div>
				</div>
			</div>
		</section>
	)
}
