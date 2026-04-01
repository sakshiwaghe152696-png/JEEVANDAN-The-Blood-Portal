import { useEffect, useState } from "react";

import Table from "../../components/superadmin/Table";
import { getBloodBanks } from "../../services/superAdminApi";

export default function BloodBanks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     FETCH BLOOD BANKS
  =============================== */
  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      const res = await getBloodBanks();
      setBanks(res.data);
    } catch (err) {
      console.error("Failed to load blood banks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  /* ===============================
     TABLE DATA
  =============================== */
  const tableData = banks.map((bb) => [
    bb.name || "—",
    bb.city || "—",

    // Admin info
    <div key={bb.bank_id} className="flex flex-col">
      <span className="font-medium text-gray-800">
        {bb.admin_name || "N/A"}
      </span>
      <span className="text-xs text-gray-500">
        {bb.admin_email || "—"}
      </span>
    </div>,

    bb.contact_number || "—",
  ]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Blood Banks</h2>

      {loading ? (
        <p className="text-gray-500">Loading blood banks...</p>
      ) : (
        <Table
          columns={[
            "Blood Bank",
            "City",
            "Admin",
            "Contact",
          ]}
          data={tableData}
        />
      )}
    </>
  );
}