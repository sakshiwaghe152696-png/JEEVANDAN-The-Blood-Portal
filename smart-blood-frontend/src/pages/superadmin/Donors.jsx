import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import Table from "../../components/superadmin/Table";

import {
  getDonors,
  deleteDonor,
} from "../../services/superAdminApi";

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // ✅ custom confirm

  /* ===============================
     FETCH DONORS
  =============================== */
  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await getDonors();
      setDonors(res.data.donors);
    } catch (err) {
      console.error("Failed to load donors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  /* ===============================
     DELETE DONOR
  =============================== */
  const confirmDelete = async () => {
    try {
      await deleteDonor(deleteConfirm.user_id); // ✅ user_id now a string from backend
      setDeleteConfirm(null);
      fetchDonors();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete donor");
    }
  };

  /* ===============================
     TABLE DATA
  =============================== */
  const tableData = donors.map((donor) => [
    donor.full_name || "—",
    donor.city || "—",
    donor.email || "—",
    donor.phone || "—",
    donor.age || "—",
    donor.gender || "—",
    donor.blood_group || "—",

    // ACTIONS — edit removed since CreateUserModal doesn't support DONOR role
    <div key={donor.user_id} className="flex justify-end gap-3">
      <button
        onClick={() => setDeleteConfirm(donor)}
        className="text-red-600 hover:text-red-800"
        title="Delete Donor"
      >
        <Trash2 size={18} />
      </button>
    </div>,
  ]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Donors</h2>

      {loading ? (
        <p className="text-gray-500">Loading donors...</p>
      ) : (
        <Table
          columns={[
            "Name",
            "City",
            "Email",
            "Phone",
            "Age",
            "Gender",
            "Blood Group",
            "Actions",
          ]}
          data={tableData}
        />
      )}

      {/* ✅ Custom delete confirmation — no window.confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {deleteConfirm.full_name}
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