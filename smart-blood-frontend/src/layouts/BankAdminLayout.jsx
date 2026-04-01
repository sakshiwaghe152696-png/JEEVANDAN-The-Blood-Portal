import { Outlet, NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaTint,
  FaClipboardList,
  FaBoxes,
  FaUserCircle
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { getProfile } from "../services/bankAdminApi";

export default function BankAdminLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch real admin data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setAdmin(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 🔓 Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">

        <div className="p-5 border-b border-gray-800">
          <h1 className="text-xl font-bold">Blood Bank</h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          <NavLink to="/bank-admin" end className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg ${
              isActive ? "bg-red-600 text-white" : "hover:bg-gray-800 text-gray-300"
            }`}>
            <FaTachometerAlt /> Dashboard
          </NavLink>

          <NavLink to="/bank-admin/donations" className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg ${
              isActive ? "bg-red-600 text-white" : "hover:bg-gray-800 text-gray-300"
            }`}>
            <FaTint /> Donations
          </NavLink>

          <NavLink to="/bank-admin/requests" className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg ${
              isActive ? "bg-red-600 text-white" : "hover:bg-gray-800 text-gray-300"
            }`}>
            <FaClipboardList /> Requests
          </NavLink>

          <NavLink to="/bank-admin/inventory" className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg ${
              isActive ? "bg-red-600 text-white" : "hover:bg-gray-800 text-gray-300"
            }`}>
            <FaBoxes /> Inventory
          </NavLink>

        </nav>

        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
          © Blood System
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* 🔝 TOPBAR */}
       <div className="flex justify-between items-center bg-white px-8 py-3 shadow-sm border-b">

  {/* LEFT */}
  <div>
    <h1 className="text-lg font-semibold text-gray-800">
      Blood Bank Dashboard
    </h1>
    <p className="text-[11px] text-gray-400">
      Manage donations, requests & inventory
    </p>
  </div>

  {/* RIGHT PROFILE */}
  <div className="relative">

    {/* PROFILE BUTTON */}
    <div
      onClick={() => setShowProfile(!showProfile)}
      className="flex items-center gap-3 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
    >
      {/* AVATAR */}
      <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-semibold">
        {admin?.profile?.full_name?.charAt(0) || "A"}
      </div>

      {/* INFO */}
      <div className="text-left leading-tight">
        <p className="text-sm font-medium text-gray-800">
          {admin?.profile?.full_name || "Admin"}
        </p>
        <p className="text-[11px] text-gray-400">
          {admin?.bloodBankName || "Blood Bank"}
        </p>
      </div>

      {/* ARROW */}
      <span className="text-gray-400 text-xs">▼</span>
    </div>

    {/* DROPDOWN */}
    {showProfile && (
      <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border p-5 z-50 animate-fadeIn">

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-4">

              <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold">
                {admin?.profile?.full_name?.charAt(0) || "A"}
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  {admin?.profile?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">
                  {admin?.email || "No Email"}
                </p>
              </div>

            </div>

            {/* INFO */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-4">
              🏥 {admin?.bloodBankName || "Blood Bank"}
            </div>

            {/* LOGOUT */}
            <button
              className="w-full bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </div>
    )}
  </div>
</div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}