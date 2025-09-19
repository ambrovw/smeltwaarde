import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import SilverCalculator from './pages/SilverCalculator'
import MuntHoeveelhede from './pages/MuntHoeveelhede'
import './App.css'

function App() {
    return (
        <Router>
            <nav className="nav-header">
                <NavLink to="/" className="nav-element" end>Waarde Berekening</NavLink>
                <NavLink to="/muntHoeveelhede" className="nav-element">Munt Hoeveelhede (onvoltooid)</NavLink>
                <NavLink to="/settings" className="nav-element">Instellings</NavLink>
            </nav>

            <div className="tab-content">
                <Routes>
                    <Route path="/" element={<SilverCalculator />} />
                    <Route path="/muntHoeveelhede" element={<MuntHoeveelhede />} />
                    <Route path="/settings" element={<div><h2>Instellings</h2><p>Pas jou voorkeure aan hier.</p></div>} />
                </Routes>
            </div>
        </Router>
    )
}

export default App