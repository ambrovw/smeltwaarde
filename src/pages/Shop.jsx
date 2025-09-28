import { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

export default function Shop() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('https://kajuit.smeltwaarde.co.za/api/products/all')
            .then(res => res.json())
            .then(data => {
                if (data.success) setProducts(data.products);
            });
    }, []);

    return (
        <div className="container">
            <h1>Winkel</h1>
            <hr />

            <h3 className="section-header">Beskikbare Produkte</h3>
            <PhotoProvider maskOpacity={0.85}>
                <table className="product-table">
                    <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Naam</th>
                        <th>Kategorie</th>
                        <th>Prys</th>
                        <th>Beskrywing</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.filter(product => product.enabled).map(product => (
                        <tr key={product._id} className={product.enabled ? 'highlight-row' : ''}>
                            <td>
                                <PhotoProvider>
                                    {/* Visible preview: only the first image */}
                                    <PhotoView src={`https://kajuit.smeltwaarde.co.za/uploads/${product.images[0]}`}>
                                        <img
                                            src={`https://kajuit.smeltwaarde.co.za/uploads/${product.images[0]}`}
                                            alt={`${product.name} preview`}
                                            className="image-preview"
                                            style={{ cursor: 'zoom-in' }}
                                        />
                                    </PhotoView>

                                    {product.images.slice(1).map((img, index) => (
                                        <PhotoView
                                            key={index}
                                            src={`https://kajuit.smeltwaarde.co.za/uploads/${img}`}
                                        >
                                            <span style={{ display: 'none' }} />
                                        </PhotoView>
                                    ))}
                                </PhotoProvider>
                            </td>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>R{product.price.toFixed(2)}</td>
                            <td>{product.description}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </PhotoProvider>
        </div>
    );
}