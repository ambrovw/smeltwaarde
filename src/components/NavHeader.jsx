import { NavLink } from 'react-router-dom';
import { FaCoins } from 'react-icons/fa';

import '../styles/components/NavHeader.css';

function NavHeader() {
    return (
        <nav className="nav-header">
            <NavLink to="/silver" className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`} end>
                <span className="nav-symbol" aria-hidden="true">Ag</span>
                <span className="nav-label">Silver</span>
            </NavLink>

            <NavLink to="/gold" className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`}>
                <span className="nav-symbol" aria-hidden="true">Au</span>
                <span className="nav-label">Goud</span>
            </NavLink>

            <NavLink to="/muntHoeveelhede" className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`}>
                <FaCoins title="Munt Hoeveelhede" />
            </NavLink>
        </nav>
    );
}

export default NavHeader;