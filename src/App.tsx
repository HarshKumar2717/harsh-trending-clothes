import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/Guards';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { LoginPage } from './pages/auth/LoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

import { AccountLayout } from './pages/account/AccountLayout';
import { AccountDashboard } from './pages/account/AccountDashboard';
import { ProfilePage } from './pages/account/ProfilePage';
import { OrdersPage } from './pages/account/OrdersPage';
import { OrderDetailPage } from './pages/account/OrderDetailPage';
import { AddressesPage } from './pages/account/AddressesPage';

import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUserRoles } from './pages/admin/AdminUserRoles';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminPayment } from './pages/admin/AdminPayment';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    {/* Public */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/category/:category" element={<ShopPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPage />} />
                    <Route path="/return-policy" element={<ReturnPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />

                    {/* Auth */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Customer account */}
                    <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
                      <Route index element={<AccountDashboard />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="orders/:id" element={<OrderDetailPage />} />
                      <Route path="addresses" element={<AddressesPage />} />
                    </Route>

                    {/* Checkout (protected) */}
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

                    {/* Access denied */}
                    <Route path="/access-denied" element={<AccessDeniedPage />} />

                    {/* Admin */}
                    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminCustomers />} />
                      <Route path="roles" element={<AdminUserRoles />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                      <Route path="banners" element={<AdminBanners />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="payment" element={<AdminPayment />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
