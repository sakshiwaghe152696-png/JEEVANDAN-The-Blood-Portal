export default function Footer() {
  const links = {
    Platform: ["Find blood", "Donate blood", "Blood banks", "Request blood", "Track request"],
    Resources: ["Blood types guide", "Donation FAQ", "Eligibility check", "API docs", "GitHub repo"],
    Contact:   ["About the project", "Meet the team", "Report an issue", "Privacy policy", "Terms of use"],
  };

  const socials = [
    {
      label: "GitHub",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      label: "Twitter",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      ),
    },
  ];

  return (
    <footer style={{ background: "#111" }}>
      {/* CTA banner */}
      <div style={{ background: "#c0392b", padding: "56px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: "540px", margin: "0 auto" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C12 3 5 10 5 15a7 7 0 0014 0C19 10 12 3 12 3z" fill="white" />
            </svg>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", marginBottom: "12px", lineHeight: 1.3 }}>
            Your blood could save three lives today
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", marginBottom: "28px", lineHeight: 1.7 }}>
            Join 1,200+ registered donors across 10 cities. Takes 5 minutes to sign up.
          </p>
          <button className="cta-btn">Register as a donor — it&apos;s free</button>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "14px" }}>
            No spam. We only contact you when your blood type is needed nearby.
          </p>
        </div>
      </div>

      {/* Footer body */}
      <div style={{ padding: "52px 40px 0", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="footer-grid">
          {/* Brand col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "32px", height: "32px",
                background: "#c0392b",
                borderRadius: "9px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C12 3 5 10 5 15a7 7 0 0014 0C19 10 12 3 12 3z" fill="white" />
                </svg>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>SmartBlood</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: "20px", maxWidth: "220px" }}>
              A final year engineering project building real-time blood availability infrastructure for India.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: "8px" }}>
              {socials.map((s) => (
                <div key={s.label} className="social-btn" title={s.label}>
                  {s.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "16px" }}>
                {heading}
              </p>
              {items.map((item) => (
                <a key={item} className="footer-link">{item}</a>
              ))}
            </div>
          ))}
        </div>

        {/* Divider + bottom bar */}
        <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", marginTop: "40px" }} />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 0",
          flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
            © 2026 SmartBlood — Final Year Project, B.E. Computer Engineering
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>All systems live</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.3); opacity: 0.7; }
        }

        .cta-btn {
          background: #fff;
          color: #c0392b;
          border: none;
          padding: 15px 36px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .cta-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .cta-btn:active { transform: scale(0.97); }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 36px;
          padding-bottom: 44px;
        }

        .footer-link {
          display: block;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.18s, padding-left 0.18s;
          text-decoration: none;
        }
        .footer-link:hover { color: #fff; padding-left: 4px; }

        .social-btn {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 0.5px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .social-btn:hover {
          background: #c0392b;
          border-color: #c0392b;
          transform: translateY(-3px);
        }

        .live-dot {
          display: inline-block;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 1.4s ease infinite;
        }
      `}</style>
    </footer>
  );
}