import { useEffect, useState } from 'react';
import '../styles/components/Orders.css';

function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const shippingFee = 120;
    const grandTotal = orders.reduce((sum, order) => sum + order.totalAmount, 0) + shippingFee;

    useEffect(() => {
        const token = localStorage.getItem('token'); // or however you're storing it

        fetch('https://kajuit.smeltwaarde.co.za/api/orders/my', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrders(data.orders);
                }
            })
            .catch(err => console.error('Order fetch failed:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="scroll-wrapper">
            <div className="container">
                <h1>Jou Bestellings</h1>

                {loading ? (
                    <p>Laai bestellings...</p>
                ) : orders.length === 0 ? (
                    <p>Geen bestellings gevind nie.</p>
                ) : (
                    <div className="order-list">

                        <div className="payment-info-card">

                            <div className="grand-total-bar">
                                <h2>
                                    <span className="order-total-label">Totaal insluitend R120 aflewering:</span>{' '}
                                    <span className="order-total-value">R{grandTotal.toFixed(2)}</span>
                                </h2>
                            </div>

                            <p>
                                <span className="payment-label">Bank:</span>{' '}
                                <span className="payment-value">FNB</span>
                            </p>
                            <p>
                                <span className="payment-label">Rekeningnommer:</span>{' '}
                                <span className="payment-value">62830537934</span>
                            </p>
                            <p>
                                <span className="payment-label">Tak kode:</span>{' '}
                                <span className="payment-value">250655</span>
                            </p>
                            <p>
                                <span className="payment-label">Verwysing:</span>{' '}
                                <span className="payment-value">
                            Gebruik jou bestelling se verwysingsnommer (of die eerste, indien meer as een). <br />
                            Bv: T3PSR6-JK
                        </span>
                            </p>
                            <p>
                                <span className="payment-label">Betaalbewys:</span>{' '}
                                <span className="payment-value">admin@smeltwaarde.co.za</span>
                            </p>
                            <p>
                        <span className="payment-text">
                            Betaling moet asseblief binne 24h geskied.<br />
                            Laat 3-5 werksdae toe vir aflewering.<br />
                            Hou hierdie bladsy dop om die status van jou bestelling te sien.
                        </span>
                            </p>
                        </div>

                        {orders.map(order => (
                            <div key={order._id} className="order-wrapper">
                                <div className="order-card">
                                    <p>
                                        <span className="order-header-value">{order.reference}</span>
                                    </p>
                                    <p>
                                        <span className="order-label">Datum:</span>{' '}
                                        <span className="order-value">{new Date(order.createdAt).toLocaleString()}</span>
                                    </p>
                                    <p>
                                        <span className="order-label">Rand per gram:</span>{' '}
                                        <span className="order-value">R{order.randPerGram.toFixed(2)}</span>
                                    </p>
                                    <ul>
                                        {order.items.map(item => (
                                            <li key={item.productId}>
                                        <span className="order-item-label">
                                            {item.quantity} × {item.heading} @ R{item.unitPrice.toFixed(2)}=
                                        </span>{' '}
                                                <span className="order-item-value">R{item.total.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p>
                                        <span className="order-total-label">Totaal:</span>{' '}
                                        <span className="order-total-value">R{order.totalAmount.toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserOrders;