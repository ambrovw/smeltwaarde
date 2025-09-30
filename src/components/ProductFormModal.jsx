import React, {useState, useRef, useEffect} from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { coins as groupedCoins } from '../coinData.js';

function ProductFormModal({
                              form,
                              setForm,
                              editingProduct,
                              handleSubmit,
                              handleUpdate,
                              showModal,
                              setShowModal,
                              uploadedFiles,
                              setUploadedFiles,
                              setSelectedImage
                          }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const coinOptions = Object.entries(groupedCoins).flatMap(([groupLabel, coinList]) =>
        coinList.map((coin) => ({
            label: `${coin.era} – ${coin.name}`,
            value: `${coin.era}|${coin.name}`,
            purity: coin.purity,
            weight: coin.weight
        }))
    );

    useEffect(() => {
        if (editingProduct) {
            const coinKey = `${editingProduct.category}|${editingProduct.name}`;
            const selected = coinOptions.find(opt => opt.value === coinKey);

            setForm({
                name: editingProduct.name || '',
                category: editingProduct.category || '',
                purity: selected?.purity ?? editingProduct.purity ?? '',
                weight: selected?.weight ?? editingProduct.weight ?? '',
                priceOffsetPercent: editingProduct.priceOffsetPercent?.toString() || '0',
                quantity: editingProduct.quantity?.toString() || '1',
                description: editingProduct.description || '',
                images: editingProduct.images || [],
                enabled: editingProduct.enabled ?? true
            });
        } else {
            setForm({
                name: '',
                category: '',
                purity: '',
                weight: '',
                priceOffsetPercent: '0',
                quantity: '1',
                description: '',
                images: [],
                enabled: true
            });
        }
    }, [editingProduct, coinOptions]);

    if (!showModal) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

    return (
        <div className="scroll-wrapper">

            <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal-content form-section add-product-form" onClick={(e) => e.stopPropagation()}>
                    <h3 className="section-header">{editingProduct ? 'Wysig Produk' : 'Voeg Nuwe Produk By'}</h3>

                    <div className="form-row">
                        <label htmlFor="coinSelect">Kies Munt</label>
                        <select
                            id="coinSelect"
                            value={`${form.category}|${form.name}`}
                            onChange={(e) => {
                                const [era, name] = e.target.value.split('|');
                                const selected = coinOptions.find(opt => opt.value === e.target.value);
                                if (selected) {
                                    setForm(prev => ({
                                        ...prev,
                                        name,
                                        category: era,
                                        purity: selected.purity,
                                        weight: selected.weight
                                    }));
                                }
                            }}
                        >
                            <option value="">— Kies 'n munt —</option>
                            {coinOptions.map((opt, index) => (
                                <option key={index} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="name">Naam</label>
                        <input id="name" name="name" value={form.name} onChange={handleChange}/>
                    </div>

                    <div className="form-row">
                        <label htmlFor="category">Kategorie</label>
                        <input id="category" name="category" value={form.category} onChange={handleChange}/>
                    </div>

                    <div className="form-row">
                        <label htmlFor="priceOffsetPercent">Premie (%)</label>
                        <input
                            id="priceOffsetPercent"
                            name="priceOffsetPercent"
                            type="number"
                            step="0.01"
                            value={form.priceOffsetPercent}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="quantity">Hoeveelheid</label>
                        <input id="quantity" name="quantity" type="number" value={form.quantity}
                               onChange={handleChange}/>
                    </div>

                    <div className="form-row">
                        <label htmlFor="purity">Silwergehalte</label>
                        <input
                            id="purity"
                            name="purity"
                            type="number"
                            step="0.01"
                            value={form.purity}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="weight">Gewig (g)</label>
                        <input
                            id="weight"
                            name="weight"
                            type="number"
                            step="0.01"
                            value={form.weight}
                            onChange={handleChange}
                        />
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
                                        .filter(s => s !== '')
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
                                style={{display: 'none'}}
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
                                                    style={{cursor: 'zoom-in'}}
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
                                <img
                                    key={index}
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
                        <textarea id="description" name="description" value={form.description} onChange={handleChange}/>
                    </div>

                    <div className="form-row checkbox-row">
                        <label htmlFor="enabled">Sigbaar</label>
                        <input id="enabled" name="enabled" type="checkbox" checked={form.enabled}
                               onChange={handleChange}/>
                    </div>

                    <div className="form-row">
                        <button className="action-button save" onClick={editingProduct ? handleUpdate : handleSubmit}>
                            {editingProduct ? 'Stoor Veranderinge' : 'Stoor Produk'}
                        </button>
                        <button className="action-button delete" onClick={() => setShowModal(false)}>Kanselleer</button>
                    </div>
                </div>
            </div>
        </div>
    );
    }

    export default ProductFormModal;