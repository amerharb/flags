import { useEffect, useRef, useState } from 'react'
import { Language } from './countries/Country'
import { Theme, Settings } from './settingsStore'

const THEME_OPTIONS: { value: Theme, icon: string, name: string }[] = [
	{ value: 'system', icon: '🖥️', name: 'System' },
	{ value: 'light', icon: '☀️', name: 'Light' },
	{ value: 'dark', icon: '🌙', name: 'Dark' },
]

type Props = {
	settings: Settings,
	// full (beta-filtered) lists, so the checklists always show everything supported
	languages: { code: Language, display: string }[],
	countries: { code: string, flag: string }[],
	// true while flight-mode downloads are running
	caching: boolean,
	onChange: (settings: Settings) => void,
	onClear: () => void,
}

export default function SettingsPanel({ settings, languages, countries, caching, onChange, onClear }: Readonly<Props>) {
	const [open, setOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement | null>(null)

	// close the panel when clicking anywhere outside it
	useEffect(() => {
		if (!open) return
		const handleOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleOutside)
		return () => document.removeEventListener('mousedown', handleOutside)
	}, [open])

	const setTheme = (theme: Theme) => onChange({ ...settings, theme })

	const toggleLanguage = (code: Language) => {
		const hiddenLanguages = settings.hiddenLanguages.includes(code)
			? settings.hiddenLanguages.filter(c => c !== code)
			: [...settings.hiddenLanguages, code]
		onChange({ ...settings, hiddenLanguages })
	}

	const toggleCountry = (code: string) => {
		const hiddenCountries = settings.hiddenCountries.includes(code)
			? settings.hiddenCountries.filter(c => c !== code)
			: [...settings.hiddenCountries, code]
		onChange({ ...settings, hiddenCountries })
	}

	return (
		<div className="settings" ref={containerRef}>
			<button
				type="button"
				className={open ? 'settings-button open' : 'settings-button'}
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
						<div className="settings-segmented" role="group" aria-label="Theme">
							{THEME_OPTIONS.map(opt => (
								<button
									key={opt.value}
									type="button"
									className={settings.theme === opt.value ? 'segment selected' : 'segment'}
									aria-pressed={settings.theme === opt.value}
									aria-label={opt.name}
									title={opt.name}
									onClick={() => setTheme(opt.value)}
								>
									{opt.icon}
								</button>
							))}
						</div>
					</div>

					<div className="settings-row">
						<div className="settings-checklist" role="group" aria-label="Languages">
							{languages.map(l => {
								const shown = !settings.hiddenLanguages.includes(l.code)
								return (
									<label key={`setting-lang-${l.code}`} className="settings-check">
										<input
											type="checkbox"
											checked={shown}
											onChange={() => toggleLanguage(l.code)}
										/>
										{l.display}
									</label>
								)
							})}
						</div>
					</div>

					<div className="settings-row">
						<div className="settings-flag-grid" role="group" aria-label="Countries">
							{countries.map(c => {
								const shown = !settings.hiddenCountries.includes(c.code)
								return (
									<button
										key={`setting-country-${c.code}`}
										type="button"
										className={shown ? 'flag-toggle' : 'flag-toggle hidden'}
										aria-pressed={shown}
										onClick={() => toggleCountry(c.code)}
									>
										{c.flag}
									</button>
								)
							})}
						</div>
					</div>

					<button
						type="button"
						className={
							'settings-flight-mode'
							+ (settings.flightMode ? ' on' : '')
							+ (caching ? ' busy' : '')
						}
						aria-label="flight mode"
						aria-pressed={settings.flightMode}
						title="Flight mode: download all visible sounds"
						onClick={() => onChange({ ...settings, flightMode: !settings.flightMode })}
					>
						✈️
					</button>

					<button
						type="button"
						className="settings-clear"
						aria-label="Clear settings"
						title="Clear settings: delete all saved settings and reset to default"
						onClick={onClear}
					>
						🔄
					</button>
				</div>
			)}
		</div>
	)
}
