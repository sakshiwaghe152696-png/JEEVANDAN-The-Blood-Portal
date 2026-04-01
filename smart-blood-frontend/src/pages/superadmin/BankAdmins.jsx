import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import Table from "../../components/superadmin/Table";
import CreateUserModal from "../../components/superadmin/CreateUserModal";

import {
  getBankAdmins,
  deleteBankAdmin,
} from "../../services/superAdminApi";

export default function BankAdmins() {
  const [admins, setAdmins] = useState([]);
  const [editAdmin, setEditAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
     FETCH BANK ADMINS
  =============================== */
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await getBankAdmins();
      setAdmins(res.data); // 🔥 keep raw objects
    } catch (err) {
      console.error("Failed to load bank admins", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  /* ===============================
     DELETE BANK ADMIN
  =============================== */
  const handleDelete = async (admin) => {
  const ok = window.confirm(
    `Are you sure you want to delete ${admin.name}?`
  );
  if (!ok) return;

  try {
    console.log("Deleting admin with ID:", admin.user_id); // 👈 ADD
    await deleteBankAdmin(admin.user_id);
    console.log("Delete successful");                       // 👈 ADD
    fetchAdmins();
  } catch (err) {
    console.error("Delete error:", err);                    // 👈 CHANGE this
    alert("Failed to delete bank admin");
  }
};

  /* ===============================
     TABLE DATA
  =============================== */
  const tableData = admins.map((admin) => [
    admin.name || "—",               // ✅ FIXED NAME
    admin.city,
    admin.email,
    admin.bank_name || "—",          // ✅ ASSOCIATED BLOOD BANK
    <div key={admin.user_id} className="flex gap-3">
      {/* ✏️ EDIT */}
      <button
        onClick={() =>
          setEditAdmin({ ...admin, role: "BANK_ADMIN" })
        }
        className="text-blue-600 hover:text-blue-800"
        title="Edit Bank Admin"
      >
        <Pencil size={18} />
      </button>

      {/* ❌ DELETE */}
      <button
        onClick={() => handleDelete(admin)}
        className="text-red-600 hover:text-red-800"
        title="Delete Bank Admin"
      >
        <Trash2 size={18} />
      </button>
    </div>,
  ]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Bank Admins</h2>

      {loading ? (
        <p className="text-gray-500">Loading bank admins...</p>
      ) : (
        <Table
          columns={[
            "Name",
            "City",
            "Email",
            "Blood Bank",
            "Actions",
          ]}
          data={tableData}
        />
      )}

      {/* ✏️ EDIT MODAL */}
      {editAdmin && (
        <CreateUserModal
          mode="edit"
          initialData={editAdmin}
          onClose={() => setEditAdmin(null)}
          onSuccess={() => {
            setEditAdmin(null);
            fetchAdmins();
          }}
        />
      )}
    </>
  );
}
