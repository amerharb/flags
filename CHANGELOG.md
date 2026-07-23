# Flags Changelog

<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.16.0] 2026-07-20
### Added
- Localize the interface: all UI text (button tooltips, the "select a language
  and country to play" hint, settings labels, game score/actions) now lives in
  `src/i18n/*.json`, falling back to English for any missing string
- Add an interface-language dropdown (👁️) to the settings panel with the four
  localized languages (English, Arabic, German, Swedish). It is now a separate,
  persisted setting — independent of the content/country-language dropdown — so
  the UI and the spoken language can differ. On first run it follows the browser
  (primary language, then any of the browser's languages, else the
  content-language pick if it is a UI language, else English)
- Show the content-language names (top dropdown and settings checklist) in the
  current interface language — e.g. "Persian" in an English UI, "Persisch" in a
  German UI — falling back to the native name for any untranslated pair, and
  sorted alphabetically by that displayed name (using the UI language's
  collation). The interface-language dropdown itself keeps native names
  (English, عربي, Deutsch, Svenska) so it is always self-findable
- Add the United Kingdom 🇬🇧 and Hungary 🇭🇺, with names and Microsoft Edge
  neural recordings in all ten spoken languages, plus the 🎺 anthem recordings
  (God Save the King, Himnusz — public-domain U.S. Navy Band performances from
  Wikimedia Commons, like the existing anthems). They stay beta: the 🎹 tone
  renderings still need to be synthesized before promoting
### Changed
- Label the two anthem options with text instead of a bare emoji: 🎺 → "🎺
  Anthem" (the recorded anthem) and 🎹 → "🎹 Anthem (tones)" (the synthesized
  melody). Both keep their icon and are localized like any other content
  language — e.g. German "🎺 Hymne" / "🎹 Hymne (Töne)", Arabic "🎺 النشيد"
- In game mode with the round stopped (finished or ✋), the selected language
  can be changed again — the next 🔄 round uses it. It stays locked while a
  round is running, and showing or hiding languages/items in settings stays
  locked for the whole game mode
- Internal refactor (no behaviour change): App.tsx is split into focused
  modules shared verbatim with the sister projects — `useAudio` (playback,
  mute, feedback sounds), `useGame` (the round state machine), `GameHud` (the
  score and action segments) and `useFitText` (the display shrink-to-fit) —
  cutting App.tsx from ~650 to ~400 lines

## [0.15.0] 2026-07-18
### Fixed
- The open settings gear (⚙️) now uses the same accent background as the
  other pressed controls (game/mute toggles, selected segments): the active
  color moved to a shared `--active-bg` variable — `--flag-bg` stays for the
  flag tiles themselves — and the sister projects adopted the same accent
### Added
- Add a mute toggle (🔊/🔇) in the toolbar, right of the game button: while
  muted nothing plays — names, game prompts or feedback sounds — and whatever
  is playing at that moment stops
- During a round, the prompted country's name is written in the display
  segment, so the game can also be played by reading — except for 🎺 and 🎹,
  whose "name" is the anthem title and would give the country away (a new
  `hidePrompt` flag on the language definition, like `beta`). While muted the
  title is shown even for 🎺/🎹, since it is then the only prompt left to
  play by
- Add a replay button (👂) to the game actions: plays the current prompt
  again; disabled while muted or between rounds
- Add `vercel.json` (framework Vite, output directory `dist`) so the Vercel
  deployment configuration is explicit and versioned, like the sister project
  Arqaam
### Changed
- Change the game toggle emoji from 🎮 to 🕹️ (the classic joystick)
- Restructure the top of the app into one sticky app bar with four segments,
  right-to-left: toolbar (🕹️ game, 🔊 mute, language, ⚙️ settings), display
  (the spoken name), live game score (🏁 played 👎 mistakes 🤷‍♂️ give-ups
  ⏱️ time, ticking every second) and game actions. The game segments anchor
  to the left, the toolbar to the right, and the display stretches between
  them — a long name first shrinks its font (down to a limit) and only then
  auto-scrolls back and forth. The game segments only appear in game mode,
  unfolding with a smooth transition; on narrow screens the bar stacks the
  segments top-to-bottom in the same order, with the display on a full row
- The game no longer ends by itself: when every country has been played the
  round is over — the clock freezes and the score stays — but game mode
  stays on. New round actions sit next to the give-up button (🤷‍♂️): stop
  (✋) ends the current round early and restart (🔄) starts a fresh one;
  clicking 🕹️ again leaves game mode and hides the game score and actions
- In the game result, show the mistakes count with 👎 instead of ❌, matching
  the marker shown on a wrong guess
- Replace the generated favicon set (ico + five pngs of the Twemoji 🚩) with a
  single hand-drawn `favicon.svg` (a red waving flag), like the sister projects
  Colors and Week; the manifest now uses the svg and matches the app's dark
  background (#121212) instead of the old Create React App colors

## [0.14.0] 2026-07-12
### Added
- Support URL parameters for a shareable view: `f` sets which flags are shown
  (e.g. `?f=us,de,fr`) and `l` sets which languages are shown with the first
  one selected (e.g. `?l=en,ar`). List order does not affect the on-screen order.
- Add a flag sort setting ⇵: by ISO code (🌐, default), by the selected language's
  names (🗣️, so switching language re-sorts; falls back to ISO when no language
  is selected), or random (🎲, reshuffles every time you choose it). The random
  order covers hidden flags too, so each keeps its slot when shown.

### Changed
- In the game, a solved flag shows a 👍 marker (in addition to being dimmed);
  a flag revealed with "I don't know" is marked 🤷‍♂️ instead and plays a
  distinct give-up sound
- In the game, a wrong flag is temporarily disabled with a 👎 marker so you
  can't tap it again; all such flags re-enable once you find the correct one
- Cache all sounds in a single store (IndexedDB) instead of the previous mix of
  Cache Storage and an in-memory map. Simpler, persists across reloads, works in
  Safari Lockdown Mode, and drops the 7-day TTL (the cache lives until cleared
  with the 🗑️ button)

### Fixed
- In the game, answering the final country before the previous prompt's sound
  was scheduled to play no longer leaves that sound playing after the game ends
  (the pending next-prompt timer is now cancelled)

## [0.13.0] 2026-07-09
### Added
- Add an About section at the bottom of the settings panel showing the app
  version and a link to the developer's GitHub
- Add Oman and Thailand
- Add Norway and France
- Add Switzerland and Netherlands
- Add Spain and Italy
- Add Vatican City and Austria
- Add Greece
- Add Poland, Egypt, Belgium, Luxembourg and Czech Republic

### Changed
- Promote all countries out of beta except Iran and Ukraine; every other
  country now shows in production

## [0.12.1] 2026-07-09
### Fixed
- Pre-load all of a game's sounds before it starts, so gameplay never waits on
  the network. The sounds are held in memory, which also works in Safari
  Lockdown Mode (where the Cache Storage API is disabled and offline caching
  cannot run)

## [0.12.0] 2026-07-09
### Added
- Add Iraq, Lebanon and the United Arab Emirates
- Add a guessing game: press the 🎮 button (in the top control bar, disabled
  until at least one language and one country are visible). The flags shuffle,
  a random country's name is played in the selected language, and you tap the
  matching flag. A correct tap flashes 👍, plays a chime and disables that
  flag; a wrong tap flashes 👎 with a buzz. A give-up button (🤷‍♂️) reveals
  the current one (counted as played, tracked separately from mistakes). The
  game ends when every visible country has been played, or when you press 🎮
  again to stop; either way it shows how many countries you played, your
  mistakes, your give-ups, and your time. During a game you can still open
  settings to change the theme or flight mode, but the language and country
  lists are locked.
- On first visit, pick the starting language from the browser (navigator.language)
  and show only the browser's languages (navigator.languages) plus 🎺 and 🎹

### Changed
- Mark Iran and Ukraine as beta (hidden from production for now)

## [0.11.0] 2026-07-08
### Added
- Add 🎹 language (code `xt`): plays a pure-tone rendering of each anthem's
  main melody notes, synthesized from public-domain MIDI transcriptions
- Add Iran
- Add Ukraine
- Add Persian language
- Add Ukrainian language
- Add a feature flag (`beta`) to hide unfinished countries/languages from
  production builds while keeping them visible in development
- Add a settings panel (⚙️): Theme with system/light/dark icon options
  (system is the default); settings are saved in localStorage
- Settings include a language checklist and a scrollable grid of flag squares
  to show or hide any language or country on the main screen, with ✅/⬜
  buttons to select or deselect all at once; everything can be hidden, and
  with no visible language a flag click shows 🤷‍♂️ instead of playing a sound
- Hiding the playing country or the selected language stops the playing sound
- Add a flight mode toggle (✈️) in settings: downloads all visible sounds,
  caches newly shown languages/countries right away while on, and keeps the
  cached files when turned off
- Show the number of cached sound files (🔊) next to the flight mode toggle,
  with a clear sound cache button (🗑️) that only works outside flight mode

### Changed
- The theme toggle button is replaced by the Theme option in the
  settings panel
- Show each language under its native name, so Arabic becomes عربي,
  German becomes Deutsch, and so on
- Show the National Anthem option as 🎺

### Removed
- The page title and its double-click download; caching for offline use is
  now the flight mode toggle in settings

### Fixed
- Don't crash in Safari when the Cache Storage API is unavailable (e.g. over
  plain http); skip the offline cache gracefully instead

## [0.10.0] 2026-07-06
### Added
- Add Denmark
- Add Danish language
- Add Albanian language
- Add Portuguese language
- Add Turkish language
- Show a play icon on the country button while its sound is playing
- Keep the country button pressed down while its sound is playing
- Clicking the playing country button again stops the sound

### Changed
- Replace Arabic voice with a more natural one, Amany (Microsoft Edge
  neural text-to-speech, Syrian Arabic) instead of macOS Majed
- Replace English voice with a more natural one, Ava (Microsoft Edge
  neural text-to-speech, US English) instead of macOS Samantha
- Replace German, Swedish and Danish voices with more natural Microsoft
  Edge neural ones (Katja, Sofie, Christel) instead of macOS Anna, Alva, Sara

### Fixed
- Starting a new sound stops the one currently playing instead of
  playing both at the same time
- Don't cache failed sound file responses, a missing file no longer
  poisons the audio cache with a 404 page for a week

## [0.1.0] 2026-07-03
### Added
- Show country flags as emoji buttons, click to hear the country name and see it written
- Countries: Albania, Germany, Palestine, Portugal, Sweden, Syria, Tunisia, Turkey, USA
- Languages: Arabic, English, German, Swedish, selectable from a dropdown
- National Anthem as a selectable option (fictional language code `xa`):
  shows the anthem title in its native language and plays the anthem recording
- Dark mode with a system/light/dark toggle, remembered between visits
- Cache sound files for offline use when double-clicking the page title
- Sound files cached for 1 week
