// 'xa' is a fictional language code standing for the country's national anthem:
// the name holds the anthem title in its native language, and it plays a
// recorded performance.
export type Language = 'en' | 'ar' | 'de' | 'sv' | 'da' | 'sq' | 'pt' | 'tr' | 'fa' | 'uk' | 'xa'

export type Country = {
    code: string,
    name: Record<Language, string>,
    flag: string,
    // when true, only shown in development / beta builds, hidden in production
    beta?: boolean,
}
