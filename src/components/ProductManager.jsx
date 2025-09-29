import {useState, useEffect, useRef} from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import '../styles/components/ProductManager.css';

export default function ProductManager() {
    const token = localStorage.getItem('token');
    const [products, setProducts] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showRemovedPopup, setShowRemovedPopup] = useState(false);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
                headers: {
                    'Authorization': `Bearer ${token}`
                },
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
        triggerPopup(setShowSuccessPopup);
    };

    const triggerPopup = (setter) => {
        setter(true);
        setTimeout(() => {
            const popup = document.querySelector('.success-popup');
            if (popup) popup.classList.add('fade-out');
        }, 800);
        setTimeout(() => {
            setter(false);
        }, 1600);
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Is jy seker jy wil hierdie produk verwyder?')) return;

        const res = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (data.success) {
            triggerPopup(setShowRemovedPopup);

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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
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

            triggerPopup(setShowSuccessPopup);

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

    const handleRemoveImage = (indexToRemove) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setUploadedFiles(prev => [...prev, ...droppedFiles]);
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
                {products.map((product) => (
                    <tr key={product._id} className={product.enabled ? 'highlight-row' : ''}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>R{product.price.toFixed(2)}</td>
                        <td>{product.quantity}</td>
                        <td className="highlight-cell">{product.enabled ? '✅ Sigbaar' : '🚫 Verskuil'}</td>
                        <td>
                            <button className="action-button save" onClick={() => handleEditClick(product)}>
                                Wysig
                            </button>
                            <button className="action-button delete" onClick={() => deleteProduct(product._id)} style={{ marginLeft: '0.5rem' }}>
                                Verwyder
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content form-section add-product-form" onClick={(e) => e.stopPropagation()}>
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
                            <label htmlFor="photoUpload">Fotos</label>
                            <div
                                className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <p>Sleep foto's hierheen of klik om te kies</p>
                                <input
                                    id="photoUpload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                />
                                <button onClick={() => fileInputRef.current.click()} className="action-button">
                                    Kies Foto's
                                </button>
                            </div>
                        </div>

                        {Array.isArray(form.images) && form.images.length > 0 && (
                            <div className="image-preview-row">
                                <PhotoProvider>
                                    {form.images.map((filename, index) => (
                                        filename.trim() !== '' && (
                                            <div key={index} className="image-preview-wrapper">
                                                <PhotoView src={`https://kajuit.smeltwaarde.co.za/uploads/${filename}`}>
                                                    <img
                                                        src={`https://kajuit.smeltwaarde.co.za/uploads/${filename}`}
                                                        alt={`Bestaande Foto ${index + 1}`}
                                                        className="image-preview"
                                                        style={{ cursor: 'zoom-in' }}
                                                    />
                                                </PhotoView>
                                                <button
                                                    className="remove-image-icon"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        )
                                    ))}
                                </PhotoProvider>
                            </div>
                        )}

                        {uploadedFiles.length > 0 && (
                            <div className="image-preview-row">
                                {uploadedFiles.map((file, index) => (
                                    <img key={index}
                                         src={URL.createObjectURL(file)}
                                         alt={`Preview ${index + 1}`}
                                         className="image-preview"
                                         onClick={() => setSelectedImage(URL.createObjectURL(file))}
                                    />
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