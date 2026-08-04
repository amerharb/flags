> [!IMPORTANT]
> **This repository has moved.**
>
> Flags now lives in the [**sawt**](https://github.com/amerharb/sawt)
> monorepo, at [`apps/flags`](https://github.com/amerharb/sawt/tree/main/apps/flags),
> alongside its four sister apps and a shared landing page.
>
> This repository is archived and read-only. It keeps the history up to the
> move; everything after it happens in `sawt`.

[![Version](https://img.shields.io/badge/version-0.18.0-blue.svg)](https://github.com/amerharb/flags)
# Flags

Small react project to show country flags (as emoji) and pronounce the country
name out loud in the selected language. Sister project of
[Arqaam](https://github.com/amerharb/arqaam); national anthems now live in
[Anthem](https://github.com/amerharb/anthem).

## Countries supported
- Albania 🇦🇱
- Andorra 🇦🇩
- Austria 🇦🇹
- Belgium 🇧🇪
- Bosnia and Herzegovina 🇧🇦
- Bulgaria 🇧🇬
- Canada 🇨🇦
- Croatia 🇭🇷
- Czech Republic 🇨🇿
- Denmark 🇩🇰
- Egypt 🇪🇬
- France 🇫🇷
- Germany 🇩🇪
- Gibraltar 🇬🇮
- Greece 🇬🇷
- Hungary 🇭🇺
- Iceland 🇮🇸
- Iraq 🇮🇶
- Italy 🇮🇹
- Japan 🇯🇵
- Lebanon 🇱🇧
- Luxembourg 🇱🇺
- Morocco 🇲🇦
- Netherlands 🇳🇱
- Norway 🇳🇴
- Oman 🇴🇲
- Palestine 🇵🇸
- Poland 🇵🇱
- Portugal 🇵🇹
- Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿
- Serbia 🇷🇸
- Slovakia 🇸🇰
- Spain 🇪🇸
- Sweden 🇸🇪
- Switzerland 🇨🇭
- Syria 🇸🇾
- Thailand 🇹🇭
- Tunisia 🇹🇳
- Turkey 🇹🇷
- United Arab Emirates 🇦🇪
- United Kingdom 🇬🇧
- United States of America 🇺🇸
- Vatican City 🇻🇦
- Iran 🇮🇷, Ukraine 🇺🇦 (beta — visible in development, hidden from production
  for now)
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

## How it works
Pick a language from the dropdown in the top right, then click a flag to hear
the country's name spoken and see it written.

The interface is separately available in eight languages: English, Arabic,
German, Greek, Swedish, Thai, Turkish and Simplified Chinese.

### URL parameters
The visible flags and languages can be set from the URL, for a shareable view:

- `f` — comma-separated country codes to show, e.g. `?f=us,de,fr`
- `l` — comma-separated language codes to show, e.g. `?l=en,ar`; the **first**
  one is the selected language

Example: `/?f=us,de,fr&l=ar,en` shows only those three flags with Arabic and
English, Arabic selected. The order in each list does not affect the on-screen
order (flags and languages always render in the app's own order).

- Mute (🔊/🔇, right of 🕹️): silences everything — names, game prompts and
  feedback sounds — until clicked again.
- Settings (⚙️ top right): theme (system / light / dark, system is the
  default), flag sort order (🌐 ISO code / 🗣️ selected language / 🎲 random), a language checklist and a flag grid to show/hide anything on the
  main screen (with ✅/⬜ select-all/deselect-all buttons), a flight mode
  toggle (✈️), and cache info (🔊 count and a 🗑️ clear button).
  Saved in localStorage, remembered between visits.
- Flight mode (✈️): downloads all visible sounds to the cache; anything newly
  shown while it is on is downloaded right away. Turning it off keeps the
  cached files.
- Game (🕹️ in the top bar): start a guessing game — a random country name is
  spoken and you tap the matching flag (👍 correct, 👎 wrong). Stuck? The
  give-up button (🤷‍♂️) reveals it (tracked separately from mistakes). It runs
  through every visible country, with your progress (played,
  mistakes, give-ups, time) shown live in the app bar next to the round
  buttons. The prompted name is also written in the display segment (even
  while muted), and the 👂 button plays it again. When every country has been played the round is over — the clock
  freezes and the score stays — but game mode stays on: ⏹️ stops a round that is
  running and ▶️ starts the next, and pressing 🕹️ again leaves game mode. Theme and flight mode
  stay changeable mid-game; the language and country lists are locked, and the
  selected language can be changed only between rounds (after ⏹️ or when a
  round finishes). Needs at least one language and one country visible.
- First visit: the starting language and which languages are shown come from
  your browser's language settings.

## How to contribute
### Media files
To support a new country, one sound file in AAC format is needed per language,
with the spoken country name.

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
  English (Ava), Arabic (Hamed, Saudi — formal MSA), German (Katja),
  Swedish (Sofie), Danish (Christel), Portuguese (Raquel), Turkish (Emel),
  Persian (Dilara) and Ukrainian (Polina), and Google Translate text-to-speech
  for Albanian
