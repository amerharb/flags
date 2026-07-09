import { useEffect, useRef, useState } from 'react'
import { Language } from './countries/Country'
import { Theme, Settings } from './settingsStore'

const THEME_OPTIONS: { value: Theme, label: string }[] = [
	{ value: 'system', label: '🖥️ System' },
	{ value: 'light', label: '☀️ Light' },
	{ value: 'dark', label: '🌙 Dark' },
]

type Props = {
	settings: Settings,
	// full (beta-filtered) lists, so the checklists always show everything supported
	languages: { code: Language, display: string }[],
	countries: { code: string, flag: string, display: string }[],
	onChange: (settings: Settings) => void,
	onClear: () => void,
}

export default function SettingsPanel({ settings, languages, countries, onChange, onClear }: Props) {
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

	const visibleLanguageCount = languages.filter(l => !settings.hiddenLanguages.includes(l.code)).length
	const visibleCountryCount = countries.filter(c => !settings.hiddenCountries.includes(c.code)).length

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

					<div className="settings-row">
						<span className="settings-label">Languages</span>
						<div className="settings-checklist">
							{languages.map(l => {
								const shown = !settings.hiddenLanguages.includes(l.code)
								return (
									<label key={`setting-lang-${l.code}`} className="settings-check">
										<input
											type="checkbox"
											checked={shown}
											// keep at least one language visible
											disabled={shown && visibleLanguageCount === 1}
											onChange={() => toggleLanguage(l.code)}
										/>
										{l.display}
									</label>
								)
							})}
						</div>
					</div>

					<div className="settings-row">
						<span className="settings-label">Countries</span>
						<div className="settings-checklist">
							{countries.map(c => {
								const shown = !settings.hiddenCountries.includes(c.code)
								return (
									<label key={`setting-country-${c.code}`} className="settings-check">
										<input
											type="checkbox"
											checked={shown}
											// keep at least one country visible
											disabled={shown && visibleCountryCount === 1}
											onChange={() => toggleCountry(c.code)}
										/>
										{c.flag} {c.display}
									</label>
								)
							})}
						</div>
					</div>

					<button type="button" className="settings-clear" onClick={onClear}>
						Clear settings
					</button>
				</div>
			)}
		</div>
	)
}
