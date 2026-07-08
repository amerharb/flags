# Flags Changelog

<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.11.0] 2026-07-08
### Added
- Add 🎹 language (code `xt`): plays a pure-tone rendering of each anthem's
  main melody notes, synthesized from public-domain MIDI transcriptions
- Add Iran
- Add Persian language
- Add a feature flag (`beta`) to hide unfinished countries/languages from
  production builds while keeping them visible in development

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
