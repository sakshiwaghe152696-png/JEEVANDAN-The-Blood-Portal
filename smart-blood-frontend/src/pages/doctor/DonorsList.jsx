import { useEffect, useState } from "react";
import axios from "axios";

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5000/api/doctor/donors", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setDonors(res.data.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading donors...</h2>;

  return (
    <div style={page}>
      <h2 style={heading}>🩸 Total Donors</h2>

      <div style={cardGrid}>
        {donors.map((d, i) => (
          <div key={i} style={card} className="card">

            {/* HEADER */}
            <div style={topRow}>
              <h3 style={name}>{d.name}</h3>

              <span style={{
                ...statusBadge,
                background:
                  d.availability_status === "ACTIVE"
                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : "linear-gradient(135deg,#ef4444,#dc2626)"
              }}>
                {d.availability_status === "ACTIVE"
                  ? "🟢 ACTIVE"
                  : "🔴 INACTIVE"}
              </span>
            </div>

            {/* BLOOD GROUP */}
            <div style={bloodBadge}>
              🩸 {d.blood_group}
            </div>

            {/* INFO */}
            <div style={info}>
  <p><strong>Email:</strong> {d.email}</p>
  <p><strong>Phone:</strong> {d.phone}</p> {/* ✅ ADDED */}

  <p><strong>City:</strong> {d.city}</p>

  <p>
    <strong>Last Donation:</strong>{" "}
    {d.last_donation_date
      ?new Date(d.last_donation_date).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric"
})
      : "Never Donated"} {/* ✅ FIXED */}
  </p>
</div>

            

          </div>
        ))}
      </div>

      {/* CSS */}
      <style>{`
        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }

        button:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(59,130,246,0.4);
        }
      `}</style>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  padding: "30px",
  minHeight: "100vh",
  background: "linear-gradient(135deg,#f8fafc,#e0f2fe,#eef2ff)"
};

const heading = {
  fontSize: "26px",
  fontWeight: "700",
  marginBottom: "25px"
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "20px"
};

const card = {
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(12px)",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const name = {
  fontSize: "18px",
  fontWeight: "600"
};

const statusBadge = {
  padding: "5px 10px",
  borderRadius: "999px",
  color: "white",
  fontSize: "12px",
  fontWeight: "600"
};

const bloodBadge = {
  marginTop: "15px",
  fontSize: "20px",
  fontWeight: "bold",
  color: "#ef4444"
};

const info = {
  marginTop: "15px",
  color: "#475569",
  fontSize: "14px",
  lineHeight: "1.6"
};

const button = {
  marginTop: "20px",
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s"
};