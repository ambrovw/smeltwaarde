import {
    BrowserRouter as Router,
    Routes,
    Route,
    NavLink,
    useLocation
} from 'react-router-dom';
import SilverCalculator from './pages/SilverCalculator';
import MuntHoeveelhede from './pages/MuntHoeveelhede';
import Login from './pages/Login';
import UserDetails from './pages/UserDetails';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!user);
    }, []);

    return (
        <Router>
            <InnerApp isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        </Router>
    );
}

function InnerApp({ isLoggedIn, setIsLoggedIn }) {
    const location = useLocation();

    return (
        <>
            <nav className="nav-header">
                <NavLink to="/" className="nav-element" end>
                    Waarde Berekening
                </NavLink>
                <NavLink to="/muntHoeveelhede" className="nav-element">
                    Munt Hoeveelhede (onvoltooid)
                </NavLink>
                {isLoggedIn ? (
                    <NavLink to="/userDetails" className="nav-element">
                        Gebruiker
                    </NavLink>
                ) : (
                    <NavLink to="/login" className="nav-element">
                        Aanmelding
                    </NavLink>
                )}
            </nav>

            <div className="tab-content" key={location.pathname}>
                <Routes>
                    <Route path="/" element={<SilverCalculator />} />
                    <Route path="/muntHoeveelhede" element={<MuntHoeveelhede />} />
                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/userDetails" element={<UserDetails />} />
                </Routes>
            </div>
        </>
    );
}

export default App;