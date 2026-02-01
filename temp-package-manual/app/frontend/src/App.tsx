
import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import WithSidebarLayout from './layouts/WithSidebarLayout';
import { LoginEmail, LoginPassword, LoginOTP, RegisterPage } from './features/AuthPages';
import Dashboard from './features/Dashboard';
import BusinessReports from './features/BusinessReports';
import Inventory from './features/Inventory';
import AccountHealth from './features/AccountHealth';
import ManageOrders from './features/ManageOrders';
import AddProducts from './features/AddProducts';
import CampaignManager from './features/CampaignManager';
import Shipments from './features/Shipments';
import PerformanceNotifications from './features/PerformanceNotifications';
import SellingApplications from './features/SellingApplications';
import VoiceOfTheCustomer from './features/VoiceOfTheCustomer';
import AddProductsUpload from './features/AddProductsUpload';
import ProductOpportunities from './features/ProductOpportunities';
import Analytics from './features/Analytics';
import ManageStores from './features/ManageStores';
import DevData from './features/DevData';
import StoreStatus from './features/StoreStatus';
import StoreInfo from './features/StoreInfo';
import BusinessInfo from './features/BusinessInfo';
import Verification from './features/Verification';
import PaymentInfo from './features/PaymentInfo';
import TaxInfo from './features/TaxInfo';
import TaxInfoOverview from './features/TaxInfoOverview';
import MerchantToken from './features/MerchantToken';
import LegalEntity from './features/LegalEntity';
import ShippingReturns from './features/ShippingReturns';
import AccountManagement from './features/AccountManagement';

// Route Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useStore(state => state.session);
  const location = useLocation();

  if (!session.isLoggedIn) {
    return <Navigate to="/auth/login-email" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const Placeholder = ({ name }: { name: string }) => (
  <div className="p-8 bg-white border rounded-sm animate-in fade-in zoom-in-95 duration-200 shadow-sm min-h-[400px]">
    <h1 className="text-2xl font-black text-amazon-text mb-4 uppercase tracking-tight">{name}</h1>
    <p className="text-amazon-secondaryText leading-relaxed font-medium">This functional module is currently under development in the sandbox environment. Please refer to the official Seller Central documentation for production use cases.</p>
    <div className="mt-12 p-6 border border-dashed border-gray-200 rounded-sm bg-gray-50 flex flex-col items-center">
       <div className="w-12 h-12 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin mb-4"></div>
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mock Service Initializing...</span>
    </div>
  </div>
);

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-amazon-bg">
    <div className="w-12 h-12 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const location = useLocation();
  const isAuth = location.pathname.startsWith("/auth");
  return (
    <div className={isAuth ? "amz-auth" : "amz-console"}>
    <Suspense fallback={<Loading />}>
      <ErrorBoundary>
        <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login-email" element={<LoginEmail />} />
        <Route path="/auth/login-password" element={<LoginPassword />} />
        <Route path="/auth/login-otp" element={<LoginOTP />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Protected App Routes */}
        <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Routes without sidebar */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="performance-notifications" element={<PerformanceNotifications />} />
          <Route path="add-products" element={<AddProducts />} />
          <Route path="voc" element={<VoiceOfTheCustomer />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="product-opportunities" element={<ProductOpportunities />} />
          <Route path="add-products-upload" element={<AddProductsUpload />} />
          <Route path="selling-apps" element={<SellingApplications />} />
          <Route path="verification" element={<Verification />} />
          <Route path="dev-data" element={<DevData />} />
          <Route path="stores" element={<ManageStores />} />
          
          {/* Routes with sidebar */}
          <Route path="business-reports/*" element={<WithSidebarLayout />}>
            <Route path="sales-dashboard" element={<BusinessReports />} />
            <Route path="by-date/sales-traffic" element={<Placeholder name="Sales & Traffic" />} />
            <Route path="by-date/detail-page-sales" element={<Placeholder name="Detail Page Sales & Traffic" />} />
          </Route>
          
          <Route path="inventory/*" element={<WithSidebarLayout />}>
            <Route index element={<Inventory />} />
            <Route path="fba" element={<Placeholder name="FBA Inventory" />} />
          </Route>
          
          <Route path="orders/*" element={<WithSidebarLayout />}>
            <Route index element={<ManageOrders />} />
            <Route path="returns" element={<Placeholder name="Returns" />} />
            <Route path="reports" element={<Placeholder name="Order Reports" />} />
          </Route>
          
          <Route path="ads/*" element={<WithSidebarLayout />}>
            <Route index element={<CampaignManager />} />
            <Route path="groups" element={<Placeholder name="Ad Groups" />} />
            <Route path="keywords" element={<Placeholder name="Keywords" />} />
          </Route>
          
          {/* Performance Sub-routes */}
          <Route path="performance/*" element={<WithSidebarLayout />}>
            <Route index element={<AccountHealth />} />
            <Route path="account-health" element={<AccountHealth />} />
          </Route>
          
          {/* Account Settings Sub-routes */}
          <Route path="settings/*" element={<WithSidebarLayout />}>
            <Route index element={<Navigate to="store-status" replace />} />
            <Route path="store-status" element={<StoreStatus />} />
            <Route path="store-info" element={<StoreInfo />} />
            <Route path="business-info" element={<BusinessInfo />} />
            <Route path="business-info/address" element={<Verification />} />
            <Route path="business-info/token" element={<MerchantToken />} />
            <Route path="business-info/legal" element={<LegalEntity />} />
            <Route path="business-info/:sub" element={<Placeholder name="Business Info Detail" />} />
            <Route path="payment-info" element={<PaymentInfo />} />
            <Route path="shipping-returns" element={<ShippingReturns />} />
            <Route path="tax-info" element={<TaxInfoOverview />} />
            <Route path="tax-info/details" element={<TaxInfo />} />
            <Route path="tax-info/vat-gst" element={<Placeholder name="VAT/GST Registration Numbers" />} />
            <Route path="tax-info/rfc" element={<Placeholder name="RFC ID" />} />
            <Route path="account-management" element={<AccountManagement />} />
          </Route>
          
          {/* Catch-all for unknown /app routes */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
      </ErrorBoundary>
    </Suspense>
    </div>
  );
}

export default App;
