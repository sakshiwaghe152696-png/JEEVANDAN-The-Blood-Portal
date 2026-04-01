import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  UserCog,
  Stethoscope,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { FaUsers } from "react-icons/fa";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-6 py-3 border-l-4 transition-all duration-200 ${
      isActive
        ? "border-red-600 bg-[#1a1a1a] text-white"
        : "border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-[#0b0b0b] min-h-screen flex flex-col justify-between
      border-r border-[#1f1f1f] shadow-[4px_0_15px_rgba(0,0,0,0.6)]">

      {/* Top Section */}
      <div>
        <h2 className="text-xl font-bold text-white px-6 py-6 flex items-center gap-2">
          <Shield className="text-red-600" size={20} />
          Super Admin
        </h2>

        <nav className="space-y-2 mt-4">

          <NavLink to="/superadmin" end className={linkClass}>
            <LayoutDashboard size={18} className="transition-transform group-hover:translate-x-1" />
            Dashboard
          </NavLink>

          <NavLink to="/superadmin/blood-banks" className={linkClass}>
            <Building2 size={18} className="transition-transform group-hover:translate-x-1" />
            Blood Banks
          </NavLink>

          <NavLink to="/superadmin/bank-admins" className={linkClass}>
            <UserCog size={18} className="transition-transform group-hover:translate-x-1" />
            Bank Admins
          </NavLink>

          <NavLink to="/superadmin/doctors" className={linkClass}>
            <Stethoscope size={18} className="transition-transform group-hover:translate-x-1" />
            Doctors
          </NavLink>

          {/* Donors Button */}
          <NavLink to="/superadmin/donors" className={linkClass}>
            <FaUsers size={18} className="transition-transform group-hover:translate-x-1" />
            Donors
          </NavLink>

        </nav>
      </div>

      {/* Bottom Section */}
      <div>
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-6 py-3 text-gray-400 hover:text-red-500 hover:bg-[#1a1a1a] transition border-t border-[#1f1f1f]"
        >
          <LogOut size={18} className="transition-transform group-hover:translate-x-1" />
          Logout
        </button>

        {/* Footer */}
        <div className="px-6 py-4 text-xs text-gray-500 border-t border-[#1a1a1a]">
          © 2026 Smart Blood System
        </div>
      </div>

    </aside>
  );
}