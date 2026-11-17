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
			{ slug: 'typescript', name: 'TypeScript' },
			{ slug: 'javascript', name: 'JavaScript' },
			{ slug: 'python', name: 'Python' },
			{ slug: 'go', name: 'Go' },
		],
	},
	{
		title: 'frontend',
		desc: 'Interfaces and client-side logic.',
		tools: [
			{ slug: 'react', name: 'React' },
			{ slug: 'nextdotjs', name: 'Next.js' },
			{ slug: 'tailwindcss', name: 'Tailwind' },
			{ slug: 'html5', name: 'HTML5' },
			{ slug: 'vite', name: 'Vite' },
		],
	},
	{
		title: 'backend & data',
		desc: 'Architecture, APIs and data handling.',
		tools: [
			{ slug: 'nestjs', name: 'NestJS' },
			{ slug: 'nodedotjs', name: 'Node.js' },
			{ slug: 'postgresql', name: 'PostgreSQL' },
			{ slug: 'prisma', name: 'Prisma' },
			{ slug: 'redis', name: 'Redis' },
			{ slug: 'mysql', name: 'MySQL' },
		],
	},
	{
		title: 'infra & devops',
		desc: 'Environment and deployment.',
		tools: [
			{ slug: 'linux', name: 'Linux' },
			{ slug: 'docker', name: 'Docker' },
			{ slug: 'git', name: 'Git' },
			{ slug: 'nginx', name: 'Nginx' },
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
		year: '2026 — Present',
		title: 'Production Code',
		desc: 'Backend intern at TASKFORCE, a team that builds websites. Debugging live issues, going through code review with senior developers, tracking down slow code and missing error handling.',
		tags: ['TASKFORCE'],
	},
	{
		year: 'Ongoing',
		title: 'Linux & Systems',
		desc: 'CachyOS as my daily system. Knowing what happens at the OS level pays off when debugging and deploying. Working through HackTheBox machines on the side.',
		tags: ['HackTheBox + Linux deep dives'],
	},
	{
		year: 'In progress',
		title: 'Fundamentals & Algorithms',
		desc: 'Preparing for ITMO University: algorithms, data structures, complexity analysis. Learning C++ along the way.',
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
		desc: 'Physics prep for the EGE and OGE. Problems from the open FIPI bank plus fresh ones for every exam task; answers are checked right away, three attempts with a hint, and the stats show which topics are lagging. Next.js frontend, Go backend with DeepSeek.',
		tags: ['Next.js', 'TypeScript', 'Go', 'DeepSeek'],
	},
	{
		name: 'chronly',
		url: 'https://github.com/skipy-force/chronly',
		image: 'projects/chronly.webp',
		desc: 'Desktop time tracker for Hyprland. Watches the active window in the background and sorts the time into projects on its own: a Today dashboard, a timeline, estimate vs. actual per task. Everything stays local in SQLite.',
		tags: ['Go', 'Wails', 'React', 'SQLite'],
	},
	{
		name: 'skipy.dev',
		url: 'https://github.com/skipydev/skipy.dev',
		desc: "This site. The marquee, the ASCII banner and the donut are hand-written, no UI libraries. Open source, take whatever's useful.",
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
