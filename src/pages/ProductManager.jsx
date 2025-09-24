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
        <div className="product-manager">
            <h2>Produkbestuur</h2>

            <div className="form-section">
                <input name="name" placeholder="Naam" value={form.name} onChange={handleChange} />
                <input name="category" placeholder="Kategorie" value={form.category} onChange={handleChange} />
                <textarea name="description" placeholder="Beskrywing" value={form.description} onChange={handleChange} />
                <input name="price" type="number" step="0.01" placeholder="Prys" value={form.price} onChange={handleChange} />
                <input name="quantity" type="number" placeholder="Hoeveelheid" value={form.quantity} onChange={handleChange} />
                <input name="images" placeholder="Beeld URLs (komma geskei)" value={form.images} onChange={handleChange} />
                <label>
                    <input name="enabled" type="checkbox" checked={form.enabled} onChange={handleChange} />
                    Aktief
                </label>
                <button onClick={handleSubmit}>Stoor Produk</button>
            </div>

            <hr />

            <h3>Bestaande Produkte</h3>
            <ul className="product-list">
                {products.map(p => (
                    <li key={p._id}>
                        <strong>{p.name}</strong> – {p.price} ZAR – {p.enabled ? '✅ Aktief' : '🚫 Nie sigbaar nie'}
                        <button onClick={() => toggleEnabled(p._id, p.enabled)}>
                            {p.enabled ? 'Deaktiveer' : 'Aktiveer'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}