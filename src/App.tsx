import './App.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import SettingsPanel from './SettingsPanel'
import { Country, Language } from './countries/Country'
import { isVisible } from './featureFlags'
import {
	Settings,
	DEFAULT_SETTINGS,
	loadSettings,
	saveSettings,
	clearSettings,
	applyTheme,
} from './settingsStore'
import { al } from './countries/al'
import { de } from './countries/de'
import { dk } from './countries/dk'
import { ir } from './countries/ir'
import { ps } from './countries/ps'
import { pt } from './countries/pt'
import { se } from './countries/se'
import { sy } from './countries/sy'
import { tn } from './countries/tn'
import { tr } from './countries/tr'
import { ua } from './countries/ua'
import { us } from './countries/us'

function App() {
	// everything the build supports (after the beta feature flag)
	const ALL_COUNTRIES: Country[] = [al, de, dk, ir, ps, pt, se, sy, tn, tr, ua, us].filter(isVisible)
	const LANGUAGE_DEFS: { code: Language, display: string, beta?: boolean }[] = [
		{ code: 'sq', display: 'Shqip' },
		{ code: 'ar', display: 'عربي' },
		{ code: 'da', display: 'Dansk' },
		{ code: 'en', display: 'English' },
		{ code: 'de', display: 'Deutsch' },
		{ code: 'fa', display: 'فارسی' },
		{ code: 'pt', display: 'Português' },
		{ code: 'sv', display: 'Svenska' },
		{ code: 'tr', display: 'Türkçe' },
		{ code: 'uk', display: 'Українська' },
		{ code: 'xa', display: '🎺' },
		{ code: 'xt', display: '🎹', beta: true },
	]
	const ALL_LANGUAGES = LANGUAGE_DEFS.filter(isVisible)

	// user settings (theme + which languages/countries to show on the main screen)
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
	useEffect(() => {
		const loaded = loadSettings()
		setSettings(loaded)
		applyTheme(loaded.theme)
	}, [])
	const updateSettings = (next: Settings) => {
		// stop playback when its country, or the selected language, just got hidden —
		// otherwise the sound would keep playing with no button left to stop it
		if (
			(playingCode && next.hiddenCountries.includes(playingCode)) ||
			next.hiddenLanguages.includes(lang)
		) {
			stopSound()
		}

		// flight mode: download what is (or becomes) visible
		const visibleLangs = ALL_LANGUAGES.filter(l => !next.hiddenLanguages.includes(l.code))
		const visibleCountries = ALL_COUNTRIES.filter(c => !next.hiddenCountries.includes(c.code))
		const urlsFor = (langs: typeof visibleLangs, countries: typeof visibleCountries) =>
			langs.flatMap(l => countries.map(c => `/sounds/${l.code}/${c.code}.aac`))
		if (next.flightMode && !settings.flightMode) {
			// just switched on: cache everything currently visible
			cacheAudioUrls(urlsFor(visibleLangs, visibleCountries))
		} else if (next.flightMode) {
			// already on: cache only what just became visible
			const newLangs = visibleLangs.filter(l => settings.hiddenLanguages.includes(l.code))
			const newCountries = visibleCountries.filter(c => settings.hiddenCountries.includes(c.code))
			const oldLangs = visibleLangs.filter(l => !settings.hiddenLanguages.includes(l.code))
			const urls = [
				...urlsFor(newLangs, visibleCountries),
				...urlsFor(oldLangs, newCountries),
			]
			if (urls.length > 0) {
				cacheAudioUrls(urls)
			}
		}

		setSettings(next)
		saveSettings(next)
		applyTheme(next.theme)
	}
	const resetSettings = () => {
		clearSettings()
		setSettings(DEFAULT_SETTINGS)
		applyTheme(DEFAULT_SETTINGS.theme)
	}

	// what the main screen actually shows
	const COUNTRIES = ALL_COUNTRIES.filter(c => !settings.hiddenCountries.includes(c.code))
	const LANGUAGES = ALL_LANGUAGES.filter(l => !settings.hiddenLanguages.includes(l.code))

	// language of the displayed and spoken country name
	const [lang, setLang] = useState<Language>('en')
	const [spokenName, setSpokenName] = useState('')

	// if the selected language gets hidden in settings, fall back to the first visible one
	useEffect(() => {
		if (LANGUAGES.length > 0 && !LANGUAGES.some(l => l.code === lang)) {
			setLang(LANGUAGES[0].code)
			setSpokenName('')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settings.hiddenLanguages])
	// the sound currently playing, so starting a new one can stop it first
	const playingAudio = useRef<HTMLAudioElement | null>(null)
	// code of the country whose sound is playing, to show the play icon on its button
	const [playingCode, setPlayingCode] = useState<string | null>(null)
	// true while flight-mode downloads are in progress, to show it on the toggle
	const [caching, setCaching] = useState(false)

	async function getAudio(audioUrl: string) {
		const TTL = 1000 * 60 * 60 * 24 * 7 // 7 days
		if ('caches' in globalThis) {
			const audioCache = await caches.open('audio-cache')
			const audioCacheTimestamps = await caches.open('audio-cache-timestamps')
			const cachedResponse = await audioCache.match(audioUrl)

			if (cachedResponse) {
				const timestampResponse = await audioCacheTimestamps.match(audioUrl)
				if (timestampResponse) {
					const timestamp = await timestampResponse.text()
					const cachedTime = Number(timestamp)
					const currentTime = Date.now()

					if (currentTime - cachedTime > TTL) {
						await Promise.all([
							audioCache.delete(audioUrl),
							audioCacheTimestamps.delete(audioUrl),
						])
					} else {
						return cachedResponse
					}
				}
			}

			const response = await fetch(audioUrl)
			// skip caching if response failed or empty, so a 404 page is never cached as audio
			if (!response.ok || !response.headers.get('Content-Length') || response.headers.get('Content-Length') === '0') {
				return response
			}

			await audioCache.put(audioUrl, response.clone())
			const timestampResponse = new Response(Date.now().toString())
			await audioCacheTimestamps.put(audioUrl, timestampResponse)

			return response
		} else {
			return await fetch(audioUrl)
		}
	}

	// Download the given sound files into the cache (already-cached ones are skipped,
	// so incremental calls only fetch what is missing). Never deletes anything:
	// switching flight mode off keeps the cached files.
	async function cacheAudioUrls(audioUrls: string[]) {
		// Some browsers like Safari disable Cache Storage in lockdown mode
		if (!('caches' in globalThis)) {
			console.warn('Cache Storage API not available; skipping flight mode cache')
			return
		}
		setCaching(true)
		console.time('cacheAudioUrls')
		try {
			const [audioCache, audioCacheTimestamps] = await Promise.all([
				caches.open('audio-cache'),
				caches.open('audio-cache-timestamps'),
			])

			await Promise.all(
				audioUrls.map(async url => {
					try {
						// already downloaded earlier — keep it
						if (await audioCache.match(url)) {
							return
						}
						const res = await fetch(url)
						if (res.ok && res.body && res.headers.get('Content-Length') && res.headers.get('Content-Length') !== '0') {
							await Promise.all([
								audioCache.put(url, res.clone()),
								audioCacheTimestamps.put(url, new Response(Date.now().toString())),
							])
						} else {
							console.warn(`Failed to cache: ${url} (status: ${res.status})`)
						}
					} catch (err) {
						console.error(`Error fetching ${url}:`, err)
					}
				}),
			)

			console.log('Audio files cached successfully')
		} catch (error) {
			console.error('Failed to cache audio files:', error)
		} finally {
			console.timeEnd('cacheAudioUrls')
			setCaching(false)
		}
	}

	const playSound = useCallback(async (code: string) => {
		try {
			const audioUrl = `/sounds/${lang}/${code}.aac`
			const response = await getAudio(audioUrl)
			const blob = await response.blob()
			const objectUrl = URL.createObjectURL(blob)
			if (playingAudio.current) {
				playingAudio.current.pause()
				URL.revokeObjectURL(playingAudio.current.src)
			}
			const audio = new Audio(objectUrl)
			audio.onended = () => {
				URL.revokeObjectURL(objectUrl)
				setPlayingCode(null)
			}
			playingAudio.current = audio
			await audio.play()
			setPlayingCode(code)
		} catch (e) {
			console.error(e)
		}
	}, [lang])

	const stopSound = useCallback(() => {
		if (playingAudio.current) {
			playingAudio.current.pause()
			URL.revokeObjectURL(playingAudio.current.src)
			playingAudio.current = null
		}
		setPlayingCode(null)
	}, [])

	return (
		<div className="Flags">
			<select
				className="language-select"
				title="Language of the country name"
				value={lang}
				onChange={(e) => {
					setLang(e.target.value as Language)
					setSpokenName('')
					stopSound()
				}}
			>
				{LANGUAGES.map(l => (
					<option key={`lang-${l.code}`} value={l.code}>{l.display}</option>
				))}
			</select>
			<SettingsPanel
				settings={settings}
				languages={ALL_LANGUAGES}
				countries={ALL_COUNTRIES.map(c => ({ code: c.code, flag: c.flag, display: c.name.en }))}
				caching={caching}
				onChange={updateSettings}
				onClear={resetSettings}
			/>
			<hgroup>
				{COUNTRIES.map(c => (
					<button
						key={`country-${c.code}`}
						className={playingCode === c.code ? 'button-flag playing' : 'button-flag'}
						title={c.name[lang]}
						onClick={() => {
							if (playingCode === c.code) {
								stopSound()
							} else {
								playSound(c.code)
								setSpokenName(c.name[lang])
							}
						}}
					>
						{c.flag}
						{playingCode === c.code && <span className="play-icon">▶</span>}
					</button>
				))}
			</hgroup>
			<hgroup>
				<h1>
					{spokenName}
				</h1>
			</hgroup>
			<Analytics/>
		</div>
	)
}

export default App
