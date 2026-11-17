import { useEffect, type RefObject } from 'react'

const CHARS = '.,-~:;=!*#$@'
const FONT = "800 120px Inter, 'JetBrains Mono', sans-serif"
const SAMPLE_STEP = 2
const DEPTH = 0.22
const DEPTH_LAYERS = 6
const LIGHT = normalize([-0.4, 0.5, 1])

type Point = {
	x: number
	y: number
	z: number
	nx: number
	ny: number
	nz: number
	accent: boolean
}

function normalize([x, y, z]: number[]) {
	const len = Math.hypot(x, y, z) || 1
	return [x / len, y / len, z / len]
}

function buildModel(text: string, accentChar: string): Point[] {
	const off = document.createElement('canvas')
	const octx = off.getContext('2d', { willReadFrequently: true })
	if (!octx) return []

	octx.font = FONT
	const widths = [...text].map(ch => octx.measureText(ch).width)
	const totalWidth = widths.reduce((a, b) => a + b, 0)
	const height = 140
	off.width = Math.ceil(totalWidth) + 8
	off.height = height

	octx.font = FONT
	octx.textBaseline = 'middle'
	octx.fillStyle = '#fff'
	octx.fillText(text, 4, height / 2)

	const accentRanges: [number, number][] = []
	let cursor = 4
	;[...text].forEach((ch, i) => {
		if (ch === accentChar) accentRanges.push([cursor, cursor + widths[i]])
		cursor += widths[i]
	})

	const { data, width } = octx.getImageData(0, 0, off.width, off.height)
	const filled = (x: number, y: number) =>
		x >= 0 && y >= 0 && x < width && y < height && data[(y * width + x) * 4 + 3] > 128

	const scale = 2 / totalWidth
	const points: Point[] = []

	for (let py = 0; py < height; py += SAMPLE_STEP) {
		for (let px = 0; px < width; px += SAMPLE_STEP) {
			if (!filled(px, py)) continue

			const x = (px - width / 2) * scale
			const y = (height / 2 - py) * scale
			const accent = accentRanges.some(([a, b]) => px >= a && px < b)

			points.push({ x, y, z: DEPTH / 2, nx: 0, ny: 0, nz: 1, accent })
			points.push({ x, y, z: -DEPTH / 2, nx: 0, ny: 0, nz: -1, accent })

			const gx =
				Number(filled(px + SAMPLE_STEP, py)) - Number(filled(px - SAMPLE_STEP, py))
			const gy =
				Number(filled(px, py + SAMPLE_STEP)) - Number(filled(px, py - SAMPLE_STEP))
			if (gx === 0 && gy === 0) continue

			const [nx, ny] = normalize([-gx, gy, 0])
			for (let l = 1; l < DEPTH_LAYERS; l++) {
				const z = -DEPTH / 2 + (DEPTH * l) / DEPTH_LAYERS
				points.push({ x, y, z, nx, ny, nz: 0, accent })
			}
		}
	}

	return points
}

export function useAsciiLogo(
	canvasRef: RefObject<HTMLCanvasElement | null>,
	text: string,
	accentChar: string,
) {
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const reduceMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches

		let model: Point[] = []
		let width = 0
		let height = 0
		let cols = 0
		let cell = 9
		let rows = 0
		let raf = 0
		let visible = false
		let time = 0

		let yaw = 0
		let pitch = 0.15
		let dragging = false
		let lastX = 0
		let lastY = 0

		const css = (name: string) =>
			getComputedStyle(document.documentElement)
				.getPropertyValue(name)
				.trim()
				.replace(/\s+/g, ',')

		const resize = () => {
			const parent = canvas.parentElement
			if (!parent) return
			const rect = parent.getBoundingClientRect()
			width = rect.width
			height = rect.height
			const dpr = window.devicePixelRatio || 1
			canvas.width = width * dpr
			canvas.height = height * dpr
			canvas.style.width = `${width}px`
			canvas.style.height = `${height}px`
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			cell = width < 500 ? 6 : 9
			cols = Math.max(1, Math.floor(width / cell))
			rows = Math.max(1, Math.floor(height / cell))
		}

		const draw = () => {
			raf = 0
			if (!visible) return

			if (width && height && model.length) {
				const size = cols * rows
				const zbuffer = new Float32Array(size)
				const lum = new Float32Array(size)
				const accent = new Uint8Array(size)

				const angleY = yaw + (reduceMotion ? 0 : Math.sin(time) * 0.55)
				const angleX = pitch + (reduceMotion ? 0 : Math.sin(time * 0.7) * 0.08)
				const cy = Math.cos(angleY)
				const sy = Math.sin(angleY)
				const cx = Math.cos(angleX)
				const sx = Math.sin(angleX)

				const K2 = 3.2
				const K1 = cols * K2 * 0.42
				const aspect = 1

				for (const p of model) {
					const x1 = p.x * cy + p.z * sy
					const z1 = -p.x * sy + p.z * cy
					const y2 = p.y * cx - z1 * sx
					const z2 = p.y * sx + z1 * cx

					const ooz = 1 / (K2 - z2)
					const xp = Math.floor(cols / 2 + K1 * ooz * x1)
					const yp = Math.floor(rows / 2 - K1 * ooz * y2 * aspect)
					if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue

					const idx = xp + cols * yp
					if (ooz <= zbuffer[idx]) continue

					const nx1 = p.nx * cy + p.nz * sy
					const nz1 = -p.nx * sy + p.nz * cy
					const ny2 = p.ny * cx - nz1 * sx
					const nz2 = p.ny * sx + nz1 * cx
					const l = nx1 * LIGHT[0] + ny2 * LIGHT[1] + nz2 * LIGHT[2]

					zbuffer[idx] = ooz
					lum[idx] = l
					accent[idx] = p.accent ? 1 : 0
				}

				ctx.clearRect(0, 0, width, height)
				ctx.font = `${cell}px 'JetBrains Mono', monospace`
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				const ink = `rgb(${css('--ink-rgb')})`
				const red = `rgb(${css('--red-rgb')})`

				for (let i = 0; i < size; i++) {
					if (!zbuffer[i]) continue
					const level = Math.max(0, Math.min(1, (lum[i] + 0.35) / 1.35))
					const ch = CHARS[Math.min(CHARS.length - 1, Math.floor(level * CHARS.length))]
					ctx.fillStyle = accent[i] ? red : ink
					ctx.fillText(
						ch,
						(i % cols) * cell + cell / 2,
						Math.floor(i / cols) * cell + cell / 2,
					)
				}
			}

			if (!dragging) time += 0.012
			raf = requestAnimationFrame(draw)
		}

		const start = () => {
			if (!raf) raf = requestAnimationFrame(draw)
		}

		const onPointerDown = (e: PointerEvent) => {
			dragging = true
			lastX = e.clientX
			lastY = e.clientY
			canvas.setPointerCapture(e.pointerId)
			canvas.style.cursor = 'grabbing'
		}
		const onPointerMove = (e: PointerEvent) => {
			if (!dragging) return
			yaw += (e.clientX - lastX) * 0.01
			pitch = Math.max(-1, Math.min(1, pitch + (e.clientY - lastY) * 0.01))
			lastX = e.clientX
			lastY = e.clientY
		}
		const onPointerUp = (e: PointerEvent) => {
			dragging = false
			canvas.style.cursor = 'grab'
			if (canvas.hasPointerCapture(e.pointerId)) {
				canvas.releasePointerCapture(e.pointerId)
			}
		}

		canvas.style.cursor = 'grab'
		canvas.addEventListener('pointerdown', onPointerDown)
		window.addEventListener('pointermove', onPointerMove)
		window.addEventListener('pointerup', onPointerUp)

		const ro = new ResizeObserver(resize)
		if (canvas.parentElement) ro.observe(canvas.parentElement)

		const io = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting
			if (visible) start()
		})
		io.observe(canvas)

		let cancelled = false
		document.fonts
			.load(FONT)
			.catch(() => undefined)
			.then(() => {
				if (cancelled) return
				model = buildModel(text, accentChar)
				resize()
				start()
			})

		return () => {
			cancelled = true
			cancelAnimationFrame(raf)
			ro.disconnect()
			io.disconnect()
			canvas.removeEventListener('pointerdown', onPointerDown)
			window.removeEventListener('pointermove', onPointerMove)
			window.removeEventListener('pointerup', onPointerUp)
		}
	}, [canvasRef, text, accentChar])
}
