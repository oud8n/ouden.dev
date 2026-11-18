import {
	ABOUT_FACTS,
	CONTACTS,
	GITHUB_URL,
	NOTES,
	PROJECTS,
} from '../data/content'

export type Line = { kind: 'in' | 'out' | 'err' | 'ok'; text: string }

export type Effects = {
	open: (url: string) => void
	toggleTheme: () => void
	clear: () => void
	close: () => void
}

const BASE = import.meta.env.BASE_URL
const EMAIL = CONTACTS.find(c => c.id === 'email')?.url ?? ''

const FILES: Record<string, string[]> = {
	'about.txt': [
		'Fullstack developer in the Netherlands, working remotely.',
		'TypeScript and Go. Client products at Taskforce, my own on the side.',
		'Mostly reliability and reuse: safe retries, race fixes, shared building blocks.',
	],
	'stack.txt': [
		'languages  Go, TypeScript, JavaScript, Python',
		'frontend   React, Next.js, Vue, Angular, Tailwind, SCSS',
		'backend    NestJS, Node.js, PostgreSQL, Prisma, Redis, SQLite',
		'desktop    Wails, Tauri',
	],
	'cv.pdf': ['binary file. try: cv'],
	'.secret': ['the 8 in oud8n is red on purpose.'],
}

const HELP = [
	'about        who I am',
	'projects     what I’ve built',
	'notes        what I’ve written',
	'contact      how to reach me',
	'cv           open my CV',
	'github       open my GitHub',
	'ls, cat      look around',
	'theme        light ↔ dark',
	'clear, exit  the usual',
]

export const COMMANDS = [
	'help',
	'about',
	'whoami',
	'projects',
	'notes',
	'contact',
	'email',
	'cv',
	'github',
	'ls',
	'cat',
	'theme',
	'clear',
	'exit',
	'sudo',
	'echo',
	'date',
	'rm',
]

const out = (...text: string[]): Line[] => text.map(t => ({ kind: 'out', text: t }))

function about(): Line[] {
	return out(
		...FILES['about.txt'],
		'',
		...ABOUT_FACTS.map(f => `${f.key.padEnd(10)} ${f.value}`),
	)
}

function projects(): Line[] {
	return out(
		...PROJECTS.flatMap(p => [
			`${p.name.padEnd(12)} ${p.status ?? p.url?.replace('https://', '') ?? ''}`,
			`${''.padEnd(12)} ${p.tags.join(' · ')}`,
		]),
	)
}

function notes(effects: Effects, args: string[]): Line[] {
	const target = NOTES[Number(args[0]) - 1]
	if (target) {
		effects.open(`${BASE}notes/${target.slug}/`)
		return [{ kind: 'ok', text: `opening “${target.title}”…` }]
	}
	return [
		...out(...NOTES.map((n, i) => `${i + 1}  ${n.title}  (${n.readTime})`)),
		...out('', 'open one with: notes 1'),
	]
}

function cat(args: string[]): Line[] {
	const name = args[0]
	if (!name) return [{ kind: 'err', text: 'usage: cat <file>' }]
	const file = FILES[name]
	if (!file) return [{ kind: 'err', text: `cat: ${name}: no such file` }]
	return out(...file)
}

function sudo(effects: Effects, args: string[]): Line[] {
	if (args.join(' ') === 'hire oud8n') {
		effects.open(EMAIL)
		return [
			{ kind: 'ok', text: '[sudo] password for recruiter: ********' },
			{ kind: 'ok', text: 'permission granted. opening mail…' },
		]
	}
	return [{ kind: 'err', text: 'nice try. maybe: sudo hire oud8n' }]
}

export function run(input: string, effects: Effects): Line[] {
	const [cmd = '', ...args] = input.trim().split(/\s+/)
	const handlers: Record<string, () => Line[]> = {
		'': () => [],
		help: () => out(...HELP),
		about,
		whoami: () => out('recruiter, probably. hi 👋'),
		projects,
		notes: () => notes(effects, args),
		contact: () =>
			out(...CONTACTS.map(c => `${c.name.toLowerCase().padEnd(10)} ${c.handle}`)),
		email: () => {
			effects.open(EMAIL)
			return [{ kind: 'ok', text: 'opening mail…' }]
		},
		cv: () => {
			effects.open(`${BASE}cv.pdf`)
			return [{ kind: 'ok', text: 'opening cv.pdf…' }]
		},
		github: () => {
			effects.open(GITHUB_URL)
			return [{ kind: 'ok', text: 'opening github.com/oud8n…' }]
		},
		ls: () => out(Object.keys(FILES).filter(f => args[0] === '-a' || !f.startsWith('.')).join('  ')),
		cat: () => cat(args),
		theme: () => {
			effects.toggleTheme()
			return [{ kind: 'ok', text: 'theme switched.' }]
		},
		clear: () => {
			effects.clear()
			return []
		},
		exit: () => {
			effects.close()
			return []
		},
		sudo: () => sudo(effects, args),
		echo: () => out(args.join(' ')),
		date: () => out(new Date().toString()),
		rm: () => [{ kind: 'err', text: 'rm: permission denied. this site stays.' }],
	}
	const handler = handlers[cmd]
	if (!handler) return [{ kind: 'err', text: `command not found: ${cmd}. try help` }]
	return handler()
}
