/*
 * User settings, persisted in localStorage (not cookies: this is a front-end
 * only app, so there's no server that needs them, and localStorage avoids
 * sending the data on every request). Stored as one JSON blob under STORAGE_KEY
 * so new settings can be added over time without new storage keys.
 */
import { Language } from './countries/Country'

export type Theme = 'system' | 'light' | 'dark'

export type Settings = {
	theme: Theme,
	// codes the user chose to hide from the main screen; empty = show everything,
	// so newly added languages/countries are visible by default
	hiddenLanguages: Language[],
	hiddenCountries: string[],
	// when on, all visible sounds are downloaded to the cache, and newly shown
	// languages/countries are cached as soon as they are enabled
	flightMode: boolean,
}

export const DEFAULT_SETTINGS: Settings = {
	theme: 'system',
	hiddenLanguages: [],
	hiddenCountries: [],
	flightMode: false,
}

const STORAGE_KEY = 'flags:settings'

export function loadSettings(): Settings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
		}
		// migrate the old standalone theme key, if present
		const legacyTheme = localStorage.getItem('theme')
		if (legacyTheme === 'light' || legacyTheme === 'dark' || legacyTheme === 'system') {
			return { ...DEFAULT_SETTINGS, theme: legacyTheme }
		}
	} catch {
		// localStorage may be unavailable (e.g. private mode); fall back to defaults
	}
	return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: Settings): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
	} catch {
		// ignore: settings still apply for the current session
	}
}

// Drive the CSS `color-scheme` via the data-theme attribute on <html>.
export function applyTheme(theme: Theme): void {
	const root = document.documentElement
	if (theme === 'system') {
		root.removeAttribute('data-theme')
	} else {
		root.setAttribute('data-theme', theme)
	}
}
