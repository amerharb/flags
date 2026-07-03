export type Language = 'en' | 'ar' | 'de' | 'sv'

export type Country = {
    code: string,
    name: Record<Language, string>,
    flag: string,
}
