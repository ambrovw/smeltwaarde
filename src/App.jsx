import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from 'react-router-dom';
import SilverCalculator from './components/SilverCalculator.jsx';
import MuntHoeveelhede from './components/MuntHoeveelhede.jsx';
import ProductManager from './components/ProductManager.jsx';
import Login from './components/Login.jsx';
import UserDetails from './components/UserDetails.jsx';
import Shop from './components/Shop.jsx';
import { useState, useEffect } from 'react';
import NavHeader from './components/NavHeader';

function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
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
                    localStorage.removeItem('token');
                }
            })
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Router>
            {loading ? (
                <div>Laai gebruiker...</div>
            ) : (
                <InnerApp
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    user={user}
                    setUser={setUser}
                />
            )}
        </Router>
    );
}

function InnerApp({ isLoggedIn, setIsLoggedIn, user, setUser }) {
    const location = useLocation();
    const role = user?.role || 'guest';

    return (
        <div>
            <NavHeader role={role} isLoggedIn={isLoggedIn} />
            <div key={location.pathname}>
                <Routes>
                    <Route path="/" element={<SilverCalculator />} />
                    <Route path="/muntHoeveelhede" element={<MuntHoeveelhede />} />
                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
                    <Route path="/userDetails" element={<UserDetails user={user} setUser={setUser} setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/products" element={role === 'admin' ? <ProductManager /> : <Navigate to="/" />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;