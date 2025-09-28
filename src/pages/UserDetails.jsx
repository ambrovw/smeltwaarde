import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDetails() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: '', email: '', role: '' });

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser({
                name: parsed.name || '',
                email: parsed.email || '',
                role: parsed.role || 'user'
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('user', JSON.stringify(user));
        alert('Inligting gestoor!');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="container">
            <div className="form-section user-profile-form">
                <h3 className="section-header">Jou Profiel</h3>

                <div className="form-row">
                    <label htmlFor="name">Naam</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={user.name}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="email">E-pos</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={user.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-row">
                    <button className="action-button save" onClick={handleSave}>Stoor</button>
                    <button className="action-button delete" onClick={handleLogout} style={{ marginLeft: '1rem' }}>
                        Teken uit
                    </button>
                </div>
            </div>
        </div>
    );
}