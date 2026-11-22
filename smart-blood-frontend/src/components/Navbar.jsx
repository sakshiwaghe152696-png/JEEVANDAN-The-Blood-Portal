import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.95)" : "#fff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: "0.5px solid #f0e0e0",
        transition: "all 0.3s ease",
      }}
    >
      {/* Urgent ticker */}
      <div
        style={{
          background: "#c0392b",
          overflow: "hidden",
          padding: "6px 0",
        }}
      >
        <div className="ticker-track">
          {[
            "🔴 Urgent: O− needed — City Hospital Mumbai",
            "🟢 AB+ available — Lilavati Blood Bank",
            "🔴 B− critically low — Thane Medical Centre",
            "🟢 New donor registered — Pune",
            "🔴 Urgent: O− needed — City Hospital Mumbai",
            "🟢 AB+ available — Lilavati Blood Bank",
            "🔴 B− critically low — Thane Medical Centre",
            "🟢 New donor registered — Pune",
          ].map((msg, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                padding: "0 32px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.9)",
                whiteSpace: "nowrap",
              }}
            >
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: "64px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={() => navigate("/")}
          className="logo-wrap"
        >
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C12 3 5 10 5 15a7 7 0 0014 0C19 10 12 3 12 3z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#c0392b", letterSpacing: "-0.3px" }}>
            SmartBlood
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {["Home", "Find Blood", "Donate", "Blood Banks", "About"].map((item) => (
            <span key={item} className="nav-link">
              {item}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
          <button className="btn-primary-sm" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ticker-track {
          display: inline-flex;
          animation: ticker 20s linear infinite;
          white-space: nowrap;
        }
        .logo-icon {
          width: 36px; height: 36px;
          background: #c0392b;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.25s ease;
        }
        .logo-wrap:hover .logo-icon {
          transform: rotate(-8deg) scale(1.1);
        }
        .nav-link {
          font-size: 14px;
          color: #666;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover {
          color: #c0392b;
          background: #fdecea;
        }
        .btn-outline-sm {
          background: transparent;
          border: 1.5px solid #c0392b;
          color: #c0392b;
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline-sm:hover { background: #fdecea; }
        .btn-primary-sm {
          background: #c0392b;
          color: #fff;
          border: none;
          padding: 9px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-primary-sm:hover { background: #a93226; transform: translateY(-1px); }
        .btn-primary-sm:active { transform: scale(0.97); }
      `}</style>
    </nav>
  );
}
