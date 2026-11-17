import { useRef } from 'react'
import { useAsciiLogo } from '../hooks'

export function AsciiLogo({ text, accent }: { text: string; accent: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	useAsciiLogo(canvasRef, text, accent)

	return (
		<canvas
			ref={canvasRef}
			className='ascii-logo-canvas'
			aria-label={`${text} in rotating ASCII`}
			role='img'
			onClick={e => e.preventDefault()}
		/>
	)
}
