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
	applyTheme,
	preferredLanguage,
} from './settingsStore'
import { ae } from './countries/ae'
import { al } from './countries/al'
import { at } from './countries/at'
import { be } from './countries/be'
import { ch } from './countries/ch'
import { cz } from './countries/cz'
import { de } from './countries/de'
import { dk } from './countries/dk'
import { eg } from './countries/eg'
import { es } from './countries/es'
import { fr } from './countries/fr'
import { gr } from './countries/gr'
import { iq } from './countries/iq'
import { ir } from './countries/ir'
import { it } from './countries/it'
import { lb } from './countries/lb'
import { lu } from './countries/lu'
import { nl } from './countries/nl'
import { no } from './countries/no'
import { om } from './countries/om'
import { pl } from './countries/pl'
import { ps } from './countries/ps'
import { pt } from './countries/pt'
import { se } from './countries/se'
import { sy } from './countries/sy'
import { tn } from './countries/tn'
import { th } from './countries/th'
import { tr } from './countries/tr'
import { ua } from './countries/ua'
import { us } from './countries/us'
import { va } from './countries/va'

// Fisher–Yates shuffle into a new array (used to scramble the flag positions on game start)
function shuffle<T>(items: T[]): T[] {
	const out = items.slice()
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[out[i], out[j]] = [out[j], out[i]]
	}
	return out
}

const randomOf = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

// short win/lose feedback sounds
function playFx(name: 'correct' | 'wrong') {
	try {
		new Audio(`/sound/fx/${name}.aac`).play().catch(() => {})
	} catch {
		// ignore
	}
}

function App() {
	// everything the build supports (after the beta feature flag)
	const ALL_COUNTRIES: Country[] = [ae, al, at, be, ch, cz, de, dk, eg, es, fr, gr, iq, ir, it, lb, lu, nl, no, om, pl, ps, pt, se, sy, th, tn, tr, ua, us, va].filter(isVisible)
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
		let loaded = loadSettings()

		// URL params override visibility for a shareable/deep-linked view:
		//   ?f=us,de,fr  -> only these flags (countries) are visible
		//   ?l=en,ar     -> only these languages are visible; the first is selected
		// Order in the params does not affect the on-screen order.
		const params = new URLSearchParams(window.location.search)

		const fParam = params.get('f')
		if (fParam !== null) {
			const want = new Set(fParam.split(',').map(s => s.trim()).filter(Boolean))
			const hiddenCountries = ALL_COUNTRIES.map(c => c.code).filter(c => !want.has(c))
			loaded = { ...loaded, hiddenCountries }
		}

		const lParam = params.get('l')
		if (lParam !== null) {
			const valid = new Set(ALL_LANGUAGES.map(l => l.code))
			const want = lParam.split(',').map(s => s.trim()).filter(c => valid.has(c as Language))
			const hiddenLanguages = ALL_LANGUAGES.map(l => l.code).filter(c => !want.includes(c))
			loaded = { ...loaded, hiddenLanguages }
			if (want.length > 0) setLang(want[0] as Language) // first listed = selected
		}

		setSettings(loaded)
		applyTheme(loaded.theme)
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			langs.flatMap(l => countries.map(c => `/sound/lang/${l.code}/${c.code}.aac`))
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

	// what the main screen actually shows
	const COUNTRIES = ALL_COUNTRIES.filter(c => !settings.hiddenCountries.includes(c.code))
	const LANGUAGES = ALL_LANGUAGES.filter(l => !settings.hiddenLanguages.includes(l.code))

	// language of the displayed and spoken country name; defaults to the browser's
	// preferred language on first load (the fallback effect below keeps it visible)
	const [lang, setLang] = useState<Language>(() => preferredLanguage())
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
	// how many sound files are currently in the cache, shown in settings
	const [cachedCount, setCachedCount] = useState(0)

	const refreshCacheCount = useCallback(async () => {
		if (!('caches' in globalThis)) return
		try {
			const audioCache = await caches.open('audio-cache')
			setCachedCount((await audioCache.keys()).length)
		} catch {
			// leave the previous count
		}
	}, [])
	useEffect(() => {
		refreshCacheCount()
	}, [refreshCacheCount])

	// delete only the downloaded sound files (settings stay); not allowed in flight mode
	const clearSoundCache = useCallback(async () => {
		if (!('caches' in globalThis)) return
		await Promise.all([
			caches.delete('audio-cache'),
			caches.delete('audio-cache-timestamps'),
		])
		setCachedCount(0)
	}, [])

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
			refreshCacheCount()
		}
	}

	const playSound = useCallback(async (code: string) => {
		try {
			const audioUrl = `/sound/lang/${lang}/${code}.aac`
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
			refreshCacheCount() // playing may have added the file to the cache
		} catch (e) {
			console.error(e)
		}
	}, [lang, refreshCacheCount])

	// pending "play the next prompt" timer during the game, so it can be cancelled
	// if the game ends (or is stopped) before it fires — otherwise a late timer
	// would start a sound after the game is already over
	const promptTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const stopSound = useCallback(() => {
		if (promptTimer.current) {
			clearTimeout(promptTimer.current)
			promptTimer.current = null
		}
		if (playingAudio.current) {
			playingAudio.current.pause()
			URL.revokeObjectURL(playingAudio.current.src)
			playingAudio.current = null
		}
		setPlayingCode(null)
	}, [])

	// In-memory blob cache for game sounds. This works in every browser — including
	// Safari Lockdown Mode, where the Cache Storage API is disabled — so the game
	// can pre-load its sounds regardless of whether the offline cache is available.
	const memAudio = useRef<Map<string, Blob>>(new Map())

	// Fetch the given sounds into memory (skipping ones already held). Falls back to
	// the network when Cache Storage is unavailable, so it always succeeds if online.
	const prefetchToMemory = useCallback(async (urls: string[]) => {
		await Promise.all(urls.map(async url => {
			if (memAudio.current.has(url)) return
			try {
				const response = await getAudio(url)
				if (!response.ok) return
				const blob = await response.blob()
				if (blob.size > 0) memAudio.current.set(url, blob)
			} catch (e) {
				console.error(`Failed to preload ${url}:`, e)
			}
		}))
	}, [])

	// play a country sound without touching the play-icon UI (used by the game).
	// Prefers the in-memory blob so gameplay is instant and offline-cache-independent.
	const playFile = useCallback(async (url: string) => {
		try {
			let blob = memAudio.current.get(url)
			if (!blob) {
				const response = await getAudio(url)
				blob = await response.blob()
				if (blob.size > 0) memAudio.current.set(url, blob)
			}
			const objectUrl = URL.createObjectURL(blob)
			if (playingAudio.current) {
				playingAudio.current.pause()
				URL.revokeObjectURL(playingAudio.current.src)
			}
			const audio = new Audio(objectUrl)
			audio.onended = () => URL.revokeObjectURL(objectUrl)
			playingAudio.current = audio
			await audio.play()
			refreshCacheCount()
		} catch (e) {
			console.error(e)
		}
	}, [refreshCacheCount])

	// ---- Game mode ----
	const [gameOn, setGameOn] = useState(false)
	const [gameFlags, setGameFlags] = useState<Country[]>([]) // shuffled board for this game
	const [target, setTarget] = useState<string | null>(null) // country code to find
	const [solved, setSolved] = useState<string[]>([])         // codes already played (guessed or given up)
	const [mistakes, setMistakes] = useState(0)      // wrong taps this game
	const [giveUps, setGiveUps] = useState(0)        // countries given up on this game
	const gameStart = useRef(0)                       // Date.now() when the game began
	const [result, setResult] = useState<{ played: number, total: number, mistakes: number, giveUps: number, ms: number } | null>(null)
	const [feedback, setFeedback] = useState<{ emoji: string, id: number } | null>(null)
	const feedbackId = useRef(0)
	const [preparing, setPreparing] = useState(false) // downloading game sounds before start

	const canPlayGame = LANGUAGES.length > 0 && COUNTRIES.length > 0

	const formatDuration = (ms: number) => {
		const total = Math.round(ms / 1000)
		const m = Math.floor(total / 60)
		const s = total % 60
		return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
	}

	const flashFeedback = (emoji: string) => {
		feedbackId.current += 1
		const id = feedbackId.current
		setFeedback({ emoji, id })
		setTimeout(() => setFeedback(f => (f && f.id === id ? null : f)), 700)
	}

	const startGame = async () => {
		if (!canPlayGame || preparing) return
		stopSound()
		const board = shuffle(COUNTRIES)
		// pre-load every prompt sound before the game begins, so gameplay never waits
		// on the network — and so it works where Cache Storage is unavailable
		setPreparing(true)
		await prefetchToMemory(board.map(c => `/sound/lang/${lang}/${c.code}.aac`))
		setPreparing(false)
		const first = randomOf(board)
		setGameFlags(board)
		setSolved([])
		setMistakes(0)
		setGiveUps(0)
		setResult(null)
		setSpokenName('')
		gameStart.current = Date.now()
		setTarget(first.code)
		setGameOn(true)
		playFile(`/sound/lang/${lang}/${first.code}.aac`)
	}

	const endGame = () => {
		stopSound()
		setGameOn(false)
		setTarget(null)
		setFeedback(null)
		// show the result for the countries played so far
		setResult({
			played: solved.length,
			total: gameFlags.length,
			mistakes,
			giveUps,
			ms: Date.now() - gameStart.current,
		})
	}

	// mark the target country played and move on (or finish). mistakesTotal and
	// giveUpsTotal are the running counts to record if this was the last country.
	const advance = (code: string, mistakesTotal: number, giveUpsTotal: number) => {
		// cancel any not-yet-fired next-prompt timer (e.g. the player answered the
		// last country before the previous prompt was scheduled to play)
		if (promptTimer.current) {
			clearTimeout(promptTimer.current)
			promptTimer.current = null
		}
		const nextSolved = [...solved, code]
		setSolved(nextSolved)
		const remaining = gameFlags.filter(c => !nextSolved.includes(c.code))
		if (remaining.length === 0) {
			// all visible countries played — game over.
			// stop the last prompt sound (an anthem can run for minutes)
			stopSound()
			setGameOn(false)
			setTarget(null)
			setResult({
				played: nextSolved.length,
				total: gameFlags.length,
				mistakes: mistakesTotal,
				giveUps: giveUpsTotal,
				ms: Date.now() - gameStart.current,
			})
		} else {
			const next = randomOf(remaining)
			setTarget(next.code)
			// let the feedback land before the next prompt
			promptTimer.current = setTimeout(() => playFile(`/sound/lang/${lang}/${next.code}.aac`), 650)
		}
	}

	const guessFlag = (code: string) => {
		if (target === null || solved.includes(code)) return
		if (code === target) {
			playFx('correct')
			flashFeedback('👍')
			advance(code, mistakes, giveUps)
		} else {
			setMistakes(m => m + 1)
			playFx('wrong')
			flashFeedback('👎')
		}
	}

	// give up on the current country: counts as played and as a give-up (not a mistake)
	const giveUp = () => {
		if (target === null) return
		const nextGiveUps = giveUps + 1
		setGiveUps(nextGiveUps)
		flashFeedback('🤷‍♂️')
		advance(target, mistakes, nextGiveUps)
	}

	const board = gameOn ? gameFlags : COUNTRIES

	return (
		<div className="Flags">
			<div className="top-controls">
				<button
					className={(gameOn ? 'game-toggle on' : 'game-toggle') + (preparing ? ' busy' : '')}
					aria-label={gameOn ? 'End game' : 'Start game'}
					aria-pressed={gameOn}
					title={
						gameOn
							? 'End game'
							: (canPlayGame ? 'Start game' : 'Select at least one language and country to play')
					}
					disabled={(!gameOn && !canPlayGame) || preparing}
					onClick={() => (gameOn ? endGame() : startGame())}
				>
					🎮
				</button>
				<select
					className="language-select"
					title="Language of the country name"
					value={lang}
					disabled={gameOn}
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
					countries={ALL_COUNTRIES.map(c => ({ code: c.code, flag: c.flag }))}
					caching={caching}
					cachedCount={cachedCount}
					locked={gameOn}
					onChange={updateSettings}
					onClearCache={clearSoundCache}
				/>
			</div>
			<hgroup>
				{board.map(c => {
					const isSolved = gameOn && solved.includes(c.code)
					return (
						<button
							key={`country-${c.code}`}
							className={playingCode === c.code ? 'button-flag playing' : 'button-flag'}
							title={gameOn ? '' : (LANGUAGES.length > 0 ? c.name[lang] : '🤷‍♂️')}
							disabled={isSolved}
							onClick={() => {
								if (gameOn) {
									guessFlag(c.code)
								} else if (playingCode === c.code) {
									stopSound()
								} else if (LANGUAGES.length === 0) {
									// every language is hidden: nothing to say
									setSpokenName('🤷‍♂️')
								} else {
									setResult(null)
									playSound(c.code)
									setSpokenName(c.name[lang])
								}
							}}
						>
							{c.flag}
							{playingCode === c.code && <span className="play-icon">▶</span>}
						</button>
					)
				})}
			</hgroup>
			<hgroup>
				{!gameOn && result ? (
					<div className="game-result">
						<span title="Countries played">🏁 {result.played} / {result.total}</span>
						<span title="Mistakes">❌ {result.mistakes}</span>
						<span title="Give-ups">🤷‍♂️ {result.giveUps}</span>
						<span title="Time">⏱️ {formatDuration(result.ms)}</span>
					</div>
				) : (
					<h1>
						{preparing ? '⏳' : gameOn ? `${solved.length} / ${gameFlags.length}` : spokenName}
					</h1>
				)}
			</hgroup>
			{gameOn && (
				<button
					className="game-giveup"
					aria-label="Give up"
					title="Give up: reveal this one and move on"
					onClick={giveUp}
				>
					🤷‍♂️
				</button>
			)}
			{feedback && (
				<div key={feedback.id} className="game-feedback" aria-hidden="true">
					{feedback.emoji}
				</div>
			)}
			<Analytics/>
		</div>
	)
}

export default App
