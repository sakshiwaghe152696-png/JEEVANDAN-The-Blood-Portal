import { useEffect, useRef } from "react";

export default function Hero() {
  return (
    <section style={{ background: "#fff", borderBottom: "0.5px solid #f0e0e0", padding: "72px 40px 64px" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: "56px",
        }}
      >
        {/* Left: headline */}
        <div style={{ flex: 1 }} className="hero-left">
          <div className="hero-badge">
            <span className="pulse-dot" />
            Live system — updated every 30 min
          </div>

          <h1 className="hero-heading">
            The <span style={{ color: "#c0392b" }}>smart</span> way to find
            <br />blood when it matters
          </h1>

          <p className="hero-sub">
            Connect instantly with blood banks and donors across your city.
            Real-time availability, verified sources, zero delay.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
            <button className="btn-hero-primary">Find blood now</button>
            <button className="btn-hero-outline">Become a donor</button>
          </div>

          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {[
              { val: "1,200+", label: "Registered donors" },
              { val: "25+", label: "Blood banks" },
              { val: "10+", label: "Cities covered" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: i > 0 ? "32px" : "0" }}>
                {i > 0 && (
                  <div style={{ width: "1px", height: "36px", background: "#f0e0e0", marginRight: "32px" }} />
                )}
                <div className={`stat-item stat-item-${i}`}>
                  <div style={{ fontSize: "26px", fontWeight: 600, color: "#c0392b" }}>{s.val}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: search card */}
        <div style={{ flex: "0 0 290px" }} className="hero-right">
          <div className="search-card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "22px" }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#222" }}>Quick blood search</span>
            </div>

            {[
              { label: "Blood group", type: "select", options: ["A+","A−","B+","B−","O+","O−","AB+","AB−"] },
              { label: "City", type: "text", placeholder: "e.g. Mumbai" },
              { label: "Units needed", type: "number", placeholder: "1" },
            ].map((field) => (
              <div key={field.label} style={{ marginBottom: "14px" }}>
                <label className="field-label">{field.label}</label>
                {field.type === "select" ? (
                  <select className="field-input">
                    {field.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="field-input"
                  />
                )}
              </div>
            ))}

            <button className="search-btn">Search availability</button>
            <p style={{ fontSize: "11px", color: "#aaa", textAlign: "center", marginTop: "12px" }}>
              Data refreshed every 30 minutes
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.3); opacity: 0.7; }
        }

        .hero-left  { animation: fadeUp 0.6s ease both; }
        .hero-right { animation: fadeRight 0.6s 0.15s ease both; }

        .pulse-dot {
          display: inline-block;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 1.4s ease infinite;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fdecea;
          border: 0.5px solid #f0a09a;
          color: #a93226;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .hero-heading {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.18;
          color: #1a1a1a;
          margin-bottom: 18px;
          letter-spacing: -0.5px;
        }
        .hero-sub {
          font-size: 16px;
          color: #666;
          line-height: 1.75;
          margin-bottom: 32px;
          max-width: 460px;
        }
        .btn-hero-primary {
          background: #c0392b; color: #fff;
          border: none; padding: 14px 32px;
          border-radius: 10px; font-size: 15px; font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-hero-primary:hover  { background: #a93226; transform: translateY(-2px); }
        .btn-hero-primary:active { transform: scale(0.97); }

        .btn-hero-outline {
          background: transparent;
          color: #c0392b;
          border: 1.5px solid #c0392b;
          padding: 13px 30px;
          border-radius: 10px; font-size: 15px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-hero-outline:hover { background: #c0392b; color: #fff; transform: translateY(-2px); }

        .stat-item { animation: countUp 0.5s ease both; }
        .stat-item-0 { animation-delay: 0.3s; }
        .stat-item-1 { animation-delay: 0.45s; }
        .stat-item-2 { animation-delay: 0.6s; }

        .search-card {
          background: #fff;
          border: 0.5px solid #f0e0e0;
          border-radius: 18px;
          padding: 28px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(192,57,43,0.06);
        }
        .search-card:hover { border-color: #f0a09a; box-shadow: 0 8px 32px rgba(192,57,43,0.1); }

        .field-label {
          display: block;
          font-size: 12px;
          color: #888;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .field-input {
          width: 100%;
          padding: 10px 12px;
          border: 0.5px solid #e8e0e0;
          border-radius: 9px;
          font-size: 14px;
          background: #fafafa;
          color: #222;
          transition: border-color 0.2s;
          outline: none;
        }
        .field-input:focus { border-color: #c0392b; background: #fff; }

        .search-btn {
          width: 100%;
          padding: 13px;
          background: #c0392b; color: #fff;
          border: none; border-radius: 10px;
          font-size: 15px; font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 4px;
        }
        .search-btn:hover  { background: #a93226; transform: translateY(-1px); }
        .search-btn:active { transform: scale(0.98); }
      `}</style>
    </section>
  );
}