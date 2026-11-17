import type { CSSProperties } from 'react'
import { AsciiDonut } from './AsciiDonut'
import { ABOUT_PRINCIPLES } from '../data/content'

const WHOAMI_ROWS = [
	{ key: 'mode', value: 'backend-focused full-stack', accent: true },
	{ key: 'focus', value: 'system design, performance', accent: false },
	{ key: 'stack', value: 'Go, TypeScript, React', accent: false },
	{ key: 'infra', value: 'Linux, Docker, PostgreSQL', accent: false },
]

export function About() {
	return (
		<section id='about' className='section'>
			<div className='reveal'>
				<div className='section-content'>
					<h2 className='section-title'>
						Mostly <span className='highlight'>backend.</span>
					</h2>

					<div className='about-grid'>
						<div
							className='about-lead reveal'
							style={{ ['--r-delay']: '0.1s' } as CSSProperties}
						>
							<p className='about-quote'>
								"Code you understand beats code that looks clever."
							</p>
							<p className='section-text'>
								Most of my time goes into backend: APIs, databases, and keeping
								services stable under load. Go and Node on the server, React
								when there's a UI to build, Docker to ship it.
							</p>
							<p className='section-text'>
								I learn from documentation and source code, and I break my own
								projects on purpose to see what fails first.
							</p>
						</div>

						<div
							className='whoami-card terminal-window reveal'
							style={{ ['--r-delay']: '0.15s' } as CSSProperties}
						>
							<div className='terminal-titlebar'>
								<span className='terminal-dot terminal-dot-red' />
								<span className='terminal-dot terminal-dot-yellow' />
								<span className='terminal-dot terminal-dot-green' />
								<span className='terminal-titlebar-name'>skipy@dev</span>
							</div>

							<div className='whoami-content'>
								<div className='whoami-cmd'>
									<span className='whoami-prompt'>skipy@dev:~$</span> fastfetch
								</div>
								<div className='whoami-body'>
									<AsciiDonut />
									<div className='whoami-info'>
										{WHOAMI_ROWS.map(row => (
											<div className='whoami-row' key={row.key}>
												<span className='whoami-key'>{row.key}</span>
												<span
													className={
														row.accent
															? 'whoami-value whoami-value-accent'
															: 'whoami-value'
													}
												>
													{row.value}
												</span>
											</div>
										))}
									</div>
								</div>

								<div className='whoami-cmd'>
									<span className='whoami-prompt'>skipy@dev:~$</span> cat
									principles.md
								</div>
								<div className='whoami-principles'>
									{ABOUT_PRINCIPLES.map(p => (
										<div className='whoami-principle' key={p.n}>
											<span className='whoami-principle-n'>{p.n} ›</span>
											<span className='whoami-principle-text'>{p.text}</span>
										</div>
									))}
								</div>

								<div className='whoami-cmd'>
									<span className='whoami-prompt'>skipy@dev:~$</span>
									<span className='whoami-cursor' />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
