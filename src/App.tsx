import './App.css'
import { useCallback, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import SettingsPanel from './SettingsPanel'
import { GameScore, GameActions } from './GameHud'
import { Country, Language } from './countries/Country'
import { isVisible } from './featureFlags'
import {
	Settings,
	SortMode,
	DEFAULT_SETTINGS,
	loadSettings,
	saveSettings,
	applyTheme,
	preferredLanguage,
} from './settingsStore'
import { ensureCached, idbCount, idbClear } from './audioCache'
import { useAudio } from './useAudio'
import { useGame } from './useGame'
import { useFitText } from './useFitText'
import { translator } from './i18n'
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

// Order the countries for display. 'lang' sorts by the country name in the given
// language (only when one is selected — otherwise falls back to iso); 'random' uses
// the frozen randomOrder (unknown codes go last); 'iso' (default) sorts by code.
function sortCountries(countries: Country[], mode: SortMode, lang: Language, hasLanguage: boolean, randomOrder: string[]): Country[] {
	const list = countries.slice()
	if (mode === 'lang' && hasLanguage) {
		return list.sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang) || a.code.localeCompare(b.code))
	}
	if (mode === 'random') {
		const pos = (code: string) => {
			const i = randomOrder.indexOf(code)
			return i === -1 ? Number.MAX_SAFE_INTEGER : i
		}
		return list.sort((a, b) => pos(a.code) - pos(b.code) || a.code.localeCompare(b.code))
	}
	return list.sort((a, b) => a.code.localeCompare(b.code))
}

function App() {
	// everything the build supports (after the beta feature flag)
	const ALL_COUNTRIES: Country[] = [ae, al, at, be, ch, cz, de, dk, eg, es, fr, gr, iq, ir, it, lb, lu, nl, no, om, pl, ps, pt, se, sy, th, tn, tr, ua, us, va].filter(isVisible)
	// hidePrompt: don't write the prompted name in the display during a game —
	// for 🎺/🎹 the "name" is the anthem title, which would give the country away
	const LANGUAGE_DEFS: { code: Language, display: string, beta?: boolean, hidePrompt?: boolean }[] = [
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
		{ code: 'xa', display: '🎺', hidePrompt: true },
		{ code: 'xt', display: '🎹', beta: true, hidePrompt: true },
	]
	const ALL_LANGUAGES = LANGUAGE_DEFS.filter(isVisible)

	// true while flight-mode downloads are in progress, to show it on the toggle
	const [caching, setCaching] = useState(false)
	// how many sound files are currently in the cache, shown in settings
	const [cachedCount, setCachedCount] = useState(0)

	const refreshCacheCount = useCallback(async () => {
		try {
			setCachedCount(await idbCount())
		} catch {
			// leave the previous count
		}
	}, [])
	useEffect(() => {
		refreshCacheCount()
	}, [refreshCacheCount])

	// playback, mute and the feedback sounds
	const audio = useAudio(refreshCacheCount)

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

	// language of the displayed and spoken country name; defaults to the browser's
	// preferred language on first load (the fallback effect below keeps it visible)
	const [lang, setLang] = useState<Language>(() => preferredLanguage())
	const [spokenName, setSpokenName] = useState('')

	// delete only the downloaded sound files (settings stay); not allowed in flight mode
	const clearSoundCache = useCallback(async () => {
		try {
			await idbClear()
		} catch {
			// ignore
		}
		setCachedCount(0)
	}, [])

	// Flight mode: download the given sounds into the cache, showing the busy state.
	const cacheAudioUrls = useCallback(async (audioUrls: string[]) => {
		setCaching(true)
		try {
			await ensureCached(audioUrls)
		} finally {
			setCaching(false)
			refreshCacheCount()
		}
	}, [refreshCacheCount])

	const updateSettings = (next: Settings) => {
		// stop playback when its country, or the selected language, just got hidden —
		// otherwise the sound would keep playing with no button left to stop it
		if (
			(audio.playingCode && next.hiddenCountries.includes(audio.playingCode)) ||
			next.hiddenLanguages.includes(lang)
		) {
			audio.stopSound()
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

	// choose a sort mode for the flags; choosing random reshuffles every time
	const setSort = (mode: SortMode) => {
		if (mode === 'random') {
			updateSettings({ ...settings, sortMode: 'random', randomOrder: shuffle(ALL_COUNTRIES.map(c => c.code)) })
		} else {
			updateSettings({ ...settings, sortMode: mode })
		}
	}

	const LANGUAGES = ALL_LANGUAGES.filter(l => !settings.hiddenLanguages.includes(l.code))
	// what the main screen actually shows: all countries sorted by the chosen mode,
	// then filtered to the visible ones (hidden flags still hold their sorted slot)
	const COUNTRIES = sortCountries(ALL_COUNTRIES, settings.sortMode, lang, LANGUAGES.length > 0, settings.randomOrder)
		.filter(c => !settings.hiddenCountries.includes(c.code))

	// if the selected language gets hidden in settings, fall back to the first visible one
	useEffect(() => {
		if (LANGUAGES.length > 0 && !LANGUAGES.some(l => l.code === lang)) {
			setLang(LANGUAGES[0].code)
			setSpokenName('')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settings.hiddenLanguages])

	// the sound file of a country's name (or anthem) in the selected language
	const countryUrl = (code: string) => `/sound/lang/${lang}/${code}.aac`

	// the game: the flags shuffle on every round
	const game = useGame<Country>({
		canPlay: LANGUAGES.length > 0 && COUNTRIES.length > 0,
		buildBoard: () => shuffle(COUNTRIES),
		promptUrl: c => countryUrl(c.code),
		preload: async urls => {
			await ensureCached(urls)
			refreshCacheCount()
		},
		audio,
		onRoundStart: () => setSpokenName(''),
	})

	const board = game.gameOn ? game.board : COUNTRIES
	// what the display segment shows: the prompted name during a round (so the
	// game is playable while muted), otherwise the last clicked name. Languages
	// flagged hidePrompt (🎺/🎹) keep the prompt secret during a round — unless
	// the game is muted, where the title is the only prompt left to play by
	const promptHidden = (ALL_LANGUAGES.find(l => l.code === lang)?.hidePrompt ?? false) && !audio.muted
	const displayText = game.gameOn && game.target !== null
		? (promptHidden ? '' : (game.board.find(c => c.code === game.target)?.name[lang] ?? ''))
		: spokenName

	// UI-string translator, following the selected language (falls back to English)
	const t = translator(lang)

	// shrink the display font before falling back to the marquee
	const displayRef = useFitText(displayText)

	return (
		<div className="Flags">
			{/* the app bar's four segments sit right-to-left: toolbar, display,
			    game score, game actions (the last two only in game mode) */}
			<header className="app-bar">
				<div className="toolbar">
					<button
						className={(game.gameOn ? 'game-toggle on' : 'game-toggle') + (game.preparing ? ' busy' : '')}
						aria-label={game.gameOn ? t('game.end') : t('game.start')}
						aria-pressed={game.gameOn}
						title={
							game.gameOn
								? t('game.end')
								: (game.canPlay ? t('game.start') : t('game.selectToPlay'))
						}
						disabled={(!game.gameOn && !game.canPlay) || game.preparing}
						onClick={() => (game.gameOn ? game.exitGame() : game.startRound())}
					>
						🕹️
					</button>
					<button
						className={audio.muted ? 'mute-toggle on' : 'mute-toggle'}
						aria-label={audio.muted ? t('mute.unmute') : t('mute.mute')}
						aria-pressed={audio.muted}
						title={audio.muted ? t('mute.unmuteTitle') : t('mute.muteTitle')}
						onClick={audio.toggleMute}
					>
						{audio.muted ? '🔇' : '🔊'}
					</button>
					<select
						className="language-select"
						title={t('lang.title')}
						value={lang}
						disabled={game.target !== null}
						onChange={(e) => {
							setLang(e.target.value as Language)
							setSpokenName('')
							audio.stopSound()
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
						locked={game.gameOn}
						t={t}
						onChange={updateSettings}
						onSetSort={setSort}
						onClearCache={clearSoundCache}
					/>
				</div>
				<div className="display">
					<h1 className="display-text" ref={displayRef}>
						{game.preparing ? '⏳' : displayText}
					</h1>
				</div>
				{game.gameOn && (
					<GameScore
						t={t}
						played={game.solved.length}
						total={game.board.length}
						mistakes={game.mistakes}
						giveUps={game.giveUps}
						ms={game.elapsedMs}
					/>
				)}
				{game.gameOn && (
					<GameActions
						t={t}
						roundActive={game.target !== null}
						muted={audio.muted}
						preparing={game.preparing}
						onReplay={game.replay}
						onGiveUp={game.giveUp}
						onStop={game.stopRound}
						onRestart={game.startRound}
					/>
				)}
			</header>
			<hgroup>
				{board.map(c => {
					const isGivenUp = game.gameOn && game.gaveUpCodes.includes(c.code)
					const isSolved = game.gameOn && game.solved.includes(c.code) && !isGivenUp
					const isWrong = game.gameOn && game.wrongGuesses.includes(c.code)
					return (
						<button
							key={`country-${c.code}`}
							className={'button-flag' + (audio.playingCode === c.code ? ' playing' : '') + (isWrong ? ' wrong' : '')}
							title={game.gameOn ? '' : (LANGUAGES.length > 0 ? c.name[lang] : '🤷‍♂️')}
							disabled={isSolved || isGivenUp || isWrong}
							onClick={() => {
								if (game.gameOn) {
									game.guess(c.code)
								} else if (audio.playingCode === c.code) {
									audio.stopSound()
								} else if (LANGUAGES.length === 0) {
									// every language is hidden: nothing to say
									setSpokenName('🤷‍♂️')
								} else {
									audio.play(countryUrl(c.code), c.code)
									setSpokenName(c.name[lang])
								}
							}}
						>
							{c.flag}
							{audio.playingCode === c.code && <span className="play-icon">▶</span>}
							{isSolved && <span className="swatch-mark">👍</span>}
							{isGivenUp && <span className="swatch-mark">🤷‍♂️</span>}
							{isWrong && <span className="swatch-mark">👎</span>}
						</button>
					)
				})}
			</hgroup>
			{game.feedback && (
				<div key={game.feedback.id} className="game-feedback" aria-hidden="true">
					{game.feedback.emoji}
				</div>
			)}
			<Analytics/>
		</div>
	)
}

export default App
