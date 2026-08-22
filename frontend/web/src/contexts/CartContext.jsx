import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const storagedCart = localStorage.getItem('@streetburger:cart');
    return storagedCart ? JSON.parse(storagedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('@streetburger:cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, quantity = 1, selectedIngredients = [], notes = '') {
    const newItem = {
      cartItemId: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      selectedIngredients, // Array de objetos { id, name, price }
      notes,
    };

    setCart((prev) => [...prev, newItem]);
  }

  function removeFromCart(cartItemId) {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }

  function clearCart() {
    setCart([]);
  }

  const cartTotal = cart.reduce((total, item) => {
    const ingredientsTotal = item.selectedIngredients.reduce(
      (sum, ing) => sum + Number(ing.price),
      0
    );
    return total + (item.price + ingredientsTotal) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}