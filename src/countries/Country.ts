// 'xa' and 'xt' are fictional language codes standing for the country's national anthem:
// the name holds the anthem title in its native language. 'xa' plays a recorded
// performance; 'xt' (🎹) plays a pure-tone rendering of the melody's main notes.
export type Language = 'en' | 'ar' | 'de' | 'sv' | 'da' | 'sq' | 'pt' | 'tr' | 'fa' | 'uk' | 'xa' | 'xt'

export type Country = {
    code: string,
    name: Record<Language, string>,
    flag: string,
    // when true, only shown in development / beta builds, hidden in production
    beta?: boolean,
}
