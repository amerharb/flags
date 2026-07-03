export type Language = 'en' | 'ar'

export type Country = {
    code: string,
    name: Record<Language, string>,
    flag: string,
}
