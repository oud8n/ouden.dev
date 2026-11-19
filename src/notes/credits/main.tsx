import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../App.scss'
import '../note.scss'
import { CreditsNote } from './CreditsNote'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<CreditsNote />
	</StrictMode>,
)
