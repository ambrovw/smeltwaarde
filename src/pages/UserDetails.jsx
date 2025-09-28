import { useNavigate } from 'react-router-dom';

export default function UserDetails({ user, setUser, setIsLoggedIn }) {
    const navigate = useNavigate();

    if (!user) return <div>Geen gebruiker ingelog nie.</div>;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <div className="user-container">
            <h2>Gebruiker Inligting</h2>
            <p><strong>Naam:</strong> {user.name}</p>
            <p><strong>E-pos:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.role}</p>
            <button onClick={handleLogout} className="logout-button">
                Teken uit
            </button>
        </div>
    );
}