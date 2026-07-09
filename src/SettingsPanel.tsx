import { useEffect, useState } from 'react'
import {
	Theme,
	Settings,
	DEFAULT_SETTINGS,
	loadSettings,
	saveSettings,
	clearSettings,
	applyTheme,
} from './settingsStore'

const THEME_OPTIONS: { value: Theme, label: string }[] = [
	{ value: 'system', label: '🖥️ System' },
	{ value: 'light', label: '☀️ Light' },
	{ value: 'dark', label: '🌙 Dark' },
]

export default function SettingsPanel() {
	const [open, setOpen] = useState(false)
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

	// Load persisted settings after mount and sync the applied theme.
	useEffect(() => {
		const loaded = loadSettings()
		setSettings(loaded)
		applyTheme(loaded.theme)
	}, [])

	const setTheme = (theme: Theme) => {
		const next = { ...settings, theme }
		setSettings(next)
		saveSettings(next)
		applyTheme(theme)
	}

	const handleClear = () => {
		clearSettings()
		setSettings(DEFAULT_SETTINGS)
		applyTheme(DEFAULT_SETTINGS.theme)
	}

	return (
		<div className="settings">
			<button
				type="button"
				className="settings-button"
				aria-label="Settings"
				aria-expanded={open}
				title="Settings"
				onClick={() => setOpen(o => !o)}
			>
				⚙️
			</button>

			{open && (
				<div className="settings-panel" role="dialog" aria-label="Settings">
					<div className="settings-row">
						<span className="settings-label">Dark Mode</span>
						<div className="settings-segmented" role="group" aria-label="Dark Mode">
							{THEME_OPTIONS.map(opt => (
								<button
									key={opt.value}
									type="button"
									className={settings.theme === opt.value ? 'segment selected' : 'segment'}
									aria-pressed={settings.theme === opt.value}
									onClick={() => setTheme(opt.value)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					<button type="button" className="settings-clear" onClick={handleClear}>
						Clear settings
					</button>
				</div>
			)}
		</div>
	)
}
