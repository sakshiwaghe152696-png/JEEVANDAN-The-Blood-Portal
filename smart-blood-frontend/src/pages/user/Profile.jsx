import { useEffect, useState } from "react";
import axios from "axios";
import { HeartPulse, Droplet, Activity } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ donations: 0, requests: 0 });

  const [availability, setAvailability] = useState("ACTIVE");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUser(res.data);
      setAvailability(res.data.availability_status);
    });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/user/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setNotifications(res.data));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/user/stats", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStats(res.data));
  }, []);

  const handleToggle = async () => {
    const newStatus = availability === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setAvailability(newStatus);

    try {
      await axios.put(
        "http://localhost:5000/api/user/toggle-availability",
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  const initials = user.profile?.full_name
    ? user.profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  const quotes = [
    "Donate blood, save lives ❤️",
    "Be the reason someone smiles today 🩸",
    "Your blood is someone’s hope 💫",
    "Every drop counts 🌍"
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div style={page} className="fadeIn">

      {/* PROFILE */}
      <div style={card} className="hoverCard glass">
        <div style={topRow}>
          <div style={profileLeft}>
            <div style={avatar} className="glowAvatar">{initials}</div>
            <div>
              <h2 className="title">{user.profile?.full_name}</h2>
              <p style={sub}>{user.email}</p>
            </div>
          </div>

          <div style={bloodBadge} className="bloodBadge pulse">
            🩸 {user.blood_group || "N/A"}
          </div>

          <button
            onClick={handleToggle}
            className={`toggleBtn ${availability}`}
          >
            {availability === "ACTIVE" ? "🟢 Available" : "🔴 Not Available"}
          </button>

          <button style={logoutBtn} onClick={handleLogout} className="btnGlow">
            Logout
          </button>
        </div>

        <div style={grid}>
          <InfoBox label="Phone" value={user.phone} />
          <InfoBox label="City" value={user.city} />
          <InfoBox label="Gender" value={user.profile?.gender || "N/A"} />
          <InfoBox label="Hemoglobin" value={user.medical?.hemoglobin || "N/A"} />
          <InfoBox
  label="Last Donation"
  value={
    user.lastDonationDate
      ? new Date(user.lastDonationDate).toLocaleDateString()
      : "Never"
  }
/>

<InfoBox
  label="Next Donation"
  value={
    user.nextDonationDate
      ? new Date(user.nextDonationDate).toLocaleDateString()
      : "N/A"
  }
/>

<InfoBox
  label="Eligibility"
  value={
    user.eligible
      ? "🟢 Eligible"
      : `🟡 ${user.daysRemaining} day(s) remaining`
  }
/>

<InfoBox
  label="Blood Group"
  value={user.blood_group || "N/A"}
/>
        </div>
      </div>

      {/* QUOTE */}
      <div style={quoteCard} className="quoteGlow">{randomQuote}</div>

      {/* STATS */}
      <div style={card} className="hoverCard glass">
        <h3>📊 Activity</h3>

        <div style={grid}>
          <StatCard title="Donations" value={stats.donations} icon={<Droplet />} color="#ff4d6d" />
          <StatCard title="Requests" value={stats.requests} icon={<Activity />} color="#4f46e5" />
          <StatCard title="Lives Impacted" value={stats.donations * 2} icon={<HeartPulse />} color="#10b981" />
        </div>

        <div style={chartBox}>
          <Bar label="Donations" value={stats.donations} />
          <Bar label="Requests" value={stats.requests} />
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div style={card} className="hoverCard glass">
        <h3>🔔 Notifications</h3>

        {notifications.length === 0 ? (
          <p style={sub}>No notifications</p>
        ) : (
          notifications.map((note, i) => (
            <div key={i} style={notification} className="notification">
              <p style={{ fontWeight: 600 }}>{note.title}</p>
              <p style={sub}>{note.message}</p>
            </div>
          ))
        )}
      </div>

      {/* CSS */}
      <style>{`
        body {
          font-family: 'Poppins', sans-serif;
        }

        .glass {
          backdrop-filter: blur(20px);
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.3);
        }

        .title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .fadeIn {
          animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }

        .hoverCard:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 60px rgba(0,0,0,0.15);
        }

        .glowAvatar {
          animation: glow 3s infinite alternate;
        }

        @keyframes glow {
          from { box-shadow: 0 0 10px rgba(99,102,241,0.4);}
          to { box-shadow: 0 0 25px rgba(236,72,153,0.6);}
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1);}
          50% { transform: scale(1.08);}
          100% { transform: scale(1);}
        }

        .toggleBtn {
          padding: 10px 18px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          color: white;
          transition: 0.4s;
        }

        .toggleBtn.ACTIVE {
          background: linear-gradient(135deg,#22c55e,#16a34a);
          box-shadow: 0 0 15px rgba(34,197,94,0.6);
        }

        .toggleBtn.INACTIVE {
          background: linear-gradient(135deg,#64748b,#334155);
        }

        .toggleBtn:hover {
          transform: scale(1.08);
        }

        .btnGlow:hover {
          box-shadow: 0 0 20px rgba(59,130,246,0.6);
        }

        .quoteGlow {
          box-shadow: 0 10px 40px rgba(6,182,212,0.5);
        }

        .statCard:hover {
          transform: translateY(-6px) scale(1.03);
        }

        .notification:hover {
          transform: translateX(8px);
          background: #f8fafc;
        }
      `}</style>

    </div>
  );
}

/* ==== SAME STYLES (slightly enhanced colors only) ==== */

const page = {
  minHeight: "100vh",
  padding: "30px",
  background: "linear-gradient(135deg,#e0f2fe,#eef2ff,#fdf2f8)",
  color: "#0f172a"
};

const card = {
  maxWidth: "950px",
  margin: "auto",
  marginBottom: "25px",
  padding: "25px",
  borderRadius: "20px",
  transition: "all 0.3s ease"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "10px"
};

const profileLeft = {
  display: "flex",
  gap: "15px",
  alignItems: "center"
};

const avatar = {
  width: "75px",
  height: "75px",
  borderRadius: "50%",
  background: "linear-gradient(135deg,#6366f1,#ec4899,#06b6d4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  color: "white",
  fontSize: "20px"
};

const bloodBadge = {
  padding: "12px 18px",
  borderRadius: "999px",
  background: "linear-gradient(135deg,#ef4444,#f97316)",
  color: "white",
  fontWeight: "600",
  cursor: "pointer"
};

const logoutBtn = {
  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
  border: "none",
  padding: "10px 20px",
  borderRadius: "12px",
  color: "white",
  cursor: "pointer",
  fontWeight: "600"
};

const quoteCard = {
  maxWidth: "950px",
  margin: "auto",
  marginBottom: "20px",
  padding: "20px",
  borderRadius: "16px",
  textAlign: "center",
  background: "linear-gradient(135deg,#22c55e,#06b6d4)",
  color: "white"
};

const grid = {
  marginTop: "20px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "15px"
};

const sub = { color: "#64748b" };

const notification = {
  background: "rgba(255,255,255,0.8)",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "12px",
  border: "1px solid #e2e8f0"
};

const chartBox = {
  marginTop: "20px"
};

/* ===== SAME COMPONENTS ===== */

function InfoBox({ label, value }) {
  return (
    <div style={{
      padding: "12px",
      borderRadius: "12px",
      background: "white",
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
    }}>
      <p style={{ fontSize: "12px" }}>{label}</p>
      <p style={{ fontWeight: "600" }}>{value}</p>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += Math.ceil(value / 20);
      if (i >= value) {
        i = value;
        clearInterval(interval);
      }
      setCount(i);
    }, 50);
  }, [value]);

  return (
    <div style={{
      padding: "18px",
      borderRadius: "16px",
      background: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
    }} className="statCard">
      <div>
        <p>{title}</p>
        <h2>{count}</h2>
      </div>

      <div style={{
        background: color,
        padding: "10px",
        borderRadius: "50%",
        color: "white"
      }}>
        {icon}
      </div>
    </div>
  );
}

function Bar({ label, value }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <p>{label}</p>
      <div style={{
        height: "10px",
        background: "#e2e8f0",
        borderRadius: "10px"
      }}>
        <div style={{
          width: `${value * 10}px`,
          height: "100%",
          background: "linear-gradient(90deg,#6366f1,#06b6d4)",
          borderRadius: "10px",
          transition: "width 1s ease"
        }} />
      </div>
    </div>
  );
}