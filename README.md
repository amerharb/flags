[![Version](https://img.shields.io/badge/version-0.10.0-blue.svg)](https://github.com/amerharb/flags)
# Flags

Small react project to show country flags (as emoji) and pronounce the country
name out loud in the selected language, or play the national anthem.
Sister project of [Arqaam](https://github.com/amerharb/arqaam).

## Countries supported
- Albania 🇦🇱
- Denmark 🇩🇰
- Germany 🇩🇪
- Palestine 🇵🇸
- Portugal 🇵🇹
- Sweden 🇸🇪
- Syria 🇸🇾
- Tunisia 🇹🇳
- Turkey 🇹🇷
- United States of America 🇺🇸
- We are looking for more countries, see How to contribute

## Languages supported
- Albanian
- Arabic
- Danish
- English
- German
- Swedish
- National Anthem (fictional language code `xa`: shows the anthem title in its
  native language and plays the anthem itself)

## How it works
Pick a language from the dropdown in the top right, then click a flag to hear
the country's name spoken (or its anthem played) and see it written.

- Theme toggle: system / light / dark mode, remembered between visits.
- Double-click the title to pre-download and cache all the audio files for
  offline use.

## How to contribute
### Media files
To support a new country, one sound file in AAC format is needed per language,
with the spoken country name (or the anthem for `xa`).

Audio files live under `public/sounds/<lang>/<country-code>.aac`, for example
`public/sounds/en/ps.aac` for Palestine in English.

### Coding
Flags is an open source project built on Vite, React 19, TypeScript v6.x
and npm. All the code is Frontend, no backend needed.

To add a country:
1. Create `src/countries/<code>.ts` exporting a `Country` (`code`, `name`, `flag`)
   with the name in every supported language.
2. Import it and add it to the `COUNTRIES` array in `src/App.tsx`.
3. Drop the audio files at `public/sounds/<lang>/<code>.aac`.

To add a language:
1. Add its code to the `Language` type in `src/countries/Country.ts` —
   TypeScript will then point out every country file missing the new name.
2. Add it to the `LANGUAGES` array in `src/App.tsx`.
3. Drop the audio files at `public/sounds/<lang>/<code>.aac`.

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
- Country name pronunciations: macOS text-to-speech (Anna for German,
  Alva for Swedish, Sara for Danish), Microsoft Edge neural text-to-speech
  for English (Ava) and Arabic (Amany, Syrian Arabic), and Google Translate
  text-to-speech for Albanian
- National anthem recordings: [Wikimedia Commons](https://commons.wikimedia.org/)
  public-domain uploads, including performances by the United States Navy Band
  and the USAREUR Band
