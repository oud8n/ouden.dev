import type { RefObject } from 'react'
import { PauseIcon, PlayIcon } from './icons'

const TRACK_FILE = 'Hugo TSR - Fenêtre Sur Rue.mp3'
const TRACK_TITLE = 'Hugo TSR — Fenêtre Sur Rue'

type VinylPlayerProps = {
	audioRef: RefObject<HTMLAudioElement | null>
	isPlaying: boolean
	onToggle: () => void
}

export function VinylPlayer({ audioRef, isPlaying, onToggle }: VinylPlayerProps) {
	const label = isPlaying ? `Pause: ${TRACK_TITLE}` : `Play: ${TRACK_TITLE}`

	return (
		<>
			<audio
				ref={audioRef}
				src={`${import.meta.env.BASE_URL}${TRACK_FILE}`}
				loop
				preload='none'
			/>
			<button
				className={`vinyl-btn ${isPlaying ? 'is-playing' : ''}`}
				onClick={onToggle}
				aria-label={label}
				aria-pressed={isPlaying}
				title={label}
			>
				<span className='vinyl-disc'>
					<span className='vinyl-label'>
						{isPlaying ? <PauseIcon /> : <PlayIcon />}
					</span>
				</span>
			</button>
		</>
	)
}
