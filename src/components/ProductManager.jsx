import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ProductFormModal from './ProductFormModal';
import '../styles/components/ProductManager.css';

export default function ProductManager() {
    const token = localStorage.getItem('token');
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        quantity: '',
        images: [],
        enabled: true,
        purity: '',
        weight: ''
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showRemovedPopup, setShowRemovedPopup] = useState(false);

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

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            category: product.category,
            description: product.description,
            priceOffsetPercent: product.priceOffsetPercent.toString(),
            quantity: product.quantity.toString(),
            images: Array.isArray(product.images) ? product.images.filter(img => img.trim() !== '') : [],
            enabled: product.enabled
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        const payload = {
            ...form,
            priceOffsetPercent: parseFloat(form.priceOffsetPercent),
            quantity: parseInt(form.quantity),
            images: Array.isArray(form.images)
                ? form.images.filter(s => s.trim() !== '')
                : [],
            purity: form.purity,
            weight: form.weight
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
                headers: { 'Authorization': `Bearer ${token}` },
                body: imageForm
            });

            const imageData = await imageRes.json();
            if (imageData.success) {
                newProduct.images = imageData.images;
            }
        }

        setProducts(prev => [newProduct, ...prev]);
        setForm({
            name: '',
            category: '',
            description: '',
            priceOffsetPercent: '',
            quantity: '',
            images: [],
            enabled: true
        });
        setUploadedFiles([]);
        setShowModal(false);
        triggerPopup(setShowSuccessPopup);
    };

    const handleUpdate = async () => {
        const payload = {
            ...form,
            priceOffsetPercent: parseFloat(form.priceOffsetPercent),
            quantity: parseInt(form.quantity),
            purity: parseFloat(form.purity),
            weight: parseFloat(form.weight),
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
                headers: { 'Authorization': `Bearer ${token}` },
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
        setForm(prev => ({ ...prev, images: updatedProduct.images }));
        setShowModal(false);
        setUploadedFiles([]);
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Is jy seker jy wil hierdie produk verwyder?')) return;

        const res = await fetch(`https://kajuit.smeltwaarde.co.za/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (data.success) {
            triggerPopup(setShowRemovedPopup);
            setProducts(prev => prev.filter(p => p._id !== id));
        } else {
            alert('Kon nie verwyder nie: ' + data.error);
        }
    };

    return (
        <div className="scroll-wrapper">

            <div className="container">
                <h1>Produkbestuur</h1>
                <hr/>
                <button className="action-button save" onClick={handleNewClick}>Nuwe produk</button>

                <h3 className="section-header">Bestaande Produkte</h3>
                <table className="product-table">
                    <thead>
                    <tr>
                        <th>Naam</th>
                        <th>Kategorie</th>
                        <th>Prys Afwyking</th>
                        <th>Hoeveelheid</th>
                        <th>Sigbaarheid</th>
                        <th>Beheer</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product) => (
                        <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>
                                {product.priceOffsetPercent !== undefined
                                    ? `${product.priceOffsetPercent > 0 ? '+' : ''}${product.priceOffsetPercent}%`
                                    : '—'}
                            </td>
                            <td>{product.quantity}</td>
                            <td>{product.enabled ? '✅ Sigbaar' : '🚫 Verskuil'}</td>
                            <td>
                                <button className="action-button save" onClick={() => handleEditClick(product)}>Wysig
                                </button>
                                <button
                                    className="action-button delete"
                                    onClick={() => deleteProduct(product._id)}
                                    style={{marginLeft: '0.5rem'}}
                                >
                                    Verwyder
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {showModal &&
                    ReactDOM.createPortal(
                        <ProductFormModal
                            form={form}
                            setForm={setForm}
                            editingProduct={editingProduct}
                            handleSubmit={handleSubmit}
                            handleUpdate={handleUpdate}
                            showModal={showModal}
                            setShowModal={setShowModal}
                            uploadedFiles={uploadedFiles}
                            setUploadedFiles={setUploadedFiles}
                            setSelectedImage={setSelectedImage}
                        />,
                        document.getElementById('modal-root')
                    )
                }

                {showSuccessPopup && <div className="success-popup">✅ Produk gestoor!</div>}
                {showRemovedPopup && <div className="success-popup">✅ Produk verwyder!</div>}
            </div>

        </div>
    );
}