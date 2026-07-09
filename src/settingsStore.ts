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
}

export const DEFAULT_SETTINGS: Settings = {
	theme: 'system',
	hiddenLanguages: [],
	hiddenCountries: [],
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

// Wipe all persisted settings (and any cookies) so the next load is a clean default.
export function clearSettings(): void {
	try {
		localStorage.removeItem(STORAGE_KEY)
		localStorage.removeItem('theme') // legacy key
	} catch {
		// ignore
	}
	// expire any cookies this site may hold
	document.cookie.split(';').forEach(cookie => {
		const name = cookie.split('=')[0].trim()
		if (name) {
			document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
		}
	})
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
