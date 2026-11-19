import {
	EmailIcon,
	DiscordIcon,
	GithubIcon,
	TelegramIcon,
} from '../components/icons'

export const NAV_ITEMS = [
	{ id: 'about', num: '01', label: 'about' },
	{ id: 'stack', num: '02', label: 'stack' },
	{ id: 'experience', num: '03', label: 'experience' },
	{ id: 'projects', num: '04', label: 'projects' },
	{ id: 'notes', num: '05', label: 'notes' },
	{ id: 'contact', num: '06', label: 'contact' },
]

export const NOTES_UPCOMING = [
	{
		title: 'The race condition in my login rate limiter',
		status: 'next',
		pitch:
			'Read, check, increment: how parallel sign-in attempts slipped past the limit, and why trusting X-Forwarded-For lets an attacker pick their own IP.',
	},
	{
		title: 'SQLITE_BUSY and a desktop app that writes from three places',
		status: 'planned',
		pitch:
			'chronly writes from the tracker, the tray and the UI at once. WAL mode, busy_timeout and an idle detector with a fallback chain.',
	},
	{
		title: 'Importing a problem bank that wasn’t built to be imported',
		status: 'planned',
		pitch:
			'windows-1251 pages, TLS quirks, imports that resume where they stopped and answers checked against the source’s own solver.',
	},
	{
		title: 'Refactoring forms without changing a pixel',
		status: 'planned',
		pitch:
			'A config-driven form generator that replaced hand-built forms while keeping the markup and every value write exactly as before.',
	},
]

export const NOTES = [
	{
		slug: 'credits',
		date: 'Nov 19, 2026',
		readTime: '8 min',
		title: 'Credits without a mutex: let PostgreSQL count the money',
		summary:
			'How physics.ai stopped double-spending credits: a read-check-write race, a mutex that only covers one process, and the single conditional UPDATE that replaced it. Plus rewards paid exactly once with FOR UPDATE and ON CONFLICT. With interactive diagrams.',
		tags: ['PostgreSQL', 'Go', 'physics.ai'],
	},
	{
		slug: 'llm-physics',
		date: 'Nov 19, 2026',
		readTime: '9 min',
		title: 'Don’t trust the generator: self-checking physics problems',
		summary:
			'How physics.ai checks every LLM-generated exam problem before a student sees it: a formula the server can run, a blind solve by a second model, an examiner with a rubric and a 20-second fallback. With interactive diagrams.',
		tags: ['LLM', 'Go', 'physics.ai'],
	},
	{
		slug: 'idempotency',
		date: 'Nov 18, 2026',
		readTime: '7 min',
		title: 'Idempotency keys, on by default',
		summary:
			'Flipping idempotency from opt-in to opt-out across a NestJS API, and the one route where “safe by default” would have handed out someone else’s session. With interactive diagrams.',
		tags: ['NestJS', 'API design', 'security'],
	},
]

export const STACK_CHAPTERS = [
	{
		title: 'languages',
		desc: 'What I write code in.',
		tools: [
			{ slug: 'go', name: 'Go' },
			{ slug: 'typescript', name: 'TypeScript' },
			{ slug: 'javascript', name: 'JavaScript' },
			{ slug: 'python', name: 'Python' },
		],
	},
	{
		title: 'frontend',
		desc: 'Interfaces and client-side logic.',
		tools: [
			{ slug: 'react', name: 'React' },
			{ slug: 'nextdotjs', name: 'Next.js' },
			{ slug: 'vuedotjs', name: 'Vue' },
			{ slug: 'angular', name: 'Angular' },
			{ slug: 'tailwindcss', name: 'Tailwind' },
			{ slug: 'sass', name: 'SCSS' },
			{ slug: 'vite', name: 'Vite' },
		],
	},
	{
		title: 'backend & data',
		desc: 'APIs, data and storage.',
		tools: [
			{ slug: 'nestjs', name: 'NestJS' },
			{ slug: 'nodedotjs', name: 'Node.js' },
			{ slug: 'postgresql', name: 'PostgreSQL' },
			{ slug: 'prisma', name: 'Prisma' },
			{ slug: 'redis', name: 'Redis' },
			{ slug: 'mysql', name: 'MySQL' },
			{ slug: 'sqlite', name: 'SQLite' },
		],
	},
	{
		title: 'desktop',
		desc: 'Native apps with a web frontend.',
		tools: [
			{ slug: 'wails', name: 'Wails' },
			{ slug: 'tauri', name: 'Tauri' },
		],
	},
	{
		title: 'tools',
		desc: 'Environment, testing and API work.',
		tools: [
			{ slug: 'linux', name: 'Linux' },
			{ slug: 'docker', name: 'Docker' },
			{ slug: 'git', name: 'Git' },
			{ slug: 'swagger', name: 'Swagger' },
			{ slug: 'postman', name: 'Postman' },
			{ slug: 'vitest', name: 'Vitest' },
		],
	},
]

export const ABOUT_FACTS = [
	{ key: 'role', value: 'fullstack developer' },
	{ key: 'timezone', value: 'CET (Netherlands)' },
	{ key: 'languages', value: 'English, Russian' },
	{ key: 'open to', value: 'remote · full-time / contract' },
]

export type ExperienceTag = { label: string; url?: string }

export const EXPERIENCE_ITEMS: {
	year: string
	title: string
	desc: string
	points?: string[]
	tags: ExperienceTag[]
}[] = [
	{
		year: 'Jul 2026 — now',
		title: 'Fullstack developer',
		desc: '[Taskforce](https://taskforce.now/) is a full-cycle engineering team building products for clients. I work across the stack. On [Flip Flow](https://flipflow.fund/), a platform for US fix & flip real estate investments, my work is mostly about making things reliable and reusable rather than writing them from scratch:',
		points: [
			'Idempotency keys for every write request through one global interceptor, so a retried request never creates a duplicate.',
			'Rate limiting and brute-force protection on sign-in, including a fix for a race condition in login throttling.',
			'Idle-session expiry with a scheduled cleanup job.',
			'A config-driven form generator that now powers investor and operator applications and sign-in.',
			'The investor admission flow: jurisdiction and accreditation steps, with refusals routed to manual review.',
		],
		tags: [
			{ label: 'Taskforce', url: 'https://taskforce.now/' },
			{ label: 'Flip Flow', url: 'https://flipflow.fund/' },
		],
	},
	{
		year: 'ongoing',
		title: 'Own products',
		desc: 'Alongside client work I build my own: physics.ai, a physics exam prep platform I lead, and chronly, a desktop time tracker. Both have Go backends. A few things from under the hood:',
		points: [
			'physics.ai: a resumable importer for the official FIPI bank that handles windows-1251 pages and FIPI\'s TLS quirks, stays polite with rate limits, takes turns between the EGE and OGE banks and checks answers against FIPI\'s own solver.',
			'physics.ai: credits charged atomically in PostgreSQL instead of behind a mutex, and logs kept clean of passwords, emails, IPs and student answers.',
			'physics.ai: MathJax and TikZJax served from our own server instead of third-party CDNs, with formulas that render on older iPhones too.',
			'chronly: idle detection with a fallback chain, from the Wayland idle protocol down to raw evdev input when it is missing.',
			'chronly: SQLite in WAL mode with a busy timeout, which ended SQLITE_BUSY errors under concurrent writes.',
			'chronly: the whole UI re-themes live from the wallpaper palette via matugen, with real app icons, a tray menu and a Ctrl+K command palette.',
		],
		tags: [],
	},
]

export type Project = {
	name: string
	desc: string
	tags: string[]
	url?: string
	image?: string
	asciiLogo?: { text: string; accent: string }
	status?: string
}

export const PROJECTS: Project[] = [
	{
		name: 'physics.ai',
		status: 'launching Jan 2027',
		image: 'projects/physics-ai.webp',
		desc: 'My EdTech platform for Russia\'s national high-school physics exams (EGE/OGE). An LLM generates fresh problems, and each one is solved again blind with its answer checked on the server before a student sees it. Alongside: the official problem bank, instant answer checks with hints, teacher classes and progress by topic.',
		tags: ['Go', 'PostgreSQL', 'Next.js', 'TypeScript', 'LLM'],
	},
	{
		name: 'chronly',
		url: 'https://github.com/oud8n/chronly',
		image: 'projects/chronly.webp',
		desc: 'A desktop time tracker for Hyprland that I built for myself. It watches the active window in the background and sorts the time into projects on its own. Everything stays local in SQLite.',
		tags: ['Go', 'Wails', 'React', 'SQLite'],
	},
	{
		name: 'this site',
		asciiLogo: { text: 'oud8n', accent: '8' },
		url: 'https://github.com/oud8n/ouden.dev',
		desc: 'Built from scratch with no UI libraries, including the marquee, the ASCII banner and the spinning donut. Open source.',
		tags: ['React', 'TypeScript', 'Vite'],
	},
]

const GITHUB_HANDLE = 'oud8n'
export const GITHUB_URL = `https://github.com/${GITHUB_HANDLE}`
const TELEGRAM_HANDLE = '@oud8n'
export const TELEGRAM_URL = 'https://t.me/oud8n'
const EMAIL_HANDLE = 'skipyy1@proton.me'
const EMAIL_URL = `mailto:${EMAIL_HANDLE}`
const DISCORD_HANDLE = 'socoolbaby'
const DISCORD_URL = 'https://discord.gg/VKqSreqpHw'

export const CONTACTS = [
	{
		id: 'telegram',
		name: 'Telegram',
		sub: 'fastest reply',
		handle: TELEGRAM_HANDLE,
		url: TELEGRAM_URL,
		Icon: TelegramIcon,
		inFooter: true,
	},
	{
		id: 'github',
		name: 'GitHub',
		sub: 'code',
		handle: GITHUB_HANDLE,
		url: GITHUB_URL,
		Icon: GithubIcon,
		inFooter: true,
	},
	{
		id: 'discord',
		name: 'Discord',
		sub: 'server',
		handle: DISCORD_HANDLE,
		url: DISCORD_URL,
		Icon: DiscordIcon,
		inFooter: true,
	},
	{
		id: 'email',
		name: 'Email',
		sub: 'work inquiries',
		handle: EMAIL_HANDLE,
		url: EMAIL_URL,
		Icon: EmailIcon,
		inFooter: true,
	},
]

export const GITHUB_REPOS_URL = `${GITHUB_URL}?tab=repositories`
