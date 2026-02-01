import { NavLink } from 'react-router-dom';
import { FaCalculator, FaCoins } from 'react-icons/fa';

import '../styles/components/NavHeader.css';

function NavHeader() {
    return (
        <nav className="nav-header">
            <NavLink to="/" className="nav-element" end>
                <FaCalculator title="Waarde Berekening" />
            </NavLink>

            <NavLink to="/muntHoeveelhede" className="nav-element">
                <FaCoins title="Munt Hoeveelhede" />
            </NavLink>
        </nav>
    );
}

export default NavHeader;