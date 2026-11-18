import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../App.scss'
import '../note.scss'
import { NotesIndex } from './NotesIndex'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<NotesIndex />
	</StrictMode>,
)
