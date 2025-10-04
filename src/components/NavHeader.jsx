import { NavLink } from 'react-router-dom';
import {
    FaCalculator,     // Waarde Berekening
    FaCoins,          // Munt Hoeveelhede
    FaStore,          // Winkel
    FaBoxOpen,        // Produkte (admin only)
    FaUser,           // Gebruiker
    FaSignInAlt,      // Meld aan
    FaShoppingCart    // Trolley
} from 'react-icons/fa';
import '../styles/components/NavHeader.css';

function NavHeader({ role, isLoggedIn }) {
    return (
        <nav className="nav-header">
            <NavLink to="/" className="nav-element" end>
                <FaCalculator title="Waarde Berekening" />
            </NavLink>

            <NavLink to="/muntHoeveelhede" className="nav-element">
                <FaCoins title="Munt Hoeveelhede" />
            </NavLink>

            <NavLink to="/shop" className="nav-element">
                <FaStore title="Winkel" />
            </NavLink>

            {role === 'admin' && (
                <NavLink to="/products" className="nav-element">
                    <FaBoxOpen title="Produkte" />
                </NavLink>
            )}

            {isLoggedIn ? (
                <>
                    <NavLink to="/userDetails" className="nav-element">
                        <FaUser title="Gebruiker" />
                    </NavLink>
                    <NavLink to="/cart" className="nav-element">
                        <FaShoppingCart title="Waentjie" />
                    </NavLink>
                </>
            ) : (
                <NavLink to="/login" className="nav-element">
                    <FaSignInAlt title="Meld aan" />
                </NavLink>
            )}
        </nav>
    );
}

export default NavHeader;