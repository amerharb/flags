/// <reference types="vite/client" />

interface ImportMetaEnv {
	// Set VITE_SHOW_BETA=true to reveal beta countries/languages in a build.
	readonly VITE_SHOW_BETA?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
