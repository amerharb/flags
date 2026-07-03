export type Language = 'en' | 'ar' | 'de'

export type Country = {
    code: string,
    name: Record<Language, string>,
    flag: string,
}
