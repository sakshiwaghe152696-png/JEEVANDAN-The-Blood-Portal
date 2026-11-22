import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Droplet,
  Hospital,
  UserPlus,
  Trophy 
} from "lucide-react";

export default function DoctorSidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200
     ${
       isActive
         ? "bg-red-600 text-white shadow-md border-l-4 border-red-400"
         : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
     }`;

  return (
    <aside className="w-64 bg-[#0f0f0f] text-white p-5 shadow-xl sticky top-0 h-screen">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-xl font-bold tracking-wide">
          Doctor Panel
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage & Monitor
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <NavLink to="/doctor" end className={linkClass}>
          <LayoutDashboard size={18} />
          <span className="text-sm font-medium">
            Dashboard
          </span>
        </NavLink>

        <NavLink
          to="/doctor/blood-banks"
          className={linkClass}
        >
          <Hospital size={18} />
          <span className="text-sm font-medium">
            Blood Banks Near Me
          </span>
        </NavLink>

        <NavLink
          to="/doctor/requests"
          className={linkClass}
        >
          <Droplet size={18} />
          <span className="text-sm font-medium">
            Blood Requests
          </span>
        </NavLink>

        {/* 🔥 NEW: Create User */}
        <NavLink
          to="/doctor/create-user"
          className={linkClass}
        >
          <UserPlus size={18} />
          <span className="text-sm font-medium">
            Register Donor
          </span>
          
        </NavLink>
        {/* ✅ NEW: Total Donors */}
<NavLink
  to="/doctor/donors"
  className={linkClass}
>
  <Droplet size={18} />
  <span className="text-sm font-medium">
    Total Donors
  </span>
</NavLink>

{/* ✅ NEW: Find Donor */}
{/* ✅ BEST DONOR */}
<NavLink
  to="/doctor/best-donors"
  className={linkClass}
>
  <Trophy size={18} />
  <span className="text-sm font-medium">
    Best Donor
  </span>
</NavLink>
      </nav>
    </aside>
  );
}