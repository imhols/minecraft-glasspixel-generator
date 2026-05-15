import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Lang } from './translations'
import { translations } from './translations'

interface LangContextType {
  lang: Lang
  t: (key: string, params?: Record<string, string | number>) => string
  toggleLang: () => void
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh')

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[lang][key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }

  const toggleLang = () => setLang(prev => (prev === 'zh' ? 'en' : 'zh'))

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
