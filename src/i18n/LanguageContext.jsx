import { createContext, useCallback, useContext, useState } from 'react';
import { af, en } from './translations.js';
import { setUserProperty } from '../analytics.js';

const translations = { af, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        try {
            const saved = localStorage.getItem('lang');
            if (saved) { setUserProperty('language', saved); return saved; }
            const defaultLang = window.location.hostname === 'meltvalue.co.za' ? 'en' : 'af';
            setUserProperty('language', defaultLang);
            return defaultLang;
        } catch { return 'af'; }
    });

    const setLang = useCallback((newLang) => {
        setLangState(newLang);
        setUserProperty('language', newLang);
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
