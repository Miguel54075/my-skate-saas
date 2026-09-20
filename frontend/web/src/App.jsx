import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { Menu } from './pages/Menu';
import { Checkout } from './pages/Checkout';
import { KDS } from './pages/KDS';
import { Login } from './pages/Login';
import { AdminMenu } from './pages/AdminMenu';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/:slug" element={<Menu />} />
            <Route path="/:slug/checkout" element={<Checkout />} />
            <Route path="/admin/kds" element={<KDS />} />
            <Route path="/admin/menu" element={<AdminMenu />} />
            <Route
              path="/"
              element={
                <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <p className="text-4xl">🛹🍔</p>
                    <p className="sb-display text-[#FFC700] text-xl uppercase">Street Burger SaaS</p>
                    <p className="sb-mono text-xs text-[#9C9890]">Acesse via /:slug-da-hamburgueria</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}