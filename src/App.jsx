import { useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from 'react-router-dom';
import MetalTabs from './components/MetalTabs.jsx';
import MuntHoeveelhede from './components/MuntHoeveelhede.jsx';
import NavHeader from './components/NavHeader';
import { trackPageView } from './analytics.js';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext.jsx';

function PageViewTracker() {
    const location = useLocation();
    useEffect(() => {
        trackPageView(location.pathname, document.title);
    }, [location.pathname]);
    return null;
}

function BannerSegment() {
    const { t, lang } = useLanguage();
    return (
        <>
            {`⚒️ ${t('banner')}\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0`}
            {lang === 'af' && (
                <>
                    <img src="/flags/uk.svg" alt="" className="banner-flag" />
                    {` ${t('bannerEngels')}\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0`}
                </>
            )}
        </>
    );
}

function AnnouncementBanner() {
    const segments = Array.from({ length: 5 }, (_, i) => <BannerSegment key={i} />);
    return (
        <div className="announcement-banner">
            <div className="announcement-banner__track">
                <span>{segments}</span>
                <span>{segments}</span>
            </div>
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <Router>
                <PageViewTracker />
                <AnnouncementBanner />
                <NavHeader />
                <div>
                    <Routes>
                        <Route path="/" element={<MetalTabs />} />
                        <Route path="/silver" element={<MetalTabs initialTab="silver" />} />
                        <Route path="/gold" element={<MetalTabs initialTab="gold" />} />
                        <Route path="/muntHoeveelhede" element={<MuntHoeveelhede />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </LanguageProvider>
    );
}

export default App;
