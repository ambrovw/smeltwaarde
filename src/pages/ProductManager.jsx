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
            setForm({ name: '', category: '', description: '', price: '', quantity: '', images: '', enabled: true });

            // ✅ Now upload images using returned product ID
            if (uploadedFiles.length > 0) {
                const imageForm = new FormData();
                uploadedFiles.forEach(file => imageForm.append('images', file));

                await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${data.product._id}/images`, {
                    method: 'POST',
                    body: imageForm
                });
            }

            setUploadedFiles([]);
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

    const deleteProduct = async (id) => {
        if (!window.confirm('Is jy seker jy wil hierdie produk verwyder?')) return;

        const res = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (data.success) {
            alert('Produk verwyder!');
            setProducts(prev => prev.filter(p => p._id !== id));
        } else {
            alert('Kon nie verwyder nie: ' + data.error);
        }
    };

    const [editingProduct, setEditingProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price.toString(),
            quantity: product.quantity.toString(),
            images: product.images.join(', '),
            enabled: product.enabled
        });
        setShowModal(true);
    };
    const handleUpdate = async () => {
        const payload = {
            ...form,
            price: parseFloat(form.price).toFixed(2),
            quantity: parseInt(form.quantity),
            images: form.images.split(',').map(s => s.trim())
        };

        const res = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${editingProduct._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            alert('Produk opgedateer!');
            setProducts(prev =>
                prev.map(p => (p._id === editingProduct._id ? data.product : p))
            );
            setShowModal(false);
            setEditingProduct(null);
        } else {
            alert('Kon nie opdateer nie: ' + data.error);
        }
    };

    const handleNewClick = () => {
        setEditingProduct(null); // no product being edited
        setForm({
            name: '',
            category: '',
            description: '',
            price: '',
            quantity: '',
            images: '',
            enabled: true
        });
        setShowModal(true);
    };

    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(files);

        // Optional: preview or upload logic here
        // Example: convert to base64 or send to backend
    };

    return (
        <div className="container">
            <h1>Produkbestuur</h1>

            <hr />

            <button className="action-button save" onClick={handleNewClick}>Nuwe produk</button>

            <h3 className="section-header">Bestaande Produkte</h3>
            <table className="product-table">
                <thead>
                <tr>
                    <th>Naam</th>
                    <th>Kategorie</th>
                    <th>Prys</th>
                    <th>Hoeveelheid</th>
                    <th>Sigbaarheid</th>
                    <th>Beheer</th>
                </tr>
                </thead>
                <tbody>
                {products.map(p => (
                    <tr key={p._id} className={p.enabled ? 'highlight-row' : ''}>
                        <td>{p.name}</td>
                        <td>{p.category}</td>
                        <td>R{p.price.toFixed(2)}</td>
                        <td>{p.quantity}</td>
                        <td className="highlight-cell">{p.enabled ? '✅ Sigbaar' : '🚫 Verskuil'}</td>
                        <td>
                            <button className="action-button save" onClick={() => handleEditClick(p)}>
                                Wysig
                            </button>
                            <button className="action-button delete" onClick={() => deleteProduct(p._id)} style={{ marginLeft: '0.5rem' }}>
                                Verwyder
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content form-section add-product-form">
                        <h3 className="section-header">{editingProduct ? 'Wysig Produk' : 'Voeg Nuwe Produk By'}</h3>

                        <div className="form-row">
                            <label htmlFor="name">Naam</label>
                            <input id="name" name="name" value={form.name} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <label htmlFor="category">Kategorie</label>
                            <input id="category" name="category" value={form.category} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <label htmlFor="price">Prys</label>
                            <input id="price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <label htmlFor="quantity">Hoeveelheid</label>
                            <input id="quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <label htmlFor="images">Foto Skakels</label>
                            <input id="images" name="images" value={form.images} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <label htmlFor="photoUpload">Laai Foto Op</label>
                            <input id="photoUpload" type="file" accept="image/*" multiple onChange={handleFileUpload} />
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="image-preview-row">
                                {uploadedFiles.map((file, index) => (
                                    <img key={index} src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="image-preview" />
                                ))}
                            </div>
                        )}

                        <div className="form-row">
                            <label htmlFor="description">Beskrywing</label>
                            <textarea id="description" name="description" value={form.description} onChange={handleChange} />
                        </div>

                        <div className="form-row checkbox-row">
                            <label htmlFor="enabled">Sigbaar</label>
                            <input id="enabled" name="enabled" type="checkbox" checked={form.enabled} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <button className="action-button save" onClick={editingProduct ? handleUpdate : handleSubmit} >
                                {editingProduct ? 'Stoor Veranderinge' : 'Stoor Produk'}
                            </button>
                            <button className="action-button delete" onClick={() => setShowModal(false)}>Kanselleer</button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
}