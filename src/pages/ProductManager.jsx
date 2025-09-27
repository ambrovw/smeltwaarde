import { useState, useEffect } from 'react';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showRemovedPopup, setShowRemovedPopup] = useState(false);
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
            images: Array.isArray(form.images)
                ? form.images.filter(s => s.trim() !== '')
                : []
        };

        const res = await fetch('https://kajuit.smeltwaarde.co.za/api/products/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!data.success) {
            alert('Kon nie stoor nie: ' + data.error);
            return;
        }

        let newProduct = data.product;

        if (uploadedFiles.length > 0) {
            const imageForm = new FormData();
            uploadedFiles.forEach(file => imageForm.append('images', file));

            const imageRes = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${newProduct._id}/images`, {
                method: 'POST',
                body: imageForm
            });

            const imageData = await imageRes.json();
            if (imageData.success) { newProduct.images = imageData.images; }
        }

        setProducts(prev => [newProduct, ...prev]);
        setForm({
            name: '',
            category: '',
            description: '',
            price: '',
            quantity: '',
            images: [],
            enabled: true
        });
        setUploadedFiles([]);
        setShowModal(false);
        setShowSuccessPopup(true);
        setTimeout(() => {
            const popup = document.querySelector('.success-popup');
            if (popup) popup.classList.add('fade-out');
        }, 800); // Start fade-out halfway through
        setTimeout(() => {
            setShowSuccessPopup(false);
        }, 1600); // Unmount after animation completes
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Is jy seker jy wil hierdie produk verwyder?')) return;

        const res = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (data.success) {
            setShowRemovedPopup(true);
            setTimeout(() => {
                const popup = document.querySelector('.success-popup');
                if (popup) popup.classList.add('fade-out');
            }, 800); // Start fade-out halfway through
            setTimeout(() => {
                setShowRemovedPopup(false);
            }, 1600); // Unmount after animation completes

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
            images: Array.isArray(product.images) ? product.images.filter(img => img.trim() !== '') : [],
            enabled: product.enabled
        });
        setShowModal(true);
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price).toFixed(2),
                quantity: parseInt(form.quantity),
                images: Array.isArray(form.images)
                    ? form.images.filter(img => img.trim() !== '')
                    : []
            };

            const res = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${editingProduct._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!data.success) {
                alert('Kon nie opdateer nie: ' + data.error);
                return;
            }

            let updatedProduct = data.product;

            if (uploadedFiles.length > 0) {
                const formData = new FormData();
                uploadedFiles.forEach(file => formData.append('images', file));

                const imageRes = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${editingProduct._id}/images`, {
                    method: 'POST',
                    body: formData
                });

                const imageData = await imageRes.json();
                if (!imageData.success) {
                    alert('Foto-oplaai het misluk: ' + imageData.error);
                    return;
                }

                updatedProduct.images = [
                    ...(updatedProduct.images || []).filter(img => img.trim() !== ''),
                    ...imageData.images
                ];
            }

            setShowSuccessPopup(true);
            setTimeout(() => {
                const popup = document.querySelector('.success-popup');
                if (popup) popup.classList.add('fade-out');
            }, 800); // Start fade-out halfway through
            setTimeout(() => {
                setShowSuccessPopup(false);
            }, 1600); // Unmount after animation completes

            setProducts(prev =>
                prev.map(p => (p._id === editingProduct._id ? updatedProduct : p))
            );
            setEditingProduct(updatedProduct);
            setForm(prev => ({
                ...prev,
                images: updatedProduct.images
            }));
            setShowModal(false);
            setUploadedFiles([]);
        } catch (err) {
            console.error('Update error:', err);
            alert('Onverwagte fout tydens opdatering');
        }
    };

    const handleNewClick = () => {
        setEditingProduct(null);
        setForm({
            name: '',
            category: '',
            description: '',
            price: '',
            quantity: '',
            images: [],
            enabled: true
        });
        setUploadedFiles([]);
        setShowModal(true);
    };

    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleFileUpload = (e) => {
        const newFiles = Array.from(e.target.files);
        setUploadedFiles(prev => [...prev, ...newFiles]);
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
                            <input
                                id="images"
                                name="images"
                                value={Array.isArray(form.images) ? form.images.join(', ') : ''}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        images: e.target.value
                                            .split(',')
                                            .map(s => s.trim())
                                            .filter(s => s !== '') // optional: remove empty entries
                                    })
                                }
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="photoUpload">Laai Foto Op</label>
                            <input id="photoUpload" type="file" accept="image/*" multiple onChange={handleFileUpload} />
                        </div>

                        {Array.isArray(form.images) &&
                            !(form.images.length === 1 && form.images[0].trim() === '') && (
                                <div className="image-preview-row">
                                    {form.images.map((filename, index) => (
                                        filename.trim() !== '' && (
                                            <img
                                                key={index}
                                                src={`https://kajuit.smeltwaarde.co.za/uploads/${filename}`}
                                                alt={`Bestaande Foto ${index + 1}`}
                                                className="image-preview"
                                            />
                                        )
                                    ))}
                                </div>
                            )
                        }

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

            {showSuccessPopup && (
                <div className="success-popup">
                    ✅ Produk gestoor!
                </div>
            )}

            {showRemovedPopup && (
                <div className="success-popup">
                    ✅ Produk verwyder!
                </div>
            )}

        </div>

    );
}