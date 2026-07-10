[![Version](https://img.shields.io/badge/version-0.13.0-blue.svg)](https://github.com/amerharb/flags)
# Flags

Small react project to show country flags (as emoji) and pronounce the country
name out loud in the selected language, or play the national anthem.
Sister project of [Arqaam](https://github.com/amerharb/arqaam).

## Countries supported
- Albania 🇦🇱
- Denmark 🇩🇰
- Germany 🇩🇪
- Iraq 🇮🇶
- Lebanon 🇱🇧
- Palestine 🇵🇸
- Portugal 🇵🇹
- Sweden 🇸🇪
- Syria 🇸🇾
- Tunisia 🇹🇳
- Turkey 🇹🇷
- United Arab Emirates 🇦🇪
- United States of America 🇺🇸
- Iran 🇮🇷, Oman 🇴🇲, Thailand 🇹🇭, Ukraine 🇺🇦 (beta — visible in development,
  hidden from production for now)
- We are looking for more countries, see How to contribute

## Languages supported
- Albanian
- Arabic
- Danish
- English
- German
- Persian
- Portuguese
- Swedish
- Turkish
- Ukrainian
- 🎺 National Anthem (fictional language code `xa`: shows the anthem title in
  its native language and plays a recorded performance)
- 🎹 (fictional language code `xt`: shows the anthem title and plays a pure-tone
  rendering of the melody's main notes)

## How it works
Pick a language from the dropdown in the top right, then click a flag to hear
the country's name spoken (or its anthem played) and see it written.

- Settings (⚙️ top right): theme (system / light / dark, system is the
  default), a language checklist and a flag grid to show/hide anything on the
  main screen (with ✅/⬜ select-all/deselect-all buttons), a flight mode
  toggle (✈️), and cache info (🔊 count and a 🗑️ clear button).
  Saved in localStorage, remembered between visits.
- Flight mode (✈️): downloads all visible sounds to the cache; anything newly
  shown while it is on is downloaded right away. Turning it off keeps the
  cached files.
- Game (🎮 in the top bar): start a guessing game — a random country name is
  spoken and you tap the matching flag (👍 correct, 👎 wrong). Stuck? The
  give-up button (🤷‍♂️) reveals it (tracked separately from mistakes). It runs
  through every visible country, then shows how many you played, your mistakes,
  give-ups, and your time; press 🎮 again to stop early. Theme and flight mode
  stay changeable mid-game; the language and country lists are locked. Needs at
  least one language and one country visible.
- First visit: the starting language and which languages are shown come from
  your browser's language settings (plus 🎺 and 🎹).

## How to contribute
### Media files
To support a new country, one sound file in AAC format is needed per language,
with the spoken country name (or the anthem for `xa`).

Audio files live under `public/sound/lang/<lang>/<country-code>.aac`, for example
`public/sound/lang/en/ps.aac` for Palestine in English.

### Coding
Flags is an open source project built on Vite, React 19, TypeScript v6.x
and npm. All the code is Frontend, no backend needed.

To add a country:
1. Create `src/countries/<code>.ts` exporting a `Country` (`code`, `name`, `flag`)
   with the name in every supported language.
2. Import it and add it to the `COUNTRIES` array in `src/App.tsx`.
3. Drop the audio files at `public/sound/lang/<lang>/<code>.aac`.

To add a language:
1. Add its code to the `Language` type in `src/countries/Country.ts` —
   TypeScript will then point out every country file missing the new name.
2. Add it to the `LANGUAGES` array in `src/App.tsx`.
3. Drop the audio files at `public/sound/lang/<lang>/<code>.aac`.

#### Setup environment
- Node 20.19 or above
- npm 9.x or above
- Install `npm install`
- Build: `npm run build` (output in `dist/`)
- Start dev server: `npm start`
- Preview production build: `npm run preview`

### Deploying
Once a PR is merged to the main branch it is automatically deployed using the
Vercel integration tool with GitHub.

## Credits
### For sound
- Country name pronunciations: Microsoft Edge neural text-to-speech for
  English (Ava), Arabic (Amany, Syrian Arabic), German (Katja),
  Swedish (Sofie), Danish (Christel), Portuguese (Raquel), Turkish (Emel) and
  Persian (Dilara) and Ukrainian (Polina), and Google Translate text-to-speech
  for Albanian
- National anthem recordings: [Wikimedia Commons](https://commons.wikimedia.org/)
  public-domain uploads, including performances by the United States Navy Band
  and the USAREUR Band
- 🎹 pure-tone anthems: synthesized as sine tones from the melody (top voice) of
  public-domain MIDI transcriptions
