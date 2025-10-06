import { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import '../styles/components/Shop.css';
import useSilverPrice from '../hooks/useSilverPrice';
import { useCart } from '../contexts/CartContext';
import { Helmet } from 'react-helmet';

export default function Shop({ isLoggedIn }) {
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const { flashPrice, randPerGram } = useSilverPrice();
    const { addToCart } = useCart();
    const [showAddedPopup, setShowAddedPopup] = useState(false);

    useEffect(() => {
        fetch('https://kajuit.smeltwaarde.co.za/api/products/all')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.products);
                    const initialQuantities = {};
                    data.products.forEach(p => {
                        if (p.enabled) initialQuantities[p._id] = 1;
                    });
                    setQuantities(initialQuantities);
                }
            });
    }, []);

    const handleQuantityChange = (id, val, max) => {
        const parsed = val === '' ? '' : Math.max(0, Math.min(Number(val), max));
        setQuantities(prev => ({ ...prev, [id]: parsed }));
    };

    return (
    <div className="scroll-wrapper">

        <Helmet>
            <title>Koop ou Suid-Afrikaanse silver munte | Buy Old South African Silver Coins | Smeltwaarde</title>
            <meta name="description" content="Koop ou Suid-Afrikaanse silver munte. Browse and buy South African silver coins including ZAR, Union, and Rand-era collectibles." />
            <meta name="keywords" content="South African silver coins, melt value, junk silver, ZAR coins, Union coins, Rand coins, buy silver coins, old coins for sale" />
            <link rel="canonical" href="https://smeltwaarde.co.za/shop" />
        </Helmet>

            {showAddedPopup && <div className="success-popup">✅ Produk by mandjie gevoeg!</div>}
            <div className="container">
                <h1>Winkel</h1>
                <hr />
                <h3 className="section-header">Beskikbare Produkte</h3>

                <PhotoProvider maskOpacity={0.85}>
                    <div className="product-grid">
                        {products.filter(product => product.enabled).map(product => {
                            const maxQuantity = product.quantity || 1;
                            const currentQuantity = quantities[product._id] ?? 1;

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
                                            {randPerGram !== null
                                                ? `R${(product.purity * product.weight * randPerGram * (1 + product.priceOffsetPercent / 100)).toFixed(2)}`
                                                : 'Laai...'}
                                        </div>

                                        <div className="product-description">
                                            {product.description.split('\n').map((line, index) => (
                                                <span key={index}>
                                                  <em>{line}</em>
                                                  <br />
                                                </span>
                                            ))}
                                        </div>

                                        <div className="product-premie">
                                            <span className="label">Premie:</span>{' '}
                                            {product.priceOffsetPercent != null ? `${product.priceOffsetPercent}%` : '0%'}
                                        </div>

                                        <div className="product-purity">
                                            <span className="label">Fynheid:</span>{' '}
                                            {`${(product.purity * 100).toFixed(3).replace(/\.?0+$/, '')}%`}
                                        </div>

                                        <div className="product-quantity">
                                            <span className="label">Beskikbaar:</span>{' '}
                                            {product.quantity}
                                        </div>

                                        <div className="quantity-control hover-left">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleQuantityChange(product._id, currentQuantity - 1, maxQuantity)
                                                }
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                max={maxQuantity}
                                                value={currentQuantity}
                                                onChange={(e) =>
                                                    handleQuantityChange(product._id, e.target.value, maxQuantity)
                                                }
                                                className="quantity-input"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleQuantityChange(product._id, currentQuantity + 1, maxQuantity)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            className="add-to-cart-button"
                                            onClick={() => {
                                                if (!isLoggedIn) {
                                                window.location.href = '/login';
                                                return;
                                            }

                                                const enrichedProduct = {
                                                    ...product,
                                                    quantityAvailable: product.quantity
                                                };
                                                addToCart(enrichedProduct, currentQuantity);
                                                setShowAddedPopup(true);
                                                setTimeout(() => setShowAddedPopup(false), 2000);
                                            }}
                                        >
                                            Voeg by mandjie
                                        </button>

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