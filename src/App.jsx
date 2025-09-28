import {
    BrowserRouter as Router,
    Routes,
    Route,
    NavLink,
    useLocation,
    Navigate
} from 'react-router-dom';
import SilverCalculator from './pages/SilverCalculator';
import MuntHoeveelhede from './pages/MuntHoeveelhede';
import ProductManager from './pages/ProductManager';
import Login from './pages/Login';
import UserDetails from './pages/UserDetails';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ name: '', email: '', role: 'guest' });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        fetch('https://kajuit.smeltwaarde.co.za/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            })
            .catch(() => setIsLoggedIn(false))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Router>
            {loading ? (
                <div className="loading">Laai gebruiker...</div>
            ) : (
                <InnerApp
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    user={user}
                />
            )}
        </Router>
    );
}

function InnerApp({ isLoggedIn, setIsLoggedIn, user }) {
    const location = useLocation();
    const role = user?.role || 'guest';

    return (
        <>
            <nav className="nav-header">
                <NavLink to="/" className="nav-element" end>
                    Waarde Berekening
                </NavLink>

                <NavLink to="/muntHoeveelhede" className="nav-element">
                    Munt Hoeveelhede (onvoltooid)
                </NavLink>

                {role === 'admin' && (
                    <NavLink to="/products" className="nav-element">
                        Produkte
                    </NavLink>
                )}

                {isLoggedIn ? (
                    <NavLink to="/userDetails" className="nav-element">
                        Gebruiker
                    </NavLink>
                ) : (
                    <NavLink to="/login" className="nav-element">
                        Meld aan
                    </NavLink>
                )}
            </nav>

            <div className="tab-content" key={location.pathname}>
                <Routes>
                    <Route path="/" element={<SilverCalculator />} />
                    <Route path="/muntHoeveelhede" element={<MuntHoeveelhede />} />
                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/userDetails" element={<UserDetails />} />
                    <Route
                        path="/products"
                        element={role === 'admin' ? <ProductManager /> : <Navigate to="/" />}
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </>
    );
}

export default App;