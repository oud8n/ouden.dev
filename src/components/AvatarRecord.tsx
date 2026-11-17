import { useRef, type RefObject } from 'react'
import { useRecordSpin } from '../hooks'
import { PauseIcon, PlayIcon } from './icons'

const TRACK_FILE = 'Hugo TSR - Fenêtre Sur Rue.mp3'
const TRACK_TITLE = 'Hugo TSR — Fenêtre Sur Rue'

type AvatarRecordProps = {
	audioRef: RefObject<HTMLAudioElement | null>
	isPlaying: boolean
	onToggle: () => void
}

export function AvatarRecord({
	audioRef,
	isPlaying,
	onToggle,
}: AvatarRecordProps) {
	const label = isPlaying ? `Pause: ${TRACK_TITLE}` : `Play: ${TRACK_TITLE}`
	const playingClass = isPlaying ? 'is-playing' : ''
	const avatarRef = useRef<HTMLImageElement>(null)
	useRecordSpin(avatarRef, isPlaying)

	return (
		<div className='avatar-record'>
			<audio
				ref={audioRef}
				src={`${import.meta.env.BASE_URL}${TRACK_FILE}`}
				loop
				preload='none'
			/>

			<button
				className={`profile-avatar-wrap ${playingClass}`}
				onClick={onToggle}
				aria-label={label}
				aria-pressed={isPlaying}
			>
				<img
					ref={avatarRef}
					src={`${import.meta.env.BASE_URL}avatar.gif`}
					alt='Skipy'
					className='profile-avatar'
				/>
				<span className='avatar-grooves' aria-hidden='true' />
				<span className='avatar-label' aria-hidden='true'>
					{isPlaying ? <PauseIcon /> : <PlayIcon />}
				</span>
			</button>

			<button
				className={`now-playing ${playingClass}`}
				onClick={onToggle}
				tabIndex={-1}
				aria-hidden='true'
			>
				<span className='now-playing-note'>♪</span>
				<span className='now-playing-hint'>tap to play song</span>
				<span className='now-playing-title'>{TRACK_TITLE}</span>
				<span className='now-playing-bars'>
					<span />
					<span />
					<span />
					<span />
				</span>
			</button>
		</div>
	)
}
