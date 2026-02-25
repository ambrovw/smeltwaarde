import { NavLink } from 'react-router-dom';
import { FaCoins } from 'react-icons/fa';

import '../styles/components/NavHeader.css';
import { trackEvent } from '../analytics.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

function NavHeader() {
    const { lang, setLang, t } = useLanguage();

    const handleTabClick = (tabName) => {
        trackEvent('tab_click', { tab_name: tabName });
    };

    const toggleLang = () => {
        const next = lang === 'af' ? 'en' : 'af';
        setLang(next);
        trackEvent('language_toggle', { language: next });
    };

    return (
        <nav className="nav-header">
            <NavLink
                to="/silver"
                className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`}
                end
                onClick={() => handleTabClick(t('silver'))}
            >
                <span className="nav-symbol" aria-hidden="true">Ag</span>
                <span className="nav-label">{t('silver')}</span>
            </NavLink>

            <NavLink
                to="/gold"
                className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(t('gold'))}
            >
                <span className="nav-symbol" aria-hidden="true">Au</span>
                <span className="nav-label">{t('gold')}</span>
            </NavLink>

            <NavLink
                to="/muntHoeveelhede"
                className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(t('mintageNav'))}
            >
                <FaCoins title={t('mintageNav')} />
            </NavLink>

            <button className="lang-toggle" onClick={toggleLang} title="Toggle language">
                {lang === 'af' ? 'EN' : 'AF'}
            </button>
        </nav>
    );
}

export default NavHeader;
