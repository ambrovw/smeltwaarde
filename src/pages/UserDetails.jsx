import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDetails() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: '', email: '' });

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser({ name: parsed.name || '', email: parsed.email || '' });
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
        <div className="user-details-form">
            <h2>Jou Profiel</h2>
            <label>
                Naam:
                <input type="text" name="name" value={user.name} onChange={handleChange} />
            </label>
            <label>
                E-pos:
                <input type="email" name="email" value={user.email} onChange={handleChange} />
            </label>

            <div style={{ marginTop: '2rem' }}>
                <button onClick={handleSave}>Stoor</button>
                <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Teken uit</button>
            </div>
        </div>
    );
}