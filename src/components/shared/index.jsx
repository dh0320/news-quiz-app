import { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext, AVATAR_ZORK, AVATAR_PINO } from "../../context/ThemeContext.jsx";

// ── Scanlines overlay ──
export const Scanlines = () => {
  const t = useContext(ThemeContext);
  if (!t.scanlines) return null;
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${t.scanlineColor} 2px, ${t.scanlineColor} 4px)`, mixBlendMode: "multiply" }} />;
};

// ── Glitch text effect ──
export const GlitchText = ({ children, style = {}, as: Tag = "span" }) => {
  const t = useContext(ThemeContext);
  const [g, setG] = useState(false);
  useEffect(() => {
    if (!t.glitch) return;
    const iv = setInterval(() => { if (Math.random() > 0.92) { setG(true); setTimeout(() => setG(false), 120); } }, 2000);
    return () => clearInterval(iv);
  }, [t.glitch]);
  return <Tag style={{ ...style, position: "relative", display: "inline-block", ...(g ? { textShadow: `2px 0 ${t.vars.error}, -2px 0 ${t.vars.accent}`, transform: `translate(${Math.random()*2-1}px,${Math.random()*2-1}px)` } : {}), transition: g ? "none" : "all 0.1s" }}>{children}</Tag>;
};

// ── Theme-aware container ──
export const TBox = ({ children, style = {}, accent = false, glow = false }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const bc = accent ? "var(--accent)" : "var(--border)";
  const shadow = glow && ui.glowShadow ? `0 0 20px ${accent ? "var(--accent-glow)" : "transparent"}` : ui.boxShadow;
  return (
    <div style={{
      border: `${ui.borderWidth} ${ui.borderStyle} ${bc}`,
      background: "var(--surface)", padding: "16px", position: "relative",
      borderRadius: ui.radiusLg, boxShadow: shadow,
      ...style,
    }}>
      {ui.cornerBrackets && [["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
        <div key={v+h} style={{ position:"absolute",[v]:"-2px",[h]:"-2px",width:"6px",height:"6px", background: accent ? "var(--accent)" : "var(--primary)" }}/>
      ))}
      {children}
    </div>
  );
};

// ── Typewriter text animation ──
export const TypewriterText = ({ text, speed = 30, onComplete, style = {}, skip = false }) => {
  const [d, setD] = useState(""); const [done, setDone] = useState(false); const idx = useRef(0);
  useEffect(() => {
    idx.current = 0; setD(""); setDone(false);
    const tm = setInterval(() => { idx.current++; if (idx.current >= text.length) { setD(text); setDone(true); clearInterval(tm); onComplete?.(); } else setD(text.slice(0, idx.current)); }, speed);
    return () => clearInterval(tm);
  }, [text]);
  useEffect(() => { if (skip && !done) { setD(text); setDone(true); onComplete?.(); } }, [skip]);
  return <span style={style}>{d}{!done && <span style={{ opacity: 0.7, animation: "blink 0.6s steps(1) infinite" }}>▋</span>}</span>;
};

// ── Title divider ──
export const TitleDivider = ({ style: extra = {} }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  return (
    <div style={{
      width: ui.dividerWidth, height: ui.dividerHeight,
      background: "var(--accent)", margin: "12px auto",
      borderRadius: ui.dividerRadius,
      ...(ui.glowShadow ? { boxShadow: "0 0 10px var(--accent-glow)" } : {}),
      ...extra,
    }} />
  );
};

// ── Phase transition animation ──
export const PhaseTransition = ({ label, sublabel, onDone }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const [step, setStep] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setStep(1), 100), b = setTimeout(() => setStep(2), 600), c = setTimeout(() => setStep(3), 2200), d = setTimeout(() => { setStep(4); onDone?.(); }, 2800);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); clearTimeout(d); };
  }, []);
  const lineBar = (pos) => (
    <div style={{ width: step >= 1 ? "80%" : "0%", height: "2px", background: "var(--accent)", transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)", ...(pos === "top" ? { marginBottom: "24px" } : { marginTop: "24px" }), ...(ui.glowShadow ? { boxShadow: "0 0 16px var(--accent-glow)" } : {}) }} />
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", opacity: step===0||step===4 ? 0 : 1, transition: "opacity 0.5s" }}>
      {ui.transitionStyle === "centered" ? (
        <div style={{ textAlign: "center", opacity: step >= 2 ? 1 : 0, transition: "all 0.8s" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,10vw,52px)", color: "var(--accent)", fontWeight: ui.fontWeightDisplay, letterSpacing: "0.2em" }}>{label}</div>
          {sublabel && <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "12px", letterSpacing: "0.15em" }}>{sublabel}</div>}
          <TitleDivider style={{ marginTop: "16px" }} />
        </div>
      ) : (
        <>
          {lineBar("top")}
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,5vw,32px)", color: "var(--accent)", letterSpacing: "0.3em", textTransform: "uppercase", opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateY(0)" : "translateY(10px)", transition: "all 0.5s", textAlign: "center" }}>{label}</div>
          {sublabel && <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-dim)", marginTop: "8px", letterSpacing: "0.15em", opacity: step >= 2 ? 1 : 0, transition: "opacity 0.5s 0.2s" }}>{sublabel}</div>}
          {lineBar("bottom")}
        </>
      )}
    </div>
  );
};

// ── Particle background ──
export const ParticleBg = () => {
  const t = useContext(ThemeContext);
  if (!t.particles) return null;
  const ps = useRef(Array.from({length:15},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:1+Math.random()*2,dur:8+Math.random()*12,delay:Math.random()*5}))).current;
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>{ps.map(p=><div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:`${p.size}px`,height:`${p.size}px`,borderRadius:"50%",background:t.particleColor,opacity:0.15,animation:`float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`}}/>)}</div>;
};

// ── Theme-specific decorations ──
export const ThemeDecor = () => {
  const t = useContext(ThemeContext);
  if (t.id === "wamono") return <div style={{position:"fixed",top:0,right:0,width:"120px",height:"120px",pointerEvents:"none",zIndex:0,opacity:0.04}}><svg viewBox="0 0 100 100"><circle cx="70" cy="30" r="40" fill={t.vars.accent}/><circle cx="50" cy="60" r="20" fill={t.vars.accent}/></svg></div>;
  if (t.id === "vapor") return <div style={{position:"fixed",bottom:0,left:0,right:0,height:"30vh",pointerEvents:"none",zIndex:0,overflow:"hidden",opacity:0.12,backgroundImage:"linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",backgroundSize:"30px 30px",transform:"perspective(300px) rotateX(60deg)",transformOrigin:"bottom center"}}/>;
  if (t.id === "noir") return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,opacity:0.5,background:"radial-gradient(ellipse at 30% 20%, rgba(212,168,67,0.06) 0%, transparent 60%)"}}/>;
  if (t.id === "retro") {
    const stars = useRef(Array.from({length:12},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,s:8+Math.random()*12,d:1+Math.random()*3}))).current;
    return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>{stars.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,fontSize:`${s.s}px`,color:"#ffff00",opacity:0.15,animation:`blink ${s.d}s steps(1) infinite`}}>★</div>)}</div>;
  }
  return null;
};

// ── Character Avatar ──
export const CharAvatar = ({ isTeacher, size = 36, style: extra = {} }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const src = isTeacher ? AVATAR_ZORK : AVATAR_PINO;
  const color = isTeacher ? "var(--accent)" : "var(--secondary)";
  return (
    <div style={{
      width: size, height: size, minWidth: size,
      border: `2px solid ${color}`,
      borderRadius: ui.radiusFull,
      overflow: "hidden",
      background: isTeacher ? "var(--accent-glow)" : `${t.vars.secondary}11`,
      ...extra,
    }}>
      <img src={src} alt={isTeacher ? lb.charNames[0] : lb.charNames[1]}
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};
