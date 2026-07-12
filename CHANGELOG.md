# Flags Changelog

<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.14.0] 2026-07-12

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
