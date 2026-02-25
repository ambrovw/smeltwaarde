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

function PageViewTracker() {
    const location = useLocation();
    useEffect(() => {
        trackPageView(location.pathname, document.title);
    }, [location.pathname]);
    return null;
}

function AnnouncementBanner() {
    const msg = '⚒️ Verskoning vir die onlangse stilstand — ons is weer aanlyn en reg om te gaan!\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0';
    // Repeat enough times so each half fills more than the viewport
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
    );
}

export default App;