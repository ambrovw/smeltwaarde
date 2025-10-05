import { useCart } from '../contexts/CartContext';
import useSilverPrice from '../hooks/useSilverPrice';
import '../styles/components/Cart.css';
import {useState} from "react";

export default function Cart() {
    const { cartItems, removeFromCart, addToCart } = useCart();
    const { randPerGram, silverPrice, flashPrice } = useSilverPrice();
    const [showRemovedPopup, setShowRemovedPopup] = useState(false);

    const randPerOunce = randPerGram ? randPerGram * 31.1035 : null;

    const handleQuantityChange = (item, newQuantity) => {
        const parsed = newQuantity === ''
            ? ''
            : Math.max(0, Math.min(Number(newQuantity), item.quantityAvailable));
        addToCart(item, parsed);
    };

    const totalCartValue = cartItems.reduce((total, item) => {
        const baseValue = item.purity * item.weight * (randPerGram || 0);
        const adjustedPrice = baseValue * (1 + item.priceOffsetPercent / 100);
        return total + adjustedPrice * item.quantity;
    }, 0);

    return (
        <div className="scroll-wrapper">
            {showRemovedPopup && <div className="success-popup">✅ Produk verwyder!</div>}
            <div className="container">
                <h1>Mandjie</h1>
                    <h2 className="cart-emphasis">
                        Silverprys:{' '}
                    <span className={`cart-price ${flashPrice ? 'flash' : ''}`}>
                        R{randPerOunce?.toFixed(2) ?? 'Laai...'}/ozt
                    </span>
                    </h2>

                {cartItems.length === 0 ? (
                    <p>Jou mandjie is leeg.</p>
                ) : (
                    <>
                    <div className="cart-items-row">
                    {cartItems.map(item => {
                            const baseValue = item.purity * item.weight * (randPerGram || 0);
                            const adjustedPrice = baseValue * (1 + item.priceOffsetPercent / 100);
                            const itemTotal = adjustedPrice * item.quantity;

                            return (
                                <div key={item._id} className="cart-item">
                                    <div className="box-in">
                                        {item.images?.[0] && (
                                            <img
                                                src={`https://kajuit.smeltwaarde.co.za/uploads/${item.images[0]}`}
                                                alt={`${item.heading} preview`}
                                                className="cart-image-preview"
                                            />
                                        )}
                                        <h3>{item.heading}</h3>
                                        <p className="unit-price">
                                            Eenheidsprys:{' '}
                                            <span className={flashPrice ? 'flash' : ''}>
                                                R{adjustedPrice.toFixed(2)}
                                            </span>
                                        </p>

                                        <div className="quantity-control hover-left">
                                            <button
                                                type="button"
                                                disabled={item.quantity <= 0}
                                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.quantityAvailable}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item, e.target.value)}
                                                className="quantity-input"
                                            />
                                            <button
                                                type="button"
                                                disabled={item.quantity >= item.quantityAvailable}
                                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <p className="item-total">
                                            Totaal:{' '}
                                            <span className={flashPrice ? 'flash' : ''}>
                                                R{itemTotal.toFixed(2)}
                                            </span>
                                        </p>
                                        <button
                                            className="action-button delete"
                                            onClick={() => {
                                                removeFromCart(item._id);
                                                setShowRemovedPopup(true);
                                                setTimeout(() => setShowRemovedPopup(false), 2000);
                                            }}
                                        >
                                            Verwyder
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="cart-total-bar">
                        <h2 className="cart-emphasis">
                            Totaal:{' '}
                            <span className={flashPrice ? 'flash' : ''}>
                                R{totalCartValue.toFixed(2)}
                              </span>
                        </h2>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}