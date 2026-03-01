import { useState, useContext } from "react";
import { Palette } from "lucide-react";
import { ThemeContext, THEMES, tapProps } from "../context/ThemeContext.jsx";

const ThemeSelector = ({ currentTheme, onSelect }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid var(--border)", cursor: "pointer", fontSize: "12px", color: "var(--text-dim)", background: "var(--surface)", borderRadius: ui.radius }} {...tapProps}>
        <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "6px" }}><Palette size={13} /> THEME: {currentTheme.name}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: "10px" }}>▼</span>
      </div>
      {open && (
        <div style={{ border: "1px solid var(--border)", borderTop: "none", background: "var(--surface)", animation: "fadeSlideUp 0.2s ease-out" }}>
          {Object.values(THEMES).map(th => (
            <div key={th.id} onClick={() => { onSelect(th); setOpen(false); }} style={{
              padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
              borderBottom: "1px solid var(--border)", fontSize: "13px",
              background: th.id === currentTheme.id ? "var(--accent-glow)" : "transparent",
              color: th.id === currentTheme.id ? "var(--accent)" : "var(--text)", transition: "background 0.2s",
            }}>
              <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>{th.icon}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{th.name}</div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "1px" }}>{th.nameEn}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
