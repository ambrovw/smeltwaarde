import { NavLink } from 'react-router-dom';
import '../styles/components/NavHeader.css';

function NavHeader({ role, isLoggedIn }) {
    return (
        <nav className="nav-header">
            <NavLink to="/" className="nav-element" end>
                Waarde Berekening
            </NavLink>

            <NavLink to="/muntHoeveelhede" className="nav-element">
                Munt Hoeveelhede
            </NavLink>

            <NavLink to="/shop" className="nav-element">
                Winkel
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
    );
}

export default NavHeader;