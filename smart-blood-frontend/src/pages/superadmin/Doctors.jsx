import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import Table from "../../components/superadmin/Table";
import CreateUserModal from "../../components/superadmin/CreateUserModal";

import {
  getDoctors,
  deleteDoctor,
} from "../../services/superAdminApi";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [editDoctor, setEditDoctor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // ✅ custom confirm
  const [loading, setLoading] = useState(false);

  /* ===============================
     FETCH DOCTORS
  =============================== */
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await getDoctors();
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ===============================
     DELETE DOCTOR
  =============================== */
  const confirmDelete = async () => {
    try {
      await deleteDoctor(deleteConfirm.user_id);
      setDeleteConfirm(null);
      fetchDoctors();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete doctor");
    }
  };

  /* ===============================
     TABLE DATA
  =============================== */
  const tableData = doctors.map((doc) => [
    doc.name || "—",
    doc.city || "—",
    doc.email || "—",
    doc.phone || "—",

    <div key={doc.user_id} className="flex justify-end gap-3">
      {/* EDIT */}
      <button
        onClick={() => setEditDoctor({ ...doc, role: "DOCTOR" })}
        className="text-blue-600 hover:text-blue-800"
        title="Edit Doctor"
      >
        <Pencil size={18} />
      </button>

      {/* DELETE */}
      <button
        onClick={() => setDeleteConfirm(doc)}
        className="text-red-600 hover:text-red-800"
        title="Delete Doctor"
      >
        <Trash2 size={18} />
      </button>
    </div>,
  ]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Doctors</h2>

      {loading ? (
        <p className="text-gray-500">Loading doctors...</p>
      ) : (
        <Table
          columns={["Name", "City", "Email", "Phone", "Actions"]}
          data={tableData}
        />
      )}

      {/* EDIT MODAL */}
      {editDoctor && (
        <CreateUserModal
          mode="edit"
          initialData={editDoctor}
          onClose={() => setEditDoctor(null)}
          onSuccess={() => {
            setEditDoctor(null);
            fetchDoctors();
          }}
        />
      )}

      {/* ✅ Custom delete confirmation — no window.confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete Dr.{" "}
              <span className="font-semibold text-gray-700">
                {deleteConfirm.name}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}