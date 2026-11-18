import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../App.scss'
import '../note.scss'
import { LlmNote } from './LlmNote'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<LlmNote />
	</StrictMode>,
)
