import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import SilverCalculator from './pages/SilverCalculator'
import Login from './pages/Login';
import MuntHoeveelhede from './pages/MuntHoeveelhede'
import './App.css'

function App() {
    return (
        <Router>
            <nav className="nav-header">
                <NavLink to="/" className="nav-element" end>Waarde Berekening</NavLink>
                <NavLink to="/muntHoeveelhede" className="nav-element">Munt Hoeveelhede (onvoltooid)</NavLink>
                <NavLink to="/login" className="nav-element">Teken aan</NavLink>
            </nav>

            <div className="tab-content">
                <Routes>
                    <Route path="/" element={<SilverCalculator />} />
                    <Route path="/muntHoeveelhede" element={<MuntHoeveelhede />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App