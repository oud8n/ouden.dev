import { CONTACTS } from '../data/content'

const footerContacts = CONTACTS.filter(c => c.inFooter)

type FooterProps = {
	onOpenTerminal: () => void
}

export function Footer({ onOpenTerminal }: FooterProps) {
	return (
		<footer className='footer'>
			<div className='footer-inner'>
				<span className='footer-text'>
					© 2026 ouden — built with React, Vite &amp; SCSS
				</span>

				<button className='footer-terminal' onClick={onOpenTerminal}>
					<span className='footer-terminal-icon'>&gt;_</span> terminal · ~
				</button>

				<div className='footer-links'>
					{footerContacts.map(contact => (
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
							aria-label={contact.name}
							className='footer-icon magnetic'
						>
							<contact.Icon />
						</a>
					))}
				</div>

			</div>
		</footer>
	)
}
