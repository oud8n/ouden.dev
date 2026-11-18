import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../App.scss'
import '../note.scss'
import { IdempotencyNote } from './IdempotencyNote'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<IdempotencyNote />
	</StrictMode>,
)
