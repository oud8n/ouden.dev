import { useState } from 'react'
import { FigButton, Figure, Toggle } from '../Figure'

type Route = {
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
	path: string
	marked?: boolean
	optOut?: boolean
	fresh?: boolean
}

const BASE: Route[] = [
	{ method: 'GET', path: '/applications' },
	{ method: 'POST', path: '/applications', marked: true },
	{ method: 'POST', path: '/payments', marked: true },
	{ method: 'PATCH', path: '/settings', marked: true },
	{ method: 'POST', path: '/roles', marked: true },
	{ method: 'POST', path: '/support/tickets' },
	{ method: 'PUT', path: '/profile' },
	{ method: 'DELETE', path: '/documents/:id' },
	{ method: 'POST', path: '/auth/login', optOut: true },
	{ method: 'POST', path: '/auth/refresh', optOut: true },
]

const NEW_PATHS = [
	'/meetings',
	'/orders/:id/cancel',
	'/payouts',
	'/messages',
	'/invites',
	'/reports',
]

type Status = 'read' | 'safe' | 'open' | 'out'

function statusOf(route: Route, byDefault: boolean): Status {
	if (route.method === 'GET') return 'read'
	if (byDefault) return route.optOut ? 'out' : 'safe'
	return route.marked ? 'safe' : 'open'
}

const LABEL: Record<Status, string> = {
	read: 'read-only, skipped',
	safe: 'protected',
	open: 'unprotected',
	out: '@DisableIdempotency()',
}

export function DefaultsFigure() {
	const [byDefault, setByDefault] = useState(false)
	const [added, setAdded] = useState<Route[]>([])
	const routes = [...BASE, ...added]
	const open = routes.filter(r => statusOf(r, byDefault) === 'open').length

	const addRoute = () => {
		const path = NEW_PATHS[added.length % NEW_PATHS.length]
		setAdded(prev => [...prev, { method: 'POST', path, fresh: true }])
	}

	return (
		<Figure
			num={2}
			title='opt-in vs on by default'
			caption='Add a few routes the way a busy developer would: without remembering any decorator. Then flip the switch.'
			controls={
				<>
					<Toggle
						label='protected by default'
						on={byDefault}
						onChange={setByDefault}
					/>
					<FigButton onClick={addRoute}>+ new route</FigButton>
					<FigButton onClick={() => setAdded([])} disabled={!added.length}>
						reset
					</FigButton>
				</>
			}
		>
			<div className='defaults'>
				<div className='defaults-counter'>
					<span key={open} className={`defaults-num${open ? ' is-bad' : ''}`}>
						{open}
					</span>
					<span>unprotected write routes</span>
				</div>
				<ul className='defaults-list'>
					{routes.map((route, i) => {
						const status = statusOf(route, byDefault)
						return (
							<li
								key={`${route.path}-${i}`}
								className={`defaults-row is-${status}${route.fresh ? ' is-fresh' : ''}`}
							>
								<span className={`method method-${route.method.toLowerCase()}`}>
									{route.method}
								</span>
								<span className='defaults-path'>
									{route.path}
									{!byDefault && route.marked && (
										<span className='defaults-mark'>@Idempotent()</span>
									)}
								</span>
								<span className='defaults-status'>{LABEL[status]}</span>
							</li>
						)
					})}
				</ul>
			</div>
		</Figure>
	)
}
