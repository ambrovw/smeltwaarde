import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(item => item._id === product._id);

            if (existingIndex !== -1) {
                // Update quantity of existing item
                const updatedItems = [...prev];
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    quantity
                };
                return updatedItems;
            }

            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item._id !== id));
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};