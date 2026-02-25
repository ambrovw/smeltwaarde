import { createContext, useCallback, useContext, useState } from 'react';
import { af, en } from './translations.js';

const translations = { af, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        try {
            const saved = localStorage.getItem('lang');
            return saved === 'en' ? 'en' : 'af';
        } catch { return 'af'; }
    });

    const setLang = useCallback((newLang) => {
        setLangState(newLang);
        try { localStorage.setItem('lang', newLang); } catch {}
    }, []);

    const t = useCallback((key) => {
        return translations[lang]?.[key] ?? translations.af[key] ?? key;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
