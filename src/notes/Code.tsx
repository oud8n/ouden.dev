import type { ReactNode } from 'react'

const TOKEN =
	/('[^']*'|`[^`]*`|"[^"\n]*")|\b(const|if|return|new|await|async|function|export|import|from|func|var|SELECT|DELETE|FROM|WHERE|ORDER|BY|LIMIT|FOR|UPDATE|SKIP|LOCKED|RETURNING)\b|\b(true|false|null|undefined|nil)\b|(\/\/.*$)|(@\w+)|(\b[A-Za-z_]\w*(?=\())/gm

const KINDS = ['str', 'kw', 'lit', 'com', 'dec', 'fn']

function highlight(source: string): ReactNode[] {
	const nodes: ReactNode[] = []
	let last = 0
	for (const m of source.matchAll(TOKEN)) {
		const index = m.index ?? 0
		nodes.push(source.slice(last, index))
		const kind = KINDS[m.slice(1).findIndex(Boolean)]
		nodes.push(
			<span key={index} className={`tok-${kind}`}>
				{m[0]}
			</span>,
		)
		last = index + m[0].length
	}
	nodes.push(source.slice(last))
	return nodes
}

export function Code({ children, file }: { children: string; file?: string }) {
	return (
		<div className='code'>
			{file && <div className='code-file'>{file}</div>}
			<pre>
				<code>{highlight(children.trim())}</code>
			</pre>
		</div>
	)
}
