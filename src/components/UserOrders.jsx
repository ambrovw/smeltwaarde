import { useEffect, useState } from 'react';
import '../styles/components/Orders.css';

function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
                        {orders.map(order => (
                            <div key={order._id} className="order-card">
                                <h2>Verwysings# {order.reference}</h2>
                                <p>Datum: {new Date(order.createdAt).toLocaleString()}</p>
                                <p>Rand per gram: R{order.randPerGram.toFixed(2)}</p>
                                <p>Totaal: R{order.totalAmount.toFixed(2)}</p>
                                <ul>
                                    {order.items.map(item => (
                                        <li key={item.productId}>
                                            {item.quantity} × {item.heading} @ R{item.unitPrice.toFixed(2)} = R{item.total.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserOrders;