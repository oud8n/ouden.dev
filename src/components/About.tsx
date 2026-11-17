import { ABOUT_FACTS } from '../data/content'
import { AsciiDonut } from './AsciiDonut'

export function About() {
	return (
		<section id='about' className='section'>
			<div>
				<div className='section-content'>
					<h2 className='section-title'>
						The <span className='highlight'>autonomous</span> one.
					</h2>

					<div className='about-grid'>
						<div className='about-lead'>
							<p className='section-text'>
								At work my colleagues call me "the autonomous one". I go for the
								tasks where it isn't clear at first how to build them: read the
								code, try things, come back with something that works.
							</p>
							<p className='section-text'>
								At Task Force I write whatever the project needs, which right
								now is NestJS and TypeScript on the backend and React on the
								front. For my own backends I reach for Go.
							</p>
						</div>

						<div className='facts-card'>
							<AsciiDonut />
							<dl className='facts-list'>
								{ABOUT_FACTS.map(fact => (
									<div className='facts-row' key={fact.key}>
										<dt className='facts-key'>{fact.key}</dt>
										<dd className='facts-value'>{fact.value}</dd>
									</div>
								))}
							</dl>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
