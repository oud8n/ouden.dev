import {
	DiscordIcon,
	EmailIcon,
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

export const ABOUT_PRINCIPLES = [
	{ n: '01', text: 'Understand the code you write' },
	{ n: '02', text: 'Test before you ship' },
	{ n: '03', text: 'Performance matters' },
	{ n: '04', text: 'Read the docs first' },
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

export const PROJECTS = [
	{
		name: 'skipy.dev',
		url: 'https://github.com/skipydev/skipy.dev',
		desc: "This site. The terminal windows, the marquee and the ASCII donut are hand-written, no UI libraries. Open source, take whatever's useful.",
		tags: ['React', 'TypeScript', 'Vite'],
	},
	{
		name: 'chronly',
		url: 'https://github.com/skipy-force/chronly',
		desc: 'Desktop time tracker for Hyprland. Watches the active window in the background and sorts the time into projects on its own: a Today dashboard, a timeline, estimate vs. actual per task. Everything stays local in SQLite.',
		tags: ['Go', 'Wails', 'React', 'SQLite'],
	},
]

const GITHUB_HANDLE = 'skipydev'
export const GITHUB_URL = `https://github.com/${GITHUB_HANDLE}`
const TELEGRAM_HANDLE = '@PACCBET_3A_CEBEPOM'
export const TELEGRAM_URL = 'https://t.me/PACCBET_3A_CEBEPOM'
const DISCORD_HANDLE = 'socoolbaby'
const DISCORD_URL = 'https://discord.gg/VKqSreqpHw'
const EMAIL_HANDLE = 'hello@skipy.dev'
const EMAIL_URL = `mailto:${EMAIL_HANDLE}`

export const CONTACTS = [
	{
		id: 'telegram',
		name: 'Telegram',
		sub: 'fastest',
		handle: TELEGRAM_HANDLE,
		url: TELEGRAM_URL,
		Icon: TelegramIcon,
		inFooter: true,
	},
	{
		id: 'github',
		name: 'GitHub',
		sub: 'code stuff',
		handle: GITHUB_HANDLE,
		url: GITHUB_URL,
		Icon: GithubIcon,
		inFooter: true,
	},
	{
		id: 'discord',
		name: 'Discord',
		sub: 'longer conversations',
		handle: DISCORD_HANDLE,
		url: DISCORD_URL,
		Icon: DiscordIcon,
		inFooter: true,
	},
	{
		id: 'email',
		name: 'Email',
		sub: 'formal inquiries',
		handle: EMAIL_HANDLE,
		url: EMAIL_URL,
		Icon: EmailIcon,
		inFooter: false,
	},
]

export const GITHUB_REPOS_URL = `${GITHUB_URL}?tab=repositories`
