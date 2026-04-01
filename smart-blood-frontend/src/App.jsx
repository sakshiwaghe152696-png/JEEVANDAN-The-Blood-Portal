import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

/* 🌐 Public */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

/* 🔐 Auth */
import ProtectedRoute from "./components/auth/ProtectedRoute";

/* 🛡️ Super Admin */
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import Dashboard from "./pages/superadmin/Dashboard";
import BloodBanks from "./pages/superadmin/BloodBanks";
import Doctors from "./pages/superadmin/Doctors";
import BankAdmins from "./pages/superadmin/BankAdmins";
import Donors from "./pages/superadmin/Donors";

/* 🩺 Doctor */
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorProfile from "./pages/doctor/Profile";
import DoctorRequests from "./components/doctor/MyRequests";
import RequestDetails from "./pages/doctor/RequestDetails";
import DoctorNearbyBloodBanks from "./pages/doctor/DoctorNearbyBloodBanks";
import BloodStockPage from "./pages/doctor/BloodStockPage";
import RaiseRequestPage from "./pages/doctor/RaiseRequestPage";
import CreateUser from "./pages/doctor/CreateUser";

/* 🏥 Bank Admin */
import BankAdminLayout from "./layouts/BankAdminLayout";
import BankDashboard from "./pages/bankAdmin/Dashboard";
import Requests from "./pages/bankadmin/Requests";
import Inventory from "./pages/bankAdmin/Inventory";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 🌐 Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* 🛡️ Super Admin */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="blood-banks" element={<BloodBanks />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="bank-admins" element={<BankAdmins />} />
            <Route path="donors" element={<Donors />} />
          </Route>

          {/* 🩺 Doctor */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="requests" element={<DoctorRequests />} />
            <Route path="blood-banks" element={<DoctorNearbyBloodBanks />} />
            <Route path="blood-stock/:bankId" element={<BloodStockPage />} />
            <Route path="request-blood/:bankId" element={<RaiseRequestPage />} />
            <Route path="request/:id" element={<RequestDetails />} />
            <Route path="create-user" element={<CreateUser />} />
          </Route>

          {/* 🏥 Bank Admin */}
          <Route
            path="/bank-admin"
            element={
              <ProtectedRoute allowedRoles={["BANK_ADMIN"]}>
                <BankAdminLayout />
              </ProtectedRoute>
            }
          >
            {/* ✅ THIS WAS MISSING */}
            <Route index element={<BankDashboard />} />
            <Route path="requests" element={<Requests />} />
            <Route path="/bank-admin/inventory" element={<Inventory />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}