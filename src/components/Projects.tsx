import { GITHUB_REPOS_URL, PROJECTS, type Project } from '../data/content'
import { AsciiLogo } from './AsciiLogo'
import { ArrowIcon } from './icons'

function ProjectBody({ project, index }: { project: Project; index: number }) {
	return (
		<>
			<div className='project-info'>
				<div className='project-head'>
					<span className='project-num'>
						{String(index + 1).padStart(2, '0')}
					</span>
					<h3 className='project-name'>{project.name}</h3>
					{project.status && (
						<span className='project-status'>{project.status}</span>
					)}
					{project.url && (
						<span className='project-arrow'>
							<ArrowIcon />
						</span>
					)}
				</div>
				<p className='project-desc'>{project.desc}</p>
				<div className='project-tags'>
					{project.tags.map(tag => (
						<span key={tag} className='chip'>
							{tag}
						</span>
					))}
				</div>
			</div>

			{project.asciiLogo && (
				<div className='project-shot project-shot-ascii'>
					<AsciiLogo
						text={project.asciiLogo.text}
						accent={project.asciiLogo.accent}
					/>
				</div>
			)}

			{project.image && (
				<div className='project-shot'>
					<img
						src={`${import.meta.env.BASE_URL}${project.image}`}
						alt={`${project.name} screenshot`}
						loading='lazy'
					/>
				</div>
			)}
		</>
	)
}

export function Projects() {
	return (
		<section id='projects' className='section'>
			<div>
				<div className='section-content'>
					<h2 className='section-title'>
						Things I've <span className='highlight'>built.</span>
					</h2>
					<p className='section-description'>
						My own products and this site.
					</p>

					<div className='project-list'>
						{PROJECTS.map((project, i) =>
							project.url ? (
								<a
									key={project.name}
									href={project.url}
									target='_blank'
									rel='noopener noreferrer'
									className='project'
								>
									<ProjectBody project={project} index={i} />
								</a>
							) : (
								<div key={project.name} className='project'>
									<ProjectBody project={project} index={i} />
								</div>
							),
						)}
					</div>

					<a
						href={GITHUB_REPOS_URL}
						target='_blank'
						rel='noopener noreferrer'
						className='project-all'
					>
						<span>more on GitHub</span>
						<ArrowIcon />
					</a>
				</div>
			</div>
		</section>
	)
}
