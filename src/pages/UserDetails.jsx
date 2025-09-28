import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDetails({ user, setUser, setIsLoggedIn }) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || '',
        telephone: user?.telephone || '',
        address: user?.address || ''
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('https://kajuit.smeltwaarde.co.za/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                alert('Gebruikerinligting gestoor');
            } else {
                alert('Kon nie stoor nie: ' + data.error);
            }
        } catch {
            alert('Netwerkfout: kon nie verbind nie');
        }
    };

    return (
        <div className="container">
            <h2 style={{ color: 'white', textAlign: 'center' }}>Gebruiker Inligting</h2>
            <form className="add-product-form" onSubmit={handleSave}>
                <div className="form-row">
                    <label>Naam:</label>
                    <input name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="form-row">
                    <label>E-pos:</label>
                    <input name="email" value={formData.email} onChange={handleChange} disabled />
                </div>
                <div className="form-row">
                    <label>Rol:</label>
                    <input name="role" value={formData.role} onChange={handleChange} disabled />
                </div>
                <div className="form-row">
                    <label>Telefoon:</label>
                    <input name="telephone" value={formData.telephone} onChange={handleChange} />
                </div>
                <div className="form-row">
                    <label>Adres:</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="form-row" style={{ justifyContent: 'space-between' }}>
                    <button type="submit">Stoor</button>
                    <button type="button" onClick={handleLogout} style={{ backgroundColor: '#d9534f', color: 'white' }}>
                        Teken uit
                    </button>
                </div>
            </form>
        </div>
    );
}