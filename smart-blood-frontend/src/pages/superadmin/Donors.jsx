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
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  const getAge = (dob) => {
    if (!dob) return "—";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const confirmDelete = async () => {
    try {
      const id = deleteConfirm.user_id;

      await deleteDonor(id);

      setDonors((prev) => prev.filter((d) => d.user_id !== id));

      setDeleteConfirm(null);

    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete donor");
    }
  };

  const tableData = donors.map((donor) => [
    donor.full_name || "—",
    donor.city || "—",
    donor.email || "—",
    donor.phone || "—",
    getAge(donor.date_of_birth),
    donor.gender || "—",
    donor.blood_group || "—",

    <div key={donor.user_id} className="flex justify-end gap-3">
      <button
        onClick={() => setDeleteConfirm(donor)}
        className="deleteBtn"
        title="Delete Donor"
      >
        <Trash2 size={18} />
      </button>
    </div>,
  ]);

  return (
    <div className="pageWrapper fadeIn">

      <h2 className="title">Donors</h2>

      {loading ? (
        <p className="loadingText">Loading donors...</p>
      ) : (
        <div className="tableWrapper glass">
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
        </div>
      )}

      {deleteConfirm && (
        <div className="modalOverlay">
          <div className="modal glass fadeScale">
            <h3 className="modalTitle">Confirm Delete</h3>

            <p className="modalText">
              Are you sure you want to delete{" "}
              <span className="highlight">
                {deleteConfirm.profile?.full_name}
              </span>
              ?
            </p>

            <div className="modalActions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="cancelBtn"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="confirmBtn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== STYLES ===== */}
      <style>{`
        .pageWrapper {
          padding: 20px;
          background: linear-gradient(135deg,#eef2ff,#f8fafc,#fdf2f8);
          min-height: 100vh;
        }

        .title {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }

        .loadingText {
          color: #64748b;
          font-weight: 500;
        }

        .glass {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(18px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .tableWrapper {
          padding: 10px;
          transition: 0.3s;
        }

        .tableWrapper:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.12);
        }

        /* DELETE BUTTON */
        .deleteBtn {
          color: #ef4444;
          transition: all 0.3s ease;
        }

        .deleteBtn:hover {
          color: #b91c1c;
          transform: scale(1.2) rotate(5deg);
        }

        /* MODAL */
        .modalOverlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(6px);
        }

        .modal {
          padding: 25px;
          max-width: 360px;
          width: 100%;
          border-radius: 20px;
          text-align: center;
        }

        .modalTitle {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .modalText {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 20px;
        }

        .highlight {
          color: #0f172a;
          font-weight: 600;
        }

        .modalActions {
          display: flex;
          gap: 10px;
        }

        .cancelBtn {
          flex: 1;
          padding: 10px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          transition: 0.3s;
        }

        .cancelBtn:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .confirmBtn {
          flex: 1;
          padding: 10px;
          border-radius: 12px;
          background: linear-gradient(135deg,#ef4444,#dc2626);
          color: white;
          font-weight: 600;
          transition: 0.3s;
        }

        .confirmBtn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 10px 25px rgba(239,68,68,0.4);
        }

        /* ANIMATIONS */
        .fadeIn {
          animation: fadeIn 0.6s ease;
        }

        .fadeScale {
          animation: scaleIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px);}
          to { opacity: 1; transform: translateY(0);}
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0;}
          to { transform: scale(1); opacity: 1;}
        }
      `}</style>

    </div>
  );
}