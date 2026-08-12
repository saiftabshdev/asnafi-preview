import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { WhatsAppButton } from "./components/WhatsAppButton";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardOverview from "./pages/dashboard/Overview";
import RestaurantInfo from "./pages/dashboard/RestaurantInfo";
import MenuManagement from "./pages/dashboard/MenuManagement";
import DesignSettings from "./pages/dashboard/DesignSettings";
import Subscription from "./pages/dashboard/Subscription";
import ShareMenu from "./pages/dashboard/ShareMenu";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import AdminLayout from "./components/layout/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminLegalContent from "./pages/admin/AdminLegalContent";
import PublicMenu from "./pages/PublicMenu";
import SampleMenus from "./pages/SampleMenus";
import AdminLogin from "./pages/admin/AdminLogin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import FAQ from "./pages/FAQ";
import Themes from "./pages/Themes";

const WHATSAPP_HIDDEN_PREFIXES = ["/dashboard", "/admin", "/menu"];

function FloatingWhatsApp() {
  const location = useLocation();
  const hidden = WHATSAPP_HIDDEN_PREFIXES.some((p) =>
    location.pathname.startsWith(p),
  );
  if (hidden) return null;
  return <WhatsAppButton />;
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <FloatingWhatsApp />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/menu/:slug" element={<PublicMenu />} />
        <Route path="/samples" element={<SampleMenus />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/themes" element={<Themes />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="restaurant" element={<RestaurantInfo />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="design" element={<DesignSettings />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="share" element={<ShareMenu />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="legal" element={<AdminLegalContent />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
