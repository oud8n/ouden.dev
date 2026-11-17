import {
	DiscordIcon,
	GithubIcon,
	TelegramIcon,
} from '../components/icons'

export const NAV_ITEMS = [
	{ id: 'about', num: '01', label: 'about' },
	{ id: 'stack', num: '02', label: 'stack' },
	{ id: 'experience', num: '03', label: 'experience' },
	{ id: 'projects', num: '04', label: 'projects' },
	{ id: 'contact', num: '05', label: 'contact' },
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
	{ key: 'base', value: 'Netherlands · remote' },
	{ key: 'stack', value: 'Go, TypeScript, React' },
	{ key: 'now', value: 'Flip Flow at Task Force · физика.ai · chronly' },
]

export const EXPERIENCE_ITEMS = [
	{
		year: 'Jul 2026 — now',
		title: 'Fullstack developer',
		desc: 'Full-cycle engineering team building products for clients. I work across the stack. On Flip Flow, a platform for US fix & flip real estate investments, I built backend features in NestJS and investor-facing pages in TypeScript and React.',
		tags: ['Task Force'],
	},
	{
		year: 'ongoing',
		title: 'Own products',
		desc: 'Alongside client work I build my own: физика.ai, a physics exam prep platform I lead, and chronly, a desktop time tracker. Both have Go backends.',
		tags: [],
	},
]

export type Project = {
	name: string
	desc: string
	tags: string[]
	url?: string
	image?: string
	status?: string
}

export const PROJECTS: Project[] = [
	{
		name: 'физика.ai',
		status: 'in development',
		image: 'projects/physics-ai.webp',
		desc: 'My own project: physics exam prep for the EGE and OGE. Problems from the open FIPI bank plus fresh ones for every exam task, instant answer checks with hints, and stats that show which topics are lagging. I lead the project.',
		tags: ['Go', 'PostgreSQL', 'Next.js', 'TypeScript', 'DeepSeek'],
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
		url: 'https://github.com/skipydev/skipy.dev',
		desc: 'The marquee, the ASCII banner and the donut are hand-written, no UI libraries. Open source.',
		tags: ['React', 'TypeScript', 'Vite'],
	},
]

const GITHUB_HANDLE = 'oud8n'
export const GITHUB_URL = `https://github.com/${GITHUB_HANDLE}`
const TELEGRAM_HANDLE = '@oud8n'
export const TELEGRAM_URL = 'https://t.me/oud8n'
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
]

export const GITHUB_REPOS_URL = `${GITHUB_URL}?tab=repositories`
