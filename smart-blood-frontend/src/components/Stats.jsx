export default function Stats() {
  const bloodGroups = [
    { group: "A+",  status: "Good",     color: "#22c55e", textColor: "#15803d", units: 14 },
    { group: "A−",  status: "Good",     color: "#22c55e", textColor: "#15803d", units: 7  },
    { group: "B+",  status: "Good",     color: "#22c55e", textColor: "#15803d", units: 9  },
    { group: "B−",  status: "Low",      color: "#f59e0b", textColor: "#b45309", units: 2  },
    { group: "O+",  status: "Good",     color: "#22c55e", textColor: "#15803d", units: 21 },
    { group: "O−",  status: "Critical", color: "#ef4444", textColor: "#b91c1c", units: 1  },
    { group: "AB+", status: "Good",     color: "#22c55e", textColor: "#15803d", units: 5  },
    { group: "AB−", status: "Low",      color: "#f59e0b", textColor: "#b45309", units: 2  },
  ];

  const steps = [
    { num: "1", icon: "🏥", title: "Submit request",  desc: "Hospital or patient enters required blood group, quantity, and location." },
    { num: "2", icon: "📡", title: "Smart matching",  desc: "System scans live inventory from all nearby registered banks and donors." },
    { num: "3", icon: "✅", title: "Connect instantly", desc: "Get verified contact details and confirm pickup — all within minutes." },
  ];

  const features = [
    {
      title: "Live inventory",
      desc: "Real-time stock from all registered banks, refreshed every 30 minutes.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 3C12 3 5 10 5 15a7 7 0 0014 0C19 10 12 3 12 3z" />
        </svg>
      ),
    },
    {
      title: "Instant alerts",
      desc: "Notify eligible donors the moment an urgent request is made nearby.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      title: "Location search",
      desc: "Filter by pincode or city to find the closest verified blood source.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        </svg>
      ),
    },
    {
      title: "Bank dashboard",
      desc: "Blood banks manage stock levels, update units, and view all requests.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
    },
    {
      title: "Donor profiles",
      desc: "Donors register once, get matched automatically whenever they're eligible.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Request tracking",
      desc: "Track every blood request from submission to fulfillment in real time.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ── Blood availability ── */}
      <section style={{ padding: "56px 40px", background: "#fafafa", borderBottom: "0.5px solid #f0e0e0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span className="section-tag">Live availability</span>
            <h2 className="section-heading">Current blood stock</h2>
          </div>
          <div className="blood-grid">
            {bloodGroups.map((b, i) => (
              <div
                key={b.group}
                className="blood-pill"
                style={{ animationDelay: `${i * 0.06}s`, borderTop: `3px solid ${b.color}` }}
              >
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#c0392b", marginBottom: "8px" }}>
                  {b.group}
                </div>
                <div style={{ width: "32px", height: "5px", borderRadius: "3px", background: b.color, margin: "0 auto 8px" }} />
                <div style={{ fontSize: "12px", fontWeight: 600, color: b.textColor }}>{b.status}</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>{b.units} units</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "56px 40px", background: "#fff", borderBottom: "0.5px solid #f0e0e0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="section-tag">How it works</span>
            <h2 className="section-heading">Three steps, one life saved</h2>
          </div>
          <div className="steps-grid">
            {steps.map((s) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div style={{ fontSize: "32px", marginBottom: "14px" }}>{s.icon}</div>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "8px" }}>{s.title}</p>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "56px 40px", background: "#fafafa", borderBottom: "0.5px solid #f0e0e0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="section-tag">Features</span>
            <h2 className="section-heading">Built for speed and reliability</h2>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon-box">{f.icon}</div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a", marginBottom: "8px" }}>{f.title}</p>
                <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .section-tag {
          font-size: 12px;
          color: #c0392b;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }
        .section-heading {
          font-size: 26px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .blood-grid {
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 10px;
        }
        .blood-pill {
          background: #fff;
          border: 0.5px solid #f0e0e0;
          border-radius: 14px;
          padding: 18px 10px;
          text-align: center;
          cursor: default;
          transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
          animation: fadeUp 0.4s ease both;
        }
        .blood-pill:hover {
          transform: translateY(-5px) scale(1.03);
          border-color: #c0392b;
          box-shadow: 0 8px 20px rgba(192,57,43,0.1);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .step-card {
          background: #fff;
          border: 0.5px solid #f0e0e0;
          border-radius: 16px;
          padding: 28px;
          transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
          position: relative;
          overflow: hidden;
        }
        .step-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: #c0392b;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .step-card:hover { transform: translateY(-5px); border-color: #f0a09a; box-shadow: 0 8px 24px rgba(192,57,43,0.08); }
        .step-card:hover::before { transform: scaleX(1); }
        .step-num {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #c0392b;
          color: #fff;
          font-size: 14px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          transition: transform 0.2s;
        }
        .step-card:hover .step-num { transform: scale(1.15); }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .feature-card {
          background: #fff;
          border: 0.5px solid #f0e0e0;
          border-radius: 16px;
          padding: 28px;
          transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: #c0392b;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .feature-card:hover { transform: translateY(-6px); border-color: #f0a09a; box-shadow: 0 8px 24px rgba(192,57,43,0.08); }
        .feature-card:hover::before { transform: scaleX(1); }

        .feature-icon-box {
          width: 52px; height: 52px;
          background: #fdecea;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          color: #c0392b;
          transition: background 0.22s, transform 0.22s, color 0.22s;
        }
        .feature-card:hover .feature-icon-box {
          background: #c0392b;
          color: #fff;
          transform: rotate(-5deg) scale(1.08);
        }
      `}</style>
    </>
  );
}