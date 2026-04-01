import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/superadmin/Sidebar";
import Topbar from "../components/superadmin/Topbar";
import CreateUserModal from "../components/superadmin/CreateUserModal";

export default function SuperAdminLayout() {
  const [showCreateUser, setShowCreateUser] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* ✅ Button controls modal */}
        <Topbar onCreateUser={() => setShowCreateUser(true)} />

        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* ✅ Modal lives HERE */}
        {showCreateUser && (
          <CreateUserModal
            onClose={() => setShowCreateUser(false)}
            onSuccess={() => setShowCreateUser(false)}
          />
        )}
      </div>
    </div>
  );
}
