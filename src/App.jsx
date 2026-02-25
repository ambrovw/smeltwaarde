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

function AnnouncementBanner() {
    const { t } = useLanguage();
    const msg = `⚒️ ${t('banner')}\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0`;
    const repeated = (msg).repeat(5);
    return (
        <div className="announcement-banner">
            <div className="announcement-banner__track">
                <span>{repeated}</span>
                <span>{repeated}</span>
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
