import React, { useEffect, useState } from 'react';

export default function UserDetails() {
    const [user, setUser] = useState({ name: '', email: '' });

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser({ name: parsed.name || '', email: parsed.email || '' });
        }
    }, []);

    return (
        <div>
            <h2>Gebruiker Inligting</h2>
            <p>Naam: {user.name}</p>
            <p>E-pos: {user.email}</p>
        </div>
    );
}