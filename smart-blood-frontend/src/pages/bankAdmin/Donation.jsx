import { useEffect, useState } from "react";

export default function Donation() {

  // ===========================
  // States
  // ===========================

  const [phone, setPhone] = useState("");

  const [donor, setDonor] = useState(null);

  const [loading, setLoading] = useState(false);

  const [eligible, setEligible] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [remarks, setRemarks] = useState("");

  const [units, setUnits] = useState(1);

  const [donations, setDonations] = useState([]);

  const [stats, setStats] = useState({

    totalDonations: 0,

    totalUnits: 0

  });

  // ===========================
  // Load Donation History
  // ===========================

  useEffect(() => {

    fetchDonations();

  }, []);

 const fetchDonations = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/donation", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return console.error(data.message);
    }

    setDonations(data.donations);
    setStats({
      totalDonations: data.totalDonations,
      totalUnits: data.totalUnits,
    });

  } catch (err) {
    console.error(err);
  }
};

  // ===========================
  // Search Donor
  // ===========================

const searchDonor = async () => {

  setError("");
  setSuccess("");
  setDonor(null);
  setEligible(false);

  if (!phone.trim()) {
    return setError("Please enter donor phone number.");
  }

  setLoading(true);

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      `/api/donation/search/${phone}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return setError(data.message);
    }

    setDonor(data.donor);
    setEligible(data.eligible);

    if (!data.eligible) {
      setError(
        `Donor not eligible. Wait ${data.daysRemaining} day(s).`
      );
    }

  } catch (err) {

    console.error(err);
    setError("Server Error");

  } finally {

    setLoading(false);

  }

};

  // ===========================
  // Record Donation
  // ===========================

  const confirmDonation = async () => {

  setError("");
  setSuccess("");

  try {

    const token = localStorage.getItem("token");

    const res = await fetch("/api/donation", {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,

      },

      body: JSON.stringify({

        phone,

        units,

        remarks,

      }),

    });

    const data = await res.json();

    if (!res.ok) {
      return setError(data.message);
    }

    setSuccess("Donation Recorded Successfully");

    searchDonor();

    setPhone("");

    setDonor(null);

    setEligible(false);

    setRemarks("");

    setUnits(1);

    fetchDonations();

  } catch (err) {

    console.error(err);

    setError("Server Error");

  }

};
   return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* ================= HEADER ================= */}

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold text-red-600">
            Blood Donations
          </h1>

          <p className="text-gray-500 mt-1">
            Search donor and record blood donation
          </p>

        </div>

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

        <div className="bg-white rounded-xl shadow p-5">

          <p className="text-gray-500">
            Total Donations
          </p>

          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {stats.totalDonations}
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-5">

          <p className="text-gray-500">
            Total Units Collected
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {stats.totalUnits}
          </h2>

        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <h2 className="text-xl font-semibold mb-4">

          Search Registered Donor

        </h2>

        <div className="flex gap-3">

          <input

            type="text"

            value={phone}

            onChange={(e)=>setPhone(e.target.value)}

            placeholder="Enter Mobile Number"

            className="flex-1 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-300 outline-none"

          />

          <button

            onClick={searchDonor}

            className="bg-red-500 hover:bg-red-600 text-white px-6 rounded-lg"

          >

            {loading ? "Searching..." : "Search"}

          </button>

        </div>

        {/* Error */}

        {error && (

          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">

            {error}

          </div>

        )}

        {/* Success */}

        {success && (

          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg">

            {success}

          </div>

        )}

      </div>

      {/* ================= DONOR CARD ================= */}

      {donor && (

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-xl font-semibold">

              Donor Information

            </h2>

            {eligible ?

              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full">

                Eligible

              </span>

              :

              <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full">

                Not Eligible

              </span>

            }

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <p className="mb-2">

                <strong>Name :</strong> {donor.name}

              </p>

              <p className="mb-2">

                <strong>Age :</strong> {donor.age}

              </p>

              <p className="mb-2">

                <strong>Gender :</strong> {donor.gender}

              </p>

              <p className="mb-2">

                <strong>Blood Group :</strong> {donor.blood_group}

              </p>

            </div>

            <div>

              <p className="mb-2">

                <strong>Phone :</strong> {donor.phone}

              </p>

              <p className="mb-2">

                <strong>Health :</strong> {donor.health_status}

              </p>

              <p className="mb-2">

                <strong>Total Donations :</strong> {donor.totalDonations}

              </p>

              <p className="mb-2">

                <strong>Total Units :</strong> {donor.totalUnits}

              </p>

              <p>

                <strong>Last Donation :</strong>{" "}

                {

                  donor.donation_date ?

                  new Date(donor.donation_date)

                  .toLocaleDateString()

                  :

                  "First Donation"

                }

              </p>

            </div>

          </div>

          {/* Donation Form */}

          {eligible && (

            <div className="border-t mt-6 pt-6">

              <div className="grid md:grid-cols-2 gap-5">

                <div>

                  <label className="font-medium">

                    Units

                  </label>

                  <input

                    type="number"

                    min="1"

                    value={units}

                    onChange={(e)=>setUnits(Number(e.target.value))}

                    className="w-full border rounded-lg p-3 mt-2"

                  />

                </div>

                <div>

                  <label className="font-medium">

                    Remarks

                  </label>

                  <input

                    type="text"

                    value={remarks}

                    onChange={(e)=>setRemarks(e.target.value)}

                    className="w-full border rounded-lg p-3 mt-2"

                    placeholder="Optional"

                  />

                </div>

              </div>

              <button

                onClick={confirmDonation}

                className="mt-6 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg"

              >

                Confirm Donation

              </button>

            </div>

          )}

        </div>

      )}
      {/* ================= RECENT DONATIONS ================= */}

      <div className="bg-white rounded-xl shadow p-6">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-semibold">
            Recent Donations
          </h2>

          <button
            onClick={fetchDonations}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
          >
            Refresh
          </button>

        </div>

        {donations.length === 0 ? (

          <div className="text-center py-10">

            <h3 className="text-lg font-semibold text-gray-600">
              No Donations Found
            </h3>

            <p className="text-gray-400 mt-2">
              Donation history will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full border border-gray-200">

              <thead className="bg-red-500 text-white">

                <tr>

                  <th className="px-4 py-3 text-left">
                    Donor
                  </th>

                  <th className="px-4 py-3 text-left">
                    Phone
                  </th>

                  <th className="px-4 py-3 text-left">
                    Blood Group
                  </th>

                  <th className="px-4 py-3 text-left">
                    Units
                  </th>

                  <th className="px-4 py-3 text-left">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {donations.map((item) => (

                  <tr
                    key={item._id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-4 py-3">
                       {item.donor_id?.profile?.full_name}
                    </td>

                    <td className="px-4 py-3">
                      {item.donor_id?.phone}
                    </td>

                    <td className="px-4 py-3">
                      {item.blood_group}
                    </td>

                    <td className="px-4 py-3">
                      {item.units}
                    </td>

                    <td className="px-4 py-3">

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                        {item.status}

                      </span>

                    </td>

                    <td className="px-4 py-3">
  {new Date(
    item.donationDate || item.createdAt
  ).toLocaleString("en-IN")}
</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}