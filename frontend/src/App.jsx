import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationsCenter from './components/NotificationsCenter';
import CustomerPortal from './pages/CustomerPortal';
import { Loader } from 'lucide-react';

// High-Performance Dynamic Route Lazy Loading
const AdminPortal = lazy(() => import('./pages/AdminPortal'));
const WarehousePortal = lazy(() => import('./pages/WarehousePortal'));
const DeliveryPortal = lazy(() => import('./pages/DeliveryPortal'));
const Login = lazy(() => import('./pages/Login'));
const Forbidden = lazy(() => import('./pages/Forbidden'));

function PageFallback() {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-400">
      <Loader className="w-8 h-8 text-orange-500 animate-spin mb-3" />
      <span className="text-xs font-bold tracking-wider uppercase">Loading Sportsman...</span>
    </div>
  );
}

function AppContent() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080B11]">
      {/* Redesigned Nav Header */}
      <Navbar />
      
      {/* Routing content wrapped in Suspense for route code-splitting */}
      <main className="flex-1 flex flex-col w-full">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/403" element={<Forbidden />} />

            {/* Storefront & Customer Routes (Loaded instantly) */}
            <Route path="/" element={<CustomerPortal />} />
            <Route path="/tracker" element={<CustomerPortal />} />
            <Route path="/receipts" element={<CustomerPortal />} />

            {/* Lazy-Loaded Admin Dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            } />

            {/* Lazy-Loaded Warehouse Panel */}
            <Route path="/warehouse" element={
              <ProtectedRoute allowedRoles={['admin', 'warehouse_staff']}>
                <WarehousePortal />
              </ProtectedRoute>
            } />

            {/* Lazy-Loaded Delivery Logistics */}
            <Route path="/delivery" element={
              <ProtectedRoute allowedRoles={['admin', 'delivery_agent']}>
                <DeliveryPortal />
              </ProtectedRoute>
            } />

            {/* Redirect unregistered URLs to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Live Alerts Node */}
      <NotificationsCenter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
