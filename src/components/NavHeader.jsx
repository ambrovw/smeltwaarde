import { NavLink } from 'react-router-dom';
import { FaCoins } from 'react-icons/fa';

import '../styles/components/NavHeader.css';

function NavHeader() {
    // Helper function to send GA event
    const handleTabClick = (tabName) => {
        if (window.gtag) {
            window.gtag('event', 'tab_click', {
                event_category: 'Navigation',
                event_label: tabName,
            });
        }
    };

    return (
        <nav className="nav-header">
            <NavLink
                to="/silver"
                className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`}
                end
                onClick={() => handleTabClick('Silwer')}
            >
                <span className="nav-symbol" aria-hidden="true">Ag</span>
                <span className="nav-label">Silwer</span>
            </NavLink>

            <NavLink
                to="/gold"
                className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick('Goud')}
            >
                <span className="nav-symbol" aria-hidden="true">Au</span>
                <span className="nav-label">Goud</span>
            </NavLink>

            <NavLink
                to="/muntHoeveelhede"
                className={({ isActive }) => `nav-element ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick('Munt Hoeveelhede')}
            >
                <FaCoins title="Munt Hoeveelhede" />
            </NavLink>
        </nav>
    );
}

export default NavHeader;