import { Code } from '../Code'
import { NoteLayout } from '../NoteLayout'
import { DefaultsFigure } from './DefaultsFigure'
import { FingerprintFigure } from './FingerprintFigure'
import { RaceFigure } from './RaceFigure'
import { RefreshFigure } from './RefreshFigure'
import { RetryFigure } from './RetryFigure'

const GATE = `
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

if (!MUTATING.has(request.method)) return next.handle()

const disabled = reflector.getAllAndOverride(DISABLE_IDEMPOTENCY, [
  context.getHandler(),
  context.getClass(),
])
if (disabled) return next.handle()

const key = request.headers['idempotency-key']
if (key === undefined) return next.handle()
`

const FINGERPRINT = `
const fingerprint = sha256(
  canonicalJson({
    actorId: request.principal?.userId ?? null,
    body: request.body ?? null,
    path: request.url,
  }),
)

return \`\${FINGERPRINT_VERSION}:\${fingerprint}\`
`

const OPT_OUT = `
@Post('refresh')
@Public()
@DisableIdempotency()
refresh(@Req() request: Request) {
  return this.auth.refresh(request.cookies.refresh)
}
`

export function IdempotencyNote() {
	return (
		<NoteLayout
			date='Nov 18, 2026'
			readTime='7 min read'
			title={
				<>
					Idempotency keys,{' '}
					<span className='highlight'>on by default.</span>
				</>
			}
			lead='How we flipped idempotency from opt-in to opt-out across a NestJS API, and the one route where “safe by default” would have handed out someone else’s session.'
		>
			<p>
				A user taps <em>Submit application</em> on a train. The request reaches
				the server, the server creates the record, and the response dies in a
				tunnel. The app waits, gives up and sends the request again.
			</p>

			<RetryFigure />

			<p>
				The standard fix is an <strong>idempotency key</strong>. The client
				generates a unique key per action and sends it in a header. The server
				remembers what it answered for that key, and when the same key comes
				back, it returns the saved answer instead of doing the work twice.
			</p>
			<p>The idea is simple. All the interesting parts were in the details.</p>

			<h2>
				<span className='h-num'>01</span>Opt-in doesn’t scale
			</h2>
			<p>
				Our first version was opt-in: a route was protected only if someone put{' '}
				<code>@Idempotent()</code> on it. Eight controllers had it. Every other
				write route had nothing, and nothing reminded you to add it when you
				wrote a new one.
			</p>

			<DefaultsFigure />

			<p>
				The reviewer’s call was to turn it around. Every <code>POST</code>,{' '}
				<code>PUT</code>, <code>PATCH</code> and <code>DELETE</code> is protected
				by default, and a route has to say <code>@DisableIdempotency()</code> to
				opt out. A new route is safe without anyone remembering anything. The
				change in the interceptor itself was small:
			</p>

			<Code file='idempotency.interceptor.ts'>{GATE}</Code>

			<p>
				<code>getAllAndOverride</code> reads the decorator from the method first
				and the controller second, so you can opt out one route or a whole
				controller.
			</p>
			<p>
				Note the last line: a protected route still works without the header.
				“Protected by default” means the route is ready for a retry when the
				client asks for one, not that every call must carry a key.
			</p>

			<h2>
				<span className='h-num'>02</span>Reserve, then work
			</h2>
			<p>A request with a key goes through three steps:</p>
			<ol className='steps'>
				<li>
					<strong>Reserve.</strong> Insert a row with the key, the route, a
					fingerprint of the request and an empty status. The table has a unique
					constraint, so when two identical requests arrive at the same moment,
					only one insert wins.
				</li>
				<li>
					<strong>Work.</strong> The winner runs the handler.
				</li>
				<li>
					<strong>Complete or release.</strong> On success, save the status code
					and the response body into the row. On error, delete the row so the
					client can try again with the same key.
				</li>
			</ol>

			<RaceFigure />

			<p>
				The loser of the race reads the existing row and gets one of three
				answers: the saved response if the row is complete,{' '}
				<code>409 in progress</code> if it isn’t, and <code>409 key reused</code>{' '}
				if the key came with a different request.
			</p>

			<h2>
				<span className='h-num'>03</span>What goes into the fingerprint
			</h2>
			<p>
				The fingerprint is a SHA-256 of the actor, the concrete URL and the
				body, serialized as canonical JSON so that key order doesn’t matter.
			</p>

			<Code file='fingerprint.ts'>{FINGERPRINT}</Code>

			<p>
				Both the actor and the full URL matter. A route pattern like{' '}
				<code>/applications/:id/approve</code> is the same for every
				application, so without them one user’s key could return a receipt that
				belongs to someone else. Try it:
			</p>

			<FingerprintFigure />

			<p>
				The fingerprint also carries a version number. If the formula ever
				changes, rows hashed the old way can’t start matching new requests by
				accident.
			</p>

			<h2>
				<span className='h-num'>04</span>Where “safe by default” was dangerous
			</h2>
			<p>
				Flipping the default turned up the most interesting bug of the task,
				before it ever shipped.
			</p>
			<p>
				A replay restores the status and the body. It doesn’t restore headers,
				and the auth routes set the session in a <code>Set-Cookie</code> header.
				So a retried <code>login</code> would answer <code>200</code> with the
				session in the body but no cookie: the user sees “signed in” and isn’t.
			</p>
			<p>
				<code>refresh</code> was worse. It’s a public route with no body. With
				no session there’s no actor, and with no body the fingerprint is the
				same for every caller:
			</p>

			<RefreshFigure />

			<p>
				On its own this would be one risky route. Under a global default it
				becomes a rule: every future public <code>POST</code> without a body
				would carry the same hole. So the opt-outs became part of the change
				itself, not a follow-up ticket.
			</p>

			<Code file='auth.controller.ts'>{OPT_OUT}</Code>

			<p>
				<code>login</code>, <code>refresh</code>, <code>changePassword</code>{' '}
				and <code>confirmPasswordReset</code> opted out, and a test checks that
				two <code>refresh</code> calls with the same key both reach the handler.{' '}
				<code>logout</code> stayed protected because logging out twice is
				harmless. Password reset requests stayed protected on purpose: a retry
				must not send a second email.
			</p>

			<h2>
				<span className='h-num'>05</span>What I took away
			</h2>
			<ul className='takeaways'>
				<li>
					<strong>Defaults beat discipline.</strong> A protection that someone
					has to remember will eventually be forgotten.
				</li>
				<li>
					<strong>A global default changes what a bug means.</strong> The same
					edge case is a bug on one route and a vulnerability class across the
					API.
				</li>
				<li>
					<strong>Know what your replay leaves out.</strong> Saving the body is
					easy. Headers, cookies and side effects outside the database are where
					a replay stops being a copy of the original.
				</li>
			</ul>
		</NoteLayout>
	)
}
