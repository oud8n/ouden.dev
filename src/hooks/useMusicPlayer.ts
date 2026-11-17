import { useEffect, useRef, useState } from 'react'

export function useMusicPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [hasError, setHasError] = useState(false)

	// state follows the element, so media keys / OS controls stay in sync
	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return
		const onPlay = () => setIsPlaying(true)
		const onPause = () => setIsPlaying(false)
		audio.addEventListener('play', onPlay)
		audio.addEventListener('pause', onPause)
		return () => {
			audio.removeEventListener('play', onPlay)
			audio.removeEventListener('pause', onPause)
		}
	}, [])

	const toggle = () => {
		const audio = audioRef.current
		if (!audio) return
		if (audio.paused) {
			audio.play().catch(() => setHasError(true))
		} else {
			audio.pause()
		}
	}

	return { audioRef, isPlaying, hasError, toggle }
}
