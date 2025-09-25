import { useState, useEffect } from 'react';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        quantity: '',
        images: '',
        enabled: true
    });

    useEffect(() => {
        fetch('https://kajuit.smeltwaarde.co.za/api/products/all')
            .then(res => res.json())
            .then(data => setProducts(data.products || []));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        const payload = {
            ...form,
            price: parseFloat(form.price).toFixed(2),
            quantity: parseInt(form.quantity),
            images: form.images.split(',').map(s => s.trim())
        };

        const res = await fetch('https://kajuit.smeltwaarde.co.za/api/products/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            alert('Produk gestoor!');
            setProducts(prev => [...prev, data.product]);
            setForm({
                name: '',
                category: '',
                description: '',
                price: '',
                quantity: '',
                images: '',
                enabled: true
            });
        } else {
            alert('Kon nie stoor nie: ' + data.error);
        }
    };

    const toggleEnabled = async (id, current) => {
        const res = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: !current })
        });

        const data = await res.json();
        if (data.success) {
            setProducts(prev =>
                prev.map(p => (p._id === id ? { ...p, enabled: !current } : p))
            );
        }
    };

    return (
        <div className="container">
            <h1>Produkbestuur</h1>

            <div className="form-section">
                {/* Form inputs */}
            </div>

            <hr />

            <h3 className="section-header">Bestaande Produkte</h3>
            <table className="product-table">
                <thead>
                <tr>
                    <th>Naam</th>
                    <th>Kategorie</th>
                    <th>Prys</th>
                    <th>Hoeveelheid</th>
                    <th>Status</th>
                    <th>Beheer</th>
                </tr>
                </thead>
                <tbody>
                {products.map(p => (
                    <tr key={p._id} className={p.enabled ? 'highlight-row' : ''}>
                        <td>{p.name}</td>
                        <td>{p.category}</td>
                        <td className="price">{p.price.toFixed(2)} ZAR</td>
                        <td>{p.quantity}</td>
                        <td className="highlight-cell">{p.enabled ? '✅ Aktief' : '🚫 Nie sigbaar nie'}</td>
                        <td>
                            <button className="action-button" onClick={() => toggleEnabled(p._id, p.enabled)}>
                                {p.enabled ? 'Deaktiveer' : 'Aktiveer'}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}