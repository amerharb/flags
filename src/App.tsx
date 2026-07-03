import './App.css'
import React, { useCallback, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import ThemeToggle from './ThemeToggle'
import { Country, Language } from './countries/Country'
import { al } from './countries/al'
import { de } from './countries/de'
import { ps } from './countries/ps'
import { pt } from './countries/pt'
import { se } from './countries/se'
import { sy } from './countries/sy'
import { tn } from './countries/tn'
import { tr } from './countries/tr'
import { us } from './countries/us'

function App() {
	const COUNTRIES: Country[] = [al, de, ps, pt, se, sy, tn, tr, us]
	// language of the displayed and spoken country name
	const LANG: Language = 'en'
	const [spokenName, setSpokenName] = useState('')

	async function getAudio(audioUrl: string) {
		const TTL = 1000 * 60 * 60 * 24 * 7 // 7 days
		if ('caches' in window) {
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
							await audioCache.delete(audioUrl),
							await audioCacheTimestamps.delete(audioUrl),
						])
					} else {
						return cachedResponse
					}
				}
			}

			const response = await fetch(audioUrl)
			// skip caching if response empty
			if (!response.headers.get('Content-Length') || response.headers.get('Content-Length') === '0') {
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

	async function cacheAllAudioFiles() {
		console.time('cacheAllAudioFiles')
		try {
			const audioUrls = COUNTRIES.map(c => `/sounds/${LANG}/${c.code}.aac`)

			await Promise.all([
				caches.delete('audio-cache'),
				caches.delete('audio-cache-timestamps'),
			])
			const [audioCache, audioCacheTimestamps] = await Promise.all([
				caches.open('audio-cache'),
				caches.open('audio-cache-timestamps'),
			])

			await Promise.all(
				audioUrls.map(async url => {
					try {
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
			console.timeEnd('cacheAllAudioFiles')
		}
	}

	const playSound = useCallback(async (code: string) => {
		try {
			const audioUrl = `/sounds/${LANG}/${code}.aac`
			const response = await getAudio(audioUrl)
			const blob = await response.blob()
			const objectUrl = URL.createObjectURL(blob)
			const audio = new Audio(objectUrl)
			await audio.play()
		} catch (e) {
			console.error(e)
		}
	}, [])

	const pageTitle = 'Flags Web'
	return (
		<div className="Flags">
			<ThemeToggle/>
			<h1
				onDoubleClick={() => {
					const h1 = document.querySelector('h1')
					if (!h1) return
					h1.style.backgroundColor = 'darkgreen'
					h1.textContent = 'Downloading...'
					cacheAllAudioFiles().then(() => {
						h1.style.backgroundColor = ''
						h1.textContent = pageTitle
					})
				}}
			>{pageTitle}</h1>
			<hgroup>
				{COUNTRIES.map(c => (
					<button
						key={`country-${c.code}`}
						className="button-flag"
						title={c.name[LANG]}
						onClick={() => {
							playSound(c.code)
							setSpokenName(c.name[LANG])
						}}
					>
						{c.flag}
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
