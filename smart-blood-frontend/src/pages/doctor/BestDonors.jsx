import { useState } from "react";
import {
  getBestDonors,
  notifyDonor,
} from "../../services/doctorApi";

export default function BestDonors() {
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      console.log("Selected blood group:", bloodGroup);
      const res = await getBestDonors(bloodGroup);
      setDonors(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch donors");
    } finally {
      setLoading(false);
    }
  };
  const sendSMS = async (id) => {
  try {
    const res = await notifyDonor(id);

    if (res.success) {
      alert("✅ SMS sent successfully");
    } else {
      alert(res.message);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to send SMS");
  }
};

  return (
    <div style={page}>
      <h2 style={heading}>🏆 Best Donor Selection</h2>

      {/* FILTER */}
      <div style={filterBox}>
        <select
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          style={select}
        >
          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>AB+</option>
          <option>AB-</option>
          <option>O+</option>
          <option>O-</option>
        </select>

        <button onClick={fetchDonors} style={button}>
          {loading ? "Finding..." : "Find Best Donor 🔍"}
        </button>
      </div>

      {/* RESULTS */}
      <div style={grid}>
        {donors.length === 0 && !loading && <p>No donors found</p>}

        {donors.map((d) => (
          <div key={d.rank} style={card} className="card">

            <h3 style={rank}>🏆 Rank #{d.rank}</h3>
            <h2 style={name}>{d.name}</h2>

            <div style={badge}>🩸 {d.blood_group}</div>

            <div style={info}>
              <p>📞 {d.phone}</p>
              <p>📍 {d.city}</p>
              <p>💉 Hb: {d.hemoglobin || "N/A"}</p>

              <p>
                🗓 Last Donation:{" "}
                {d.last_donation_date
                  ? new Date(d.last_donation_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })
                  : "Never"}
              </p>

              <p>⭐ Score: {d.score.toFixed(3)}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div style={buttonRow}>
              
              {/* CALL */}
              <a href={`tel:${d.phone}`} style={linkStyle}>
                <button style={{ ...actionBtn, background: "#3b82f6" }}>
                  📞 Call
                </button>
              </a>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/91${d.phone}`}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                <button style={{ ...actionBtn, background: "#22c55e" }}>
                  💬 WhatsApp
                </button>
              </a>
              <button
  onClick={() => sendSMS(d._id)}
  style={{
    ...actionBtn,
    background: "#ef4444"
  }}
>
  🚨 Notify
</button>

            </div>

          </div>
        ))}
      </div>

      {/* HOVER EFFECT */}
      <style>{`
        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  padding: "30px",
  minHeight: "100vh",
  background: "linear-gradient(135deg,#f0f9ff,#e0f2fe,#eef2ff)"
};

const heading = {
  fontSize: "28px",
  fontWeight: "700",
  marginBottom: "20px"
};

const filterBox = {
  display: "flex",
  gap: "15px",
  marginBottom: "25px",
  alignItems: "center"
};

const select = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc"
};

const button = {
  padding: "10px 20px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg,#ef4444,#dc2626)",
  color: "white",
  cursor: "pointer",
  fontWeight: "600"
};

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px" };

const card = {
  width: "300px",
  background: "#fff",
  borderRadius: "20px",
  padding: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
  position: "relative",
  overflow: "hidden"
};

const rank = {
  color: "#f59e0b",
  fontWeight: "700"
};

const name = {
  fontSize: "20px",
  fontWeight: "600"
};

const badge = {
  marginTop: "10px",
  fontSize: "18px",
  fontWeight: "bold",
  color: "#ef4444"
};

const info = {
  marginTop: "15px",
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6"
};

const buttonRow = {
  display: "flex",
  gap: "12px",
  marginTop: "20px",
  width: "100%"
};

const linkStyle = {
  flex: 1,
  display: "flex",
  textDecoration: "none"
};

const actionBtn = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.25s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px"
};