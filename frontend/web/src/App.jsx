import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { Menu } from './pages/Menu';
import { Checkout } from './pages/Checkout';
import { KDS } from './pages/KDS';
import { Login } from './pages/Login';
import { AdminMenu } from './pages/AdminMenu';

export default function App() {
  return (
    <BrowserRouter>
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
              <div className="p-8 text-center text-street-yellow font-bold">
                Acesse via /:slug-da-hamburgueria
              </div>
            }
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}