import { NavLink } from 'react-router-dom';
import {
    FaCalculator,
    FaCoins,
    FaStore,
    FaBoxOpen,
    FaUser,
    FaUserPlus,
    FaShoppingCart, FaClipboardList
} from 'react-icons/fa';

import '../styles/components/NavHeader.css';
import { useCart } from '../contexts/CartContext';

function NavHeader({ role, isLoggedIn }) {
    const { cartItems } = useCart();
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
                    <NavLink to="/orders" className="nav-element">
                        <FaClipboardList title="Bestellings" />
                    </NavLink>

                    <NavLink to="/userDetails" className="nav-element">
                        <FaUser title="Gebruiker" />
                    </NavLink>

                    <NavLink to="/cart" className={`nav-element ${cartItems.length > 0 ? 'cart-active' : ''}`}>
                        <FaShoppingCart title="Waentjie" />
                    </NavLink>
                </>
            ) : (
                <NavLink to="/login" className="nav-element">
                    <FaUserPlus title="Meld aan" />
                </NavLink>
            )}
        </nav>
    );
}

export default NavHeader;