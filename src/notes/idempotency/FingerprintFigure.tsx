import { useEffect, useState } from 'react'
import { Figure, Toggle } from '../Figure'

type Req = { actor: string; path: string; body: string }

const STORED: Req = {
	actor: 'u_42',
	path: '/applications/18/approve',
	body: '{"comment":"looks good"}',
}

const PRESETS: { label: string; req: Req }[] = [
	{ label: 'same request', req: STORED },
	{ label: 'another user', req: { ...STORED, actor: 'u_77' } },
	{ label: 'another application', req: { ...STORED, actor: 'u_77', path: '/applications/19/approve' } },
	{ label: 'another body', req: { ...STORED, body: '{"comment":"rejected"}' } },
]

function canonical(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(canonical)
	if (value && typeof value === 'object')
		return Object.fromEntries(
			Object.keys(value as Record<string, unknown>)
				.sort()
				.map(k => [k, canonical((value as Record<string, unknown>)[k])]),
		)
	return value
}

function parseBody(body: string): unknown {
	try {
		return JSON.parse(body)
	} catch {
		return body
	}
}

function patternOf(path: string): string {
	return path.replace(/\/\d+(?=\/|$)/g, '/:id')
}

async function sha256(text: string): Promise<string> {
	const data = new TextEncoder().encode(text)
	const digest = await crypto.subtle.digest('SHA-256', data)
	return Array.from(new Uint8Array(digest))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('')
}

function fingerprintInput(req: Req, withActor: boolean, fullUrl: boolean): string {
	return JSON.stringify(
		canonical({
			...(withActor ? { actorId: req.actor || null } : {}),
			body: parseBody(req.body),
			path: fullUrl ? req.path : patternOf(req.path),
		}),
	)
}

function useHash(input: string): string {
	const [hash, setHash] = useState('')
	useEffect(() => {
		let alive = true
		sha256(input).then(h => alive && setHash(h))
		return () => {
			alive = false
		}
	}, [input])
	return hash
}

export function FingerprintFigure() {
	const [req, setReq] = useState<Req>(PRESETS[1].req)
	const [withActor, setWithActor] = useState(false)
	const [fullUrl, setFullUrl] = useState(false)

	const storedHash = useHash(fingerprintInput(STORED, withActor, fullUrl))
	const incomingHash = useHash(fingerprintInput(req, withActor, fullUrl))
	const match = storedHash !== '' && storedHash === incomingHash
	const sameRequest =
		req.actor === STORED.actor &&
		req.path === STORED.path &&
		JSON.stringify(canonical(parseBody(req.body))) ===
			JSON.stringify(canonical(parseBody(STORED.body)))
	const leak = match && !sameRequest

	const verdict = leak
		? { tone: 'leak', text: 'match → replays u_42’s receipt to someone else' }
		: match
			? { tone: 'ok', text: 'match → replay the saved answer' }
			: { tone: 'reject', text: 'mismatch → 409 key reused' }

	return (
		<Figure
			num={4}
			title='what goes into the fingerprint'
			caption='Start with the naive fingerprint: route pattern and body only. Pick “another user”, then switch the actor and the full URL on.'
			controls={
				<>
					<Toggle label='include actor' on={withActor} onChange={setWithActor} />
					<Toggle label='full URL, not pattern' on={fullUrl} onChange={setFullUrl} />
				</>
			}
		>
			<div className='fp'>
				<div className='fp-presets'>
					{PRESETS.map(p => (
						<button
							key={p.label}
							className={`chip fp-preset${JSON.stringify(p.req) === JSON.stringify(req) ? ' is-active' : ''}`}
							onClick={() => setReq(p.req)}
						>
							{p.label}
						</button>
					))}
				</div>

				<div className='fp-grid'>
					<div className='fp-card'>
						<span className='fp-card-title'>stored with key 7f3a</span>
						<dl>
							<dt>actor</dt>
							<dd className={withActor ? '' : 'is-ignored'}>{STORED.actor}</dd>
							<dt>url</dt>
							<dd>{fullUrl ? STORED.path : patternOf(STORED.path)}</dd>
							<dt>body</dt>
							<dd>{STORED.body}</dd>
						</dl>
						<code className='fp-hash'>{storedHash.slice(0, 24)}…</code>
					</div>

					<div className='fp-card'>
						<span className='fp-card-title'>incoming with key 7f3a</span>
						<dl>
							<dt>actor</dt>
							<dd className={withActor ? '' : 'is-ignored'}>
								<input
									value={req.actor}
									onChange={e => setReq({ ...req, actor: e.target.value })}
									aria-label='actor'
								/>
							</dd>
							<dt>url</dt>
							<dd>
								<input
									value={req.path}
									onChange={e => setReq({ ...req, path: e.target.value })}
									aria-label='url'
								/>
							</dd>
							<dt>body</dt>
							<dd>
								<input
									value={req.body}
									onChange={e => setReq({ ...req, body: e.target.value })}
									aria-label='body'
								/>
							</dd>
						</dl>
						<code className='fp-hash'>{incomingHash.slice(0, 24)}…</code>
					</div>
				</div>

				<div key={verdict.text} className={`fp-verdict is-${verdict.tone}`}>
					{verdict.text}
				</div>
			</div>
		</Figure>
	)
}
