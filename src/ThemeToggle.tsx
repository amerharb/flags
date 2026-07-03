import { useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'

const ORDER: Theme[] = ['system', 'light', 'dark']
const LABEL: Record<Theme, string> = {
	system: '🖥️ System',
	light: '☀️ Light',
	dark: '🌙 Dark',
}

function applyTheme(theme: Theme) {
	const root = document.documentElement
	if (theme === 'system') {
		root.removeAttribute('data-theme')
	} else {
		root.setAttribute('data-theme', theme)
	}
}

export default function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>('system')

	// Sync the button label with the value the no-flash script already applied.
	useEffect(() => {
		const stored = localStorage.getItem('theme')
		if (stored === 'light' || stored === 'dark' || stored === 'system') {
			setTheme(stored)
		}
	}, [])

	const cycle = () => {
		const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]
		setTheme(next)
		try {
			localStorage.setItem('theme', next)
		} catch {
			// localStorage may be unavailable (e.g. private mode); theme still applies for the session.
		}
		applyTheme(next)
	}

	return (
		<button
			type="button"
			onClick={cycle}
			title="Toggle color theme"
			aria-label={`Color theme: ${theme}. Click to change.`}
			style={{
				position: 'fixed',
				top: '10px',
				right: '10px',
				padding: '6px 10px',
				borderRadius: '6px',
				fontSize: '16px',
				cursor: 'pointer',
				zIndex: 1000,
				width: 'auto',
				margin: 0,
			}}
		>
			{LABEL[theme]}
		</button>
	)
}
