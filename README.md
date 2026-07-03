[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/amerharb/flags)
# Flags

Small react project to show country flags (as emoji) and pronounce the country
name out loud. Sister project of [Arqaam](https://github.com/amerharb/arqaam).

## Countries supported
- Palestine 🇵🇸
- Syria 🇸🇾
- We are looking for more countries, see How to contribute

## Languages supported
- English (for the spoken country name)

## How it works
Click a flag to hear the country's name spoken. Double-click the title to
pre-download and cache all the audio files for offline use.

## How to contribute
### Media files
All that is needed to support a new country is 1 sound file in AAC format with
the spoken country name in English.

Audio files live under `public/sounds/<lang>/<country-code>.aac`, for example
`public/sounds/en/ps.aac` for Palestine in English.

### Coding
Flags is an open source project built on Create React App, TypeScript v4.9.x
and npm. All the code is Frontend, no backend needed.

To add a country:
1. Create `src/countries/<code>.ts` exporting a `Country` (`code`, `name`, `flag`).
2. Import it and add it to the `COUNTRIES` array in `src/App.tsx`.
3. Drop the audio file at `public/sounds/en/<code>.aac`.

#### Setup environment
- Node 18.x or above
- npm 9.x or above
- Install `npm install`
- Build: `npm run build`
- Start: `npm start`

### Deploying
Once a PR is merged to the main branch it is automatically deployed using the
Vercel integration tool with GitHub.
