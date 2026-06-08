import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CatalogPage from './pages/CatalogPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';

import SeekerLayout from './pages/seeker/SeekerLayout';
import SeekerDashboard from './pages/seeker/Dashboard';
import SeekerProfile from './pages/seeker/Profile';
import BookService from './pages/seeker/BookService';
import SeekerBookings from './pages/seeker/Bookings';
import SeekerBookingDetail from './pages/seeker/BookingDetail';
import SeekerPayments from './pages/seeker/Payments';
import SeekerCallHistory from './pages/seeker/CallHistory';

import ProviderLayout from './pages/provider/ProviderLayout';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderServices from './pages/provider/Services';
import ProviderAvailability from './pages/provider/Availability';
import ProviderBookings from './pages/provider/Bookings';
import ProviderSearch from './pages/provider/Search';
import ProviderCallHistory from './pages/provider/CallHistory';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCategories from './pages/admin/Categories';
import AdminServices from './pages/admin/Services';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="search" element={<SearchPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="notifications" element={<NotificationsPage />} />

              <Route element={<RoleRoute role="seeker" />}>
                <Route path="seeker" element={<SeekerLayout />}>
                  <Route index element={<SeekerDashboard />} />
                  <Route path="book" element={<BookService />} />
                  <Route path="bookings" element={<SeekerBookings />} />
                  <Route path="bookings/:id" element={<SeekerBookingDetail />} />
                  <Route path="profile" element={<SeekerProfile />} />
                  <Route path="payments" element={<SeekerPayments />} />
                  <Route path="calls" element={<SeekerCallHistory />} />
                </Route>
              </Route>

              <Route element={<RoleRoute role="provider" />}>
                <Route path="provider" element={<ProviderLayout />}>
                  <Route index element={<ProviderDashboard />} />
                  <Route path="services" element={<ProviderServices />} />
                  <Route path="availability" element={<ProviderAvailability />} />
                  <Route path="bookings" element={<ProviderBookings />} />
                  <Route path="search" element={<ProviderSearch />} />
                  <Route path="calls" element={<ProviderCallHistory />} />
                </Route>
              </Route>

              <Route element={<RoleRoute role="admin" />}>
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="services" element={<AdminServices />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
