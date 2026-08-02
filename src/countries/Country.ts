// the languages a country name is spoken in
export type Language = 'en' | 'ar' | 'de' | 'sv' | 'da' | 'sq' | 'pt' | 'tr' | 'fa' | 'uk'

export type Country = {
    code: string,
    name: Record<Language, string>,
    flag: string,
    // when true, only shown in development / beta builds, hidden in production
    beta?: boolean,
}
