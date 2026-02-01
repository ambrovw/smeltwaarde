import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import MetalTabs from './components/MetalTabs.jsx';
import MuntHoeveelhede from './components/MuntHoeveelhede.jsx';
import NavHeader from './components/NavHeader';

function App() {
    return (
        <Router>
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