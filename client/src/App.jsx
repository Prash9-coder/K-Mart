import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import FloatingActionButton from './components/ui/FloatingActionButton'
import ErrorBoundary from './components/ui/ErrorBoundary'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import NotFoundPage from './pages/NotFoundPage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminRegisterPage from './pages/admin/AdminRegisterPage'
import ProductListPage from './pages/admin/ProductListPage'
import ProductCreateEditPage from './pages/admin/ProductCreateEditPage'
import OrderListPage from './pages/admin/OrderListPage'
import UserListPage from './pages/admin/UserListPage'
import UserEditPage from './pages/admin/UserEditPage'
import CouponListPage from './pages/admin/CouponListPage'
import CouponEditPage from './pages/admin/CouponEditPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import ReviewListPage from './pages/admin/ReviewListPage'
import InventoryPage from './pages/admin/InventoryPage'

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="order-success" element={<OrderSuccessPage />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="admin/register" element={<AdminRegisterPage />} />
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="admin/analytics" element={<AnalyticsPage />} />
          <Route path="admin/products" element={<ProductListPage />} />
          <Route path="admin/product/new" element={<ProductCreateEditPage />} />
          <Route path="admin/product/:id/edit" element={<ProductCreateEditPage />} />
          <Route path="admin/inventory" element={<InventoryPage />} />
          <Route path="admin/orders" element={<OrderListPage />} />
          <Route path="admin/users" element={<UserListPage />} />
          <Route path="admin/user/:id/edit" element={<UserEditPage />} />
          <Route path="admin/coupons" element={<CouponListPage />} />
          <Route path="admin/coupon/create" element={<CouponEditPage />} />
          <Route path="admin/coupon/:id" element={<CouponEditPage />} />
          <Route path="admin/coupon/:id/edit" element={<CouponEditPage />} />
          <Route path="admin/reviews" element={<ReviewListPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <FloatingActionButton />
    </ErrorBoundary>
  )
}

export default App