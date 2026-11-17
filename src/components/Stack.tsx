import type { CSSProperties } from 'react'
import { STACK_CHAPTERS } from '../data/content'

type Tool = (typeof STACK_CHAPTERS)[number]['tools'][number]

const MIN_ITEMS_PER_HALF = 16
const SECONDS_PER_ITEM = 9

function ToolChip({ tool, showDot }: { tool: Tool; showDot: boolean }) {
	return (
		<span className='tool-chip-wrap'>
			<span className='tool-chip'>
				<span
					className='icon-mask tool-chip-icon'
					style={
						{
							['--icon-url']: `url(https://cdn.simpleicons.org/${tool.slug})`,
						} as CSSProperties
					}
				/>
				<span className='tool-chip-name'>{tool.name}</span>
			</span>
			{showDot && <span className='tool-chip-dot'>·</span>}
		</span>
	)
}

export function Stack() {
	return (
		<section id='stack' className='section'>
			<div>
				<div className='section-content'>
					<h2 className='section-title'>
						the <span className='highlight'>working</span> stack.
					</h2>
					<p className='section-description'>
						Tools I've used in real projects, grouped by where they sit in
						the stack.
					</p>

					<div className='stack-chapters'>
						{STACK_CHAPTERS.map((chapter, idx) => {
							const direction = idx % 2 === 0 ? 'left' : 'right'
							const repeatsPerHalf = Math.max(
								1,
								Math.ceil(MIN_ITEMS_PER_HALF / chapter.tools.length),
							)
							const half = Array.from({ length: repeatsPerHalf }).flatMap(
								() => chapter.tools,
							)
							const tiles = [...half, ...half]
							const duration = half.length * SECONDS_PER_ITEM

							return (
								<div
									key={chapter.title}
									className='chapter'
								>
									<div className='chapter-head'>
										<span className='chapter-num'>
											{String(idx + 1).padStart(2, '0')}
										</span>
										<span className='chapter-rule' />
										<h3 className='chapter-title'>{chapter.title}</h3>
										<span className='chapter-count'>
											{String(chapter.tools.length).padStart(2, '0')} tools
										</span>
									</div>
									<p className='chapter-desc'>{chapter.desc}</p>

									<div className={`marquee marquee-${direction}`}>
										<div
											className='marquee-track'
											style={{ ['--marquee-duration']: `${duration}s` } as CSSProperties}
										>
											{tiles.map((tool, i) => (
												<ToolChip
													key={`${tool.name}-${i}`}
													tool={tool}
													showDot
												/>
											))}
										</div>
									</div>

									<div className='chapter-tools-static'>
										{chapter.tools.map(tool => (
											<ToolChip key={tool.name} tool={tool} showDot={false} />
										))}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</section>
	)
}
