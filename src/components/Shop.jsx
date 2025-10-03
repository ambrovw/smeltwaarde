import { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import '../styles/components/Shop.css';
import useSilverPrice from '../hooks/useSilverPrice';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const { flashPrice, randPerGram } = useSilverPrice();

    useEffect(() => {
        fetch('https://kajuit.smeltwaarde.co.za/api/products/all')
            .then(res => res.json())
            .then(data => {
                if (data.success) setProducts(data.products);
            });
    }, []);

    return (
        <div className="scroll-wrapper">
            <div className="container">
                <h1>Winkel</h1>
                <hr />
                <h3 className="section-header">Beskikbare Produkte</h3>

                <PhotoProvider maskOpacity={0.85}>
                    <div className="product-grid">
                        {products.filter(product => product.enabled).map(product => {
                            const baseValue = product.purity * product.weight * (randPerGram || 0);
                            const adjustedPrice = baseValue * (1 + product.priceOffsetPercent / 100);

                            return (
                                <div key={product._id} className="product-card">
                                    <PhotoProvider maskOpacity={0.85}>
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <PhotoView src={`https://kajuit.smeltwaarde.co.za/uploads/${product.images[0]}`}>
                                                <img
                                                    src={`https://kajuit.smeltwaarde.co.za/uploads/${product.images[0]}`}
                                                    alt={`${product.name} preview`}
                                                    className="shop-image-preview"
                                                    style={{ cursor: 'zoom-in', display: 'block' }}
                                                />
                                            </PhotoView>

                                            {(product.priceOffsetPercent === 0 || product.priceOffsetPercent === null) && (
                                                <img
                                                    src="/teen-smelt.png"
                                                    alt="Teen Smelt"
                                                    className="shop-ribbon"
                                                />
                                            )}

                                            {product.priceOffsetPercent < 0 && (
                                                <img
                                                    src="/onder-smelt.png"
                                                    alt="Onder Smelt"
                                                    className="shop-ribbon"
                                                />
                                            )}
                                        </div>

                                        {product.images.slice(1).map((img, index) => (
                                            <PhotoView key={index} src={`https://kajuit.smeltwaarde.co.za/uploads/${img}`}>
                                                <span style={{ display: 'none' }} />
                                            </PhotoView>
                                        ))}
                                    </PhotoProvider>

                                    <div className="product-info">
                                        <div className="product-heading">{product.heading}</div>

                                        <div className={`price-columns ${flashPrice ? ' flash' : ''}`}>
                                            {randPerGram !== null ? `R${adjustedPrice.toFixed(2)}` : 'Laai...'}
                                        </div>

                                        <div className="product-premie">
                                            <span className="label">Premie:</span>{' '}
                                            {product.priceOffsetPercent != null ? `${product.priceOffsetPercent}%` : '0%'}
                                        </div>

                                        <div className="product-purity">
                                            <span className="label">Fynheid:</span>{' '}
                                            {`${(product.purity * 100).toFixed(3).replace(/\.?0+$/, '')}%`}
                                        </div>

                                        <div className="product-description">
                                            {product.description.split('\n').map((line, index) => (
                                                <span key={index}>
                                                  <em>{line}</em>
                                                  <br />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </PhotoProvider>
            </div>
        </div>
    );
}