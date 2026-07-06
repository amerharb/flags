// 'xa' is a fictional language code standing for the country's national anthem:
// the name holds the anthem title in its native language, the sound file plays the anthem.
export type Language = 'en' | 'ar' | 'de' | 'sv' | 'da' | 'xa'

export type Country = {
    code: string,
    name: Record<Language, string>,
    flag: string,
}
