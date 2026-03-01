import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { ShieldAlert, FlaskConical, ChevronRight, Database, Palette, Clock, FolderOpen, CheckCircle2, XCircle, Telescope } from "lucide-react";
import episodeDataJson from "./data/episodes/2026-02-28-news-01.json";

// ═══════════════════════════════════════════
//  CHARACTER AVATARS (Base64 embedded)
// ═══════════════════════════════════════════
const AVATAR_ZORK = "/assets/avatar-zork.webp";
const AVATAR_PINO = "/assets/avatar-pino.webp";

// ═══════════════════════════════════════════
//  THEME DEFINITIONS — uiStyle + labels で全分岐を吸収
// ═══════════════════════════════════════════

const BASE_UI = {
  radius: "0px",
  radiusLg: "0px",
  radiusFull: "0px",
  borderStyle: "solid",
  borderWidth: "2px",
  cornerBrackets: true,
  boxShadow: "none",
  glowShadow: true,
  barBg: "rgba(10,10,18,0.95)",
  transitionStyle: "lines",
  fontWeightDisplay: "normal",
  fontWeightHeading: "normal",
  letterSpacingTitle: "0.08em",
  subtitleFont: "inherit",
  italicSubtitle: true,
  dividerWidth: "60px",
  dividerHeight: "2px",
  dividerRadius: "0px",
  stampFrame: true,
};

const BASE_LABELS = {
  todayCase: "TODAY'S REPORT",
  recentCases: "RECENT REPORTS",
  startButton: "調査を開始する",
  streak: "▸ 連続7日目",
  caseClosedTitle: "調査完了",
  caseClosedLabel: "REPORT FILED",
  investigationLabel: "OBSERVATION PHASE",
  confirmLabel: "CONFIRM PHASE",
  exploreLabel: "EXPLORE PHASE",
  keywordBank: "── KEYWORD BANK ──",
  exploreButton: "探究する",
  categoryIcons: ["📡", "📖", "🔥"],
  avatarLabels: ["Zo", "Pi"],
  charNames: ["ゾルク博士", "ピノ"],
  correctBanner: "確認成功 (CONFIRMED)",
  wrongBanner: "確認失敗 (ERROR)",
  watermark: "REPORT",
};

// ── Tap feedback utility ──
const tapProps = {
  onTouchStart: e => { e.currentTarget.style.transform = "scale(0.96)"; },
  onTouchEnd: e => { e.currentTarget.style.transform = "scale(1)"; },
  onTouchCancel: e => { e.currentTarget.style.transform = "scale(1)"; },
};

const THEMES = {
  cyber: {
    id: "cyber", name: "サイバー調", nameEn: "CYBER STATION", icon: "⟁",
    appTitle: "地球人調査センター", appTitleEn: "EARTH OBSERVATION CENTER",
    subtitle: "─── 15分で地球を調査せよ ───",
    fonts: `@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Noto+Sans+JP:wght@300;400;500&display=swap');`,
    fontDisplay: "'DotGothic16', monospace",
    fontBody: "'Noto Sans JP', sans-serif",
    vars: {
      bg: "#0a0a12", surface: "#12121e", border: "#2a2a3a",
      primary: "#e8e8f0", text: "#c8c8d8", textDim: "#6a6a80",
      accent: "#00ffaa", accentGlow: "rgba(0,255,170,0.3)",
      secondary: "#ff64c8", error: "#ff3c5a",
    },
    scanlines: true, scanlineColor: "rgba(0,0,0,0.06)",
    particles: true, particleColor: "var(--accent)",
    glitch: true,
    bgStyle: {},
    uiStyle: { ...BASE_UI },
    labels: { ...BASE_LABELS },
  },

  wamono: {
    id: "wamono", name: "和モダン怪奇", nameEn: "調査帖", icon: "朱",
    appTitle: "地球調査帖", appTitleEn: "CHIKYU-CHOSA-CHOU",
    subtitle: "─── 十五分にて地球を紐解け ───",
    fonts: `@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;600;800&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap');`,
    fontDisplay: "'Shippori Mincho', serif",
    fontBody: "'Zen Kaku Gothic New', sans-serif",
    vars: {
      bg: "#f5f0e8", surface: "#ebe5d8", border: "#c8b89a",
      primary: "#1a1008", text: "#2a2018", textDim: "#8a7a60",
      accent: "#b8292f", accentGlow: "rgba(184,41,47,0.08)",
      secondary: "#2a5a3a", error: "#b8292f",
    },
    scanlines: false, scanlineColor: "transparent",
    particles: false, particleColor: "var(--accent)",
    glitch: false,
    bgStyle: { backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")" },
    uiStyle: {
      ...BASE_UI,
      radius: "4px", radiusLg: "8px", radiusFull: "8px",
      borderStyle: "double", borderWidth: "3px",
      cornerBrackets: false,
      glowShadow: false,
      barBg: "var(--surface)",
      transitionStyle: "centered",
      fontWeightDisplay: 800, fontWeightHeading: 600,
      italicSubtitle: false,
      dividerWidth: "40px", dividerHeight: "4px", dividerRadius: "2px",
    },
    labels: {
      ...BASE_LABELS,
      todayCase: "本日の調査",
      recentCases: "過去の調査",
      startButton: "調査を始める",
      streak: "七日連続",
      caseClosedTitle: "調査了",
      caseClosedLabel: "報告完了",
      investigationLabel: "観察",
      confirmLabel: "確認",
      exploreLabel: "探究",
      keywordBank: "─ 語句一覧 ─",
      exploreButton: "探究する",
      categoryIcons: ["巻", "書", "風"],
      avatarLabels: ["師", "弟"],
      charNames: ["師匠", "弟子"],
      correctBanner: "── 的中 ──",
      wrongBanner: "── 外れ ──",
      watermark: "了",
    },
  },

  noir: {
    id: "noir", name: "ノワール探偵", nameEn: "EARTH FILE", icon: "🔍",
    appTitle: "EARTH FILE", appTitleEn: "FIELD REPORT",
    subtitle: "─── The truth is in the details ───",
    fonts: `@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Noto+Sans+JP:wght@300;400;500&display=swap');`,
    fontDisplay: "'Special Elite', 'Noto Sans JP', serif",
    fontBody: "'Noto Sans JP', sans-serif",
    vars: {
      bg: "#1c1a17", surface: "#252219", border: "#3d3830",
      primary: "#e8dcc8", text: "#c8b898", textDim: "#7a7060",
      accent: "#d4a843", accentGlow: "rgba(212,168,67,0.15)",
      secondary: "#c45c3e", error: "#c45c3e",
    },
    scanlines: false, scanlineColor: "transparent",
    particles: false, particleColor: "var(--accent)",
    glitch: false,
    bgStyle: {},
    uiStyle: {
      ...BASE_UI,
      cornerBrackets: false,
      boxShadow: "inset 0 0 30px rgba(0,0,0,0.3)",
      barBg: "rgba(28,26,23,0.95)",
    },
    labels: {
      ...BASE_LABELS,
      todayCase: "TODAY'S FIELD REPORT",
      startButton: "Open File",
      correctBanner: "CONFIRMED.",
      wrongBanner: "WRONG LEAD.",
      watermark: "FILED",
      avatarLabels: ["Dr", "Pi"],
      charNames: ["Dr.Zork", "Pino"],
    },
  },

  retro: {
    id: "retro", name: "90年代ネット", nameEn: "GeoCities", icon: "🌐",
    appTitle: "地球人調査センター★", appTitleEn: "EARTH HOMEPAGE",
    subtitle: "☆★☆ ようこそ！あなたは 4,821 人目の訪問者です ☆★☆",
    fonts: `@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=VT323&display=swap');`,
    fontDisplay: "'VT323', 'DotGothic16', monospace",
    fontBody: "'DotGothic16', monospace",
    vars: {
      bg: "#000060", surface: "#000040", border: "#0080ff",
      primary: "#ffffff", text: "#ffff00", textDim: "#00cccc",
      accent: "#00ff00", accentGlow: "rgba(0,255,0,0.15)",
      secondary: "#ff00ff", error: "#ff0000",
    },
    scanlines: true, scanlineColor: "rgba(0,0,80,0.12)",
    particles: false, particleColor: "var(--accent)",
    glitch: false,
    bgStyle: {},
    uiStyle: { ...BASE_UI, barBg: "rgba(0,0,60,0.95)", subtitleFont: "var(--font-display)" },
    labels: {
      ...BASE_LABELS,
      todayCase: "★ TODAY ★",
      recentCases: "☆ PAST ☆",
      startButton: ">> START <<",
      streak: "★ 7日連続 ★",
      investigationLabel: ">> OBSERVATION <<",
      confirmLabel: ">> CONFIRM <<",
      exploreLabel: ">> EXPLORE <<",
      avatarLabels: ["博", "ピ"],
      charNames: ["ハカセ", "ピノ"],
      correctBanner: "(^o^) 正解！",
      wrongBanner: "(>_<) 不正解",
      watermark: "CLEAR!",
    },
  },

  labnote: {
    id: "labnote", name: "理科室ノート", nameEn: "EARTH LAB NOTE", icon: "📓",
    appTitle: "地球観察ラボノート", appTitleEn: "EARTH LAB NOTE",
    subtitle: "─── 毎日15分の観察記録 ───",
    fonts: `@import url('https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap');`,
    fontDisplay: "'Klee One', cursive",
    fontBody: "'Zen Kaku Gothic New', sans-serif",
    vars: {
      bg: "#f8f6f0", surface: "#ffffff", border: "#c8d8c8",
      primary: "#2a3a2a", text: "#3a4a3a", textDim: "#8a9a8a",
      accent: "#2a8a5a", accentGlow: "rgba(42,138,90,0.1)",
      secondary: "#d46a20", error: "#c84040",
    },
    scanlines: false, scanlineColor: "transparent",
    particles: false, particleColor: "var(--accent)",
    glitch: false,
    bgStyle: {
      backgroundImage: "linear-gradient(rgba(100,160,140,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,160,140,0.08) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    },
    uiStyle: {
      ...BASE_UI,
      radius: "6px", radiusLg: "12px", radiusFull: "50%",
      cornerBrackets: false,
      boxShadow: "2px 2px 8px rgba(0,0,0,0.06)",
      glowShadow: false,
      barBg: "var(--surface)",
      stampFrame: false,
    },
    labels: {
      ...BASE_LABELS,
      todayCase: "今日の観察テーマ",
      startButton: "観察を始める",
      confirmLabel: "理解度チェック",
      exploreLabel: "深掘りテスト",
      avatarLabels: ["Dr", "Pi"],
      charNames: ["ゾルク先生", "ピノちゃん"],
      correctBanner: "正解です！",
      wrongBanner: "不正解…",
      watermark: "完了",
    },
  },

  vapor: {
    id: "vapor", name: "ヴェイパーウェイヴ", nameEn: "ＥＡＲＴＨ ＷＡＶＥ", icon: "🌴",
    appTitle: "ＥＡＲＴＨ　ＷＡＶＥ", appTitleEn: "地 球 波",
    subtitle: "─── ｅｖｅｒｙ　ｄａｙ　１５ｍｉｎ ───",
    fonts: `@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap');`,
    fontDisplay: "'DotGothic16', monospace",
    fontBody: "'Zen Kaku Gothic New', sans-serif",
    vars: {
      bg: "#1a0a2e", surface: "#200e38", border: "#4a2a6a",
      primary: "#ffeeff", text: "#e0c0e8", textDim: "#9070a8",
      accent: "#00e5ff", accentGlow: "rgba(0,229,255,0.15)",
      secondary: "#ff71ce", error: "#ff3860",
    },
    scanlines: true, scanlineColor: "rgba(60,0,80,0.08)",
    particles: true, particleColor: "var(--secondary)",
    glitch: false,
    bgStyle: { backgroundImage: "linear-gradient(180deg, #1a0a2e 0%, #0a1628 50%, #1a0a2e 100%)" },
    uiStyle: { ...BASE_UI, letterSpacingTitle: "0.2em", barBg: "rgba(26,10,46,0.95)" },
    labels: {
      ...BASE_LABELS,
      todayCase: "ＴＯＤＡＹ",
      startButton: "ＳＴＡＲＴ",
      avatarLabels: ["Ｚ", "Ｐ"],
      charNames: ["Ｚｏｒｋ", "Ｐｉｎｏ"],
      correctBanner: "ＣＯＮＦＩＲＭＥＤ",
      wrongBanner: "ＥＲＲＯＲ",
      watermark: "ＤＯＮＥ",
    },
  },

  comic: {
    id: "comic", name: "コミック調", nameEn: "COMIC POP", icon: "💥",
    appTitle: "地球人クイズバトル！", appTitleEn: "EARTH QUIZ BATTLE!",
    subtitle: "── 毎日15分のスキルアップタイム！ ──",
    fonts: `@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;900&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap');`,
    fontDisplay: "'M PLUS Rounded 1c', sans-serif",
    fontBody: "'Zen Kaku Gothic New', sans-serif",
    vars: {
      bg: "#fafafa", surface: "#ffffff", border: "#222222",
      primary: "#111111", text: "#222222", textDim: "#777777",
      accent: "#ff3366", accentGlow: "rgba(255,51,102,0.1)",
      secondary: "#3366ff", error: "#ff3366",
    },
    scanlines: false, scanlineColor: "transparent",
    particles: false, particleColor: "var(--accent)",
    glitch: false,
    bgStyle: {
      backgroundImage: "radial-gradient(circle, #00000008 1px, transparent 1px)",
      backgroundSize: "16px 16px",
    },
    uiStyle: {
      ...BASE_UI,
      radius: "10px", radiusLg: "16px", radiusFull: "50%",
      borderWidth: "3px",
      cornerBrackets: false,
      boxShadow: "4px 4px 0px var(--border)",
      glowShadow: false,
      barBg: "var(--surface)",
      transitionStyle: "centered",
      fontWeightDisplay: 900, fontWeightHeading: 700,
      italicSubtitle: false,
      letterSpacingTitle: "0.04em",
      dividerWidth: "50px", dividerHeight: "4px", dividerRadius: "2px",
    },
    labels: {
      ...BASE_LABELS,
      todayCase: "今日のバトル！",
      recentCases: "バトル履歴",
      startButton: "バトル開始！",
      streak: "🔥 7日連続！",
      caseClosedTitle: "バトル完了！",
      caseClosedLabel: "BATTLE CLEAR",
      investigationLabel: "ストーリー",
      confirmLabel: "クイズバトル",
      exploreLabel: "穴埋めチャレンジ",
      keywordBank: "── ワードリスト ──",
      exploreButton: "回答する！",
      categoryIcons: ["⚡", "📚", "🔥"],
      avatarLabels: ["博", "ピ"],
      charNames: ["ゾルク先生", "ピノ"],
      correctBanner: "大正解！💥",
      wrongBanner: "ハズレ…💦",
      watermark: "CLEAR",
    },
  },
};

const ThemeContext = createContext(THEMES.cyber);

// ─── DUMMY EPISODE DATA (22-turn expanded) ───
const EPISODE_DATA = episodeDataJson;

const PHASES = { HOME: "home", LEARNING: "learning", CONFIRM: "confirm", EXPLORE: "explore", RESULT: "result" };

// ═══════════════════════════════════════════
//  SHARED COMPONENTS
// ═══════════════════════════════════════════

const Scanlines = () => {
  const t = useContext(ThemeContext);
  if (!t.scanlines) return null;
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${t.scanlineColor} 2px, ${t.scanlineColor} 4px)`, mixBlendMode: "multiply" }} />;
};

const GlitchText = ({ children, style = {}, as: Tag = "span" }) => {
  const t = useContext(ThemeContext);
  const [g, setG] = useState(false);
  useEffect(() => {
    if (!t.glitch) return;
    const iv = setInterval(() => { if (Math.random() > 0.92) { setG(true); setTimeout(() => setG(false), 120); } }, 2000);
    return () => clearInterval(iv);
  }, [t.glitch]);
  return <Tag style={{ ...style, position: "relative", display: "inline-block", ...(g ? { textShadow: `2px 0 ${t.vars.error}, -2px 0 ${t.vars.accent}`, transform: `translate(${Math.random()*2-1}px,${Math.random()*2-1}px)` } : {}), transition: g ? "none" : "all 0.1s" }}>{children}</Tag>;
};

// ── TBox: Theme-aware container ──
const TBox = ({ children, style = {}, accent = false, glow = false }) => {
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

const TypewriterText = ({ text, speed = 30, onComplete, style = {}, skip = false }) => {
  const [d, setD] = useState(""); const [done, setDone] = useState(false); const idx = useRef(0);
  useEffect(() => {
    idx.current = 0; setD(""); setDone(false);
    const tm = setInterval(() => { idx.current++; if (idx.current >= text.length) { setD(text); setDone(true); clearInterval(tm); onComplete?.(); } else setD(text.slice(0, idx.current)); }, speed);
    return () => clearInterval(tm);
  }, [text]);
  useEffect(() => { if (skip && !done) { setD(text); setDone(true); onComplete?.(); } }, [skip]);
  return <span style={style}>{d}{!done && <span style={{ opacity: 0.7, animation: "blink 0.6s steps(1) infinite" }}>▋</span>}</span>;
};

const TitleDivider = ({ style: extra = {} }) => {
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

const PhaseTransition = ({ label, sublabel, onDone }) => {
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

const ParticleBg = () => {
  const t = useContext(ThemeContext);
  if (!t.particles) return null;
  const ps = useRef(Array.from({length:15},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:1+Math.random()*2,dur:8+Math.random()*12,delay:Math.random()*5}))).current;
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>{ps.map(p=><div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:`${p.size}px`,height:`${p.size}px`,borderRadius:"50%",background:t.particleColor,opacity:0.15,animation:`float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`}}/>)}</div>;
};

const ThemeDecor = () => {
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

// ── Character Avatar component ──
const CharAvatar = ({ isTeacher, size = 36, style: extra = {} }) => {
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

// ═══════════════════════════════════════════
//  THEME SELECTOR
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════
const HomeScreen = ({ episode, onStart, currentTheme, onThemeChange }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", padding: "24px 20px", opacity: show?1:0, transform: show?"none":"translateY(20px)", transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)" }}>
      <div style={{ textAlign: "center", marginBottom: "24px", marginTop: "16px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.4em", color: "var(--accent)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>{t.appTitleEn}</div>
        <GlitchText as="h1" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,6vw,30px)", color: "var(--primary)", margin: 0, letterSpacing: ui.letterSpacingTitle, lineHeight: 1.4, fontWeight: ui.fontWeightDisplay }}>
          {t.appTitle}
        </GlitchText>
        <TitleDivider />
        <div style={{ fontSize: "11px", color: "var(--text-dim)", letterSpacing: "0.1em", fontFamily: ui.subtitleFont }}>{t.subtitle}</div>
      </div>

      <ThemeSelector currentTheme={currentTheme} onSelect={onThemeChange} />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "11px", fontFamily: "var(--font-display)" }}>
        <span style={{ color: "var(--text-dim)" }}>{episode.meta.date}</span>
        <span style={{ color: "var(--accent)" }}>{lb.streak}</span>
      </div>

      <TBox accent glow style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--accent)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>{lb.todayCase}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--primary)", marginBottom: "6px", lineHeight: 1.5, fontWeight: ui.fontWeightHeading }}>{episode.meta.title}</div>
        <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "12px", fontStyle: ui.italicSubtitle ? "italic" : "normal" }}>{episode.meta.subtitle}</div>
        <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-dim)", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Clock size={12} /> 約{episode.meta.estimatedMinutes}分</span><span style={{ display: "flex", alignItems: "center", gap: "3px" }}><FolderOpen size={12} /> {episode.meta.subject}</span><span>{"◆".repeat(episode.meta.difficulty)}{"◇".repeat(5-episode.meta.difficulty)}</span>
        </div>
      </TBox>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[{id:"daily_news",label:"時事"},{id:"subject",label:"単元"},{id:"trending",label:"流行"}].map((cat,i)=>(
          <div key={cat.id} style={{ flex:1,padding:"10px 8px",textAlign:"center",border:`1px solid ${i===0?"var(--accent)":"var(--border)"}`,background:i===0?"var(--accent-glow)":"var(--surface)",fontSize:"12px",color:i===0?"var(--accent)":"var(--text-dim)",cursor:"pointer",transition:"all 0.2s",borderRadius:ui.radius }} {...tapProps}>
            <div style={{fontSize:"18px",marginBottom:"4px"}}>{lb.categoryIcons[i]}</div>
            <div style={{fontFamily:"var(--font-display)",letterSpacing:"0.1em"}}>{cat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:"10px",letterSpacing:"0.2em",color:"var(--text-dim)",fontFamily:"var(--font-display)",marginBottom:"10px" }}>{lb.recentCases}</div>
      {[{title:"為替介入の裏側",date:"02.27"},{title:"半導体規制と株式市場",date:"02.26"},{title:"新NISA制度の影響分析",date:"02.25"}].map((ep,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px",borderBottom:"1px solid var(--border)",fontSize:"13px"}}>
          <div><div style={{color:"var(--text)",marginBottom:"2px"}}>{ep.title}</div><div style={{fontSize:"10px",color:"var(--text-dim)"}}>{ep.date}</div></div>
          <div style={{fontSize:"10px",color:"var(--accent)",fontFamily:"var(--font-display)",letterSpacing:"0.1em"}}>✓ 完了</div>
        </div>
      ))}

      <div style={{flex:1}}/>
      <button onClick={onStart} style={{
        width:"100%",padding:"16px",background:"transparent",
        border:`${ui.borderWidth} ${ui.borderStyle} var(--accent)`,color:"var(--accent)",
        fontFamily:"var(--font-display)",fontSize:"14px",letterSpacing:"0.3em",
        cursor:"pointer",transition:"all 0.3s",marginTop:"20px",borderRadius:ui.radius,
        display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
      }}
        {...tapProps}
        onMouseEnter={e=>{e.target.style.background="var(--accent)";e.target.style.color="var(--bg)";}}
        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="var(--accent)";}}
      ><Telescope size={18} />{lb.startButton}</button>
    </div>
  );
};

// ═══════════════════════════════════════════
//  LEARNING SCREEN
// ═══════════════════════════════════════════
const LearningScreen = ({ episode, onComplete }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const [msgIndex, setMsgIndex] = useState(1);
  const [typing, setTyping] = useState(true);
  const [messages, setMessages] = useState([]);
  const [supplement, setSupplement] = useState(null);
  const [dialogueStyle, setDialogueStyle] = useState('chat');
  const [skipTyping, setSkipTyping] = useState(false);
  const scrollRef = useRef(null);
  const init = useRef(false);
  const data = episode.learningPhase;

  useEffect(() => { if(!init.current&&data.length>0){init.current=true;setMessages([data[0]]);setSupplement(data[0].supplement||null);setTyping(true);} }, [data]);
  useEffect(() => { if(dialogueStyle==='chat'&&scrollRef.current) scrollRef.current.scrollTop=scrollRef.current.scrollHeight; }, [messages,typing,dialogueStyle]);

  const handleNext = useCallback(() => {
    if (typing) { setSkipTyping(true); return; }
    if (msgIndex >= data.length) { onComplete(); return; }
    setTyping(true); setSkipTyping(false);
    setMessages(p => [...p, data[msgIndex]]);
    setSupplement(data[msgIndex].supplement || null);
    setMsgIndex(p => p + 1);
  }, [typing, msgIndex, data, onComplete]);

  const handleTypingComplete = useCallback(() => { setTyping(false); setSkipTyping(false); }, []);
  const isT = m => m.speaker === "teacher";
  const names = lb.charNames;
  const currentMsg = messages.length > 0 ? messages[messages.length - 1] : null;

  const MonitorIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>);
  const ChatIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);

  // ── Chat mode header (shared) ──
  const chatHeader = (
    <>
      <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",background:ui.barBg,backdropFilter:"blur(8px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.2em",color:"var(--accent)",fontFamily:"var(--font-display)",display:"flex",alignItems:"center",gap:"6px"}}><ShieldAlert size={13} />{lb.investigationLabel}</div>
          <button onClick={(e)=>{e.stopPropagation();setDialogueStyle(p=>p==='novel'?'chat':'novel');}} {...tapProps} style={{
            background:"var(--surface)",border:"1px solid var(--border)",color:"var(--accent)",
            width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",transition:"all 0.2s",borderRadius:ui.radiusFull,padding:0,
          }} title={dialogueStyle==='novel'?'チャット表示に切替':'モニター表示に切替'}>
            {dialogueStyle === 'novel' ? <ChatIcon /> : <MonitorIcon />}
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"4px"}}>
          <span style={{fontSize:"13px",color:"var(--text)"}}>{episode.meta.title}</span>
          <span style={{fontSize:"11px",color:"var(--text-dim)",fontFamily:"var(--font-display)"}}>{msgIndex}/{data.length}</span>
        </div>
      </div>
      <div style={{height:"2px",background:"var(--border)"}}><div style={{height:"100%",background:"var(--accent)",width:`${(msgIndex/data.length)*100}%`,transition:"width 0.5s",...(ui.glowShadow?{boxShadow:"0 0 8px var(--accent-glow)"}:{})}}/></div>
    </>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
      {dialogueStyle === 'chat' && chatHeader}

      {dialogueStyle === 'chat' ? (
        <>
          <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"16px",paddingBottom:"8px"}}>
            {messages.map((msg,i)=>{
              const teacher = isT(msg);
              return (
                <div key={i} style={{display:"flex",flexDirection:teacher?"row":"row-reverse",marginBottom:"14px",gap:"10px",alignItems:"flex-start",animation:"fadeSlideUp 0.3s ease-out"}}>
                  <CharAvatar isTeacher={teacher} size={36} />
                  <div style={{maxWidth:"78%",padding:"10px 14px",background:teacher?"var(--surface)":`${t.vars.secondary}11`,border:`1px solid ${teacher?"var(--border)":`${t.vars.secondary}33`}`,fontSize:"13.5px",lineHeight:1.7,color:"var(--text)",borderRadius:ui.radiusLg}}>
                    {i===messages.length-1&&typing?<TypewriterText text={msg.text} speed={28} onComplete={handleTypingComplete} skip={skipTyping}/>:msg.text}
                  </div>
                </div>
              );
            })}
            {supplement&&!typing&&(
              <div style={{margin:"0 0 14px 46px",padding:"10px 12px",background:"var(--accent-glow)",border:"1px dashed var(--accent)",fontSize:"12px",color:"var(--accent)",lineHeight:1.6,animation:"fadeSlideUp 0.3s ease-out",borderRadius:ui.radius}}>
                <span style={{fontFamily:"var(--font-display)",fontSize:"10px",letterSpacing:"0.15em",display:"block",marginBottom:"4px",opacity:0.7}}>▸ SUPPLEMENT</span>
                {supplement.content}
              </div>
            )}
          </div>
          <div onClick={handleNext} style={{padding:"16px",textAlign:"center",borderTop:"1px solid var(--border)",cursor:"pointer",background:ui.barBg,userSelect:"none",WebkitTapHighlightColor:"transparent"}}>
            {typing?<span style={{fontSize:"12px",color:"var(--text-dim)"}}>……</span>
              :msgIndex>=data.length?<span style={{fontSize:"13px",color:"var(--accent)",fontFamily:"var(--font-display)",letterSpacing:"0.2em",display:"inline-flex",alignItems:"center",gap:"4px"}}>テストへ進む <ChevronRight size={16}/></span>
              :<span style={{fontSize:"12px",color:"var(--text-dim)",animation:"pulse 2s infinite"}}>TAP TO CONTINUE ▸</span>}
          </div>
        </>
      ) : (
        <div onClick={handleNext} style={{flex:1,display:"flex",flexDirection:"column",cursor:"pointer",userSelect:"none",WebkitTapHighlightColor:"transparent",overflow:"hidden"}}>
          {/* ── VN Portrait Area (fills all space above text box) ── */}
          <div style={{flex:1,position:"relative",overflow:"hidden",display:"flex",gap:"6px",padding:"0 4px",background:"var(--bg)"}}>
            {/* Overlaid header info */}
            <div style={{position:"absolute",top:0,left:0,right:0,zIndex:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)"}}>
              <div style={{fontSize:"10px",letterSpacing:"0.15em",color:"var(--text-dim)",fontFamily:"var(--font-display)",display:"flex",alignItems:"center",gap:"4px"}}>
                <Database size={11} /> DB_ACCESS // LOG_{String(msgIndex).padStart(3,'0')}
              </div>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <span style={{fontSize:"9px",color:"var(--text-dim)",fontFamily:"var(--font-display)",letterSpacing:"0.15em"}}>{lb.investigationLabel}</span>
                <button onClick={(e)=>{e.stopPropagation();setDialogueStyle(p=>p==='novel'?'chat':'novel');}} {...tapProps} style={{
                  background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",color:"var(--accent)",
                  width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",transition:"all 0.2s",borderRadius:ui.radiusFull,padding:0,backdropFilter:"blur(4px)",
                }} title="チャット表示に切替">
                  <ChatIcon />
                </button>
              </div>
            </div>
            {/* Progress bar overlay */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"var(--border)",zIndex:11}}>
              <div style={{height:"100%",background:"var(--accent)",width:`${(msgIndex/data.length)*100}%`,transition:"width 0.5s",...(ui.glowShadow?{boxShadow:"0 0 8px var(--accent-glow)"}:{})}}/>
            </div>
            {/* Student portrait (left) */}
            {(()=>{
              const active = currentMsg && !isT(currentMsg);
              return (
                <div style={{
                  flex:1,position:"relative",overflow:"hidden",borderRadius:"4px",
                  transition:"all 0.5s cubic-bezier(0.22,1,0.36,1)",
                  filter: active ? "brightness(1)" : "brightness(0.25)",
                  opacity: active ? 1 : 0.5,
                }}>
                  <img src={AVATAR_PINO} alt={names[1]} style={{
                    position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
                    objectPosition:"center 15%",
                    transition:"transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                    transform: active ? "scale(1.03)" : "scale(0.97)",
                  }} />
                  {/* Bottom gradient for label */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"25%",background:"linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)"}} />

                </div>
              );
            })()}
            {/* Teacher portrait (right) */}
            {(()=>{
              const active = currentMsg && isT(currentMsg);
              return (
                <div style={{
                  flex:1,position:"relative",overflow:"hidden",borderRadius:"4px",
                  transition:"all 0.5s cubic-bezier(0.22,1,0.36,1)",
                  filter: active ? "brightness(1)" : "brightness(0.25)",
                  opacity: active ? 1 : 0.5,
                }}>
                  <img src={AVATAR_ZORK} alt={names[0]} style={{
                    position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
                    objectPosition:"center 15%",
                    transition:"transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                    transform: active ? "scale(1.03)" : "scale(0.97)",
                  }} />
                  {/* Bottom gradient for label */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"25%",background:"linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)"}} />
                  {/* Active border glow */}
                  {active && <div style={{position:"absolute",inset:0,borderRadius:"4px",border:"2px solid var(--accent)",boxShadow:"inset 0 0 20px rgba(0,255,136,0.1), 0 0 15px rgba(0,255,136,0.15)",pointerEvents:"none"}} />}

                </div>
              );
            })()}
          </div>

          {/* ── VN Text Box ── */}
          <div style={{
            background:ui.barBg,backdropFilter:"blur(12px)",
            borderTop:`${ui.borderWidth} ${ui.borderStyle} var(--border)`,
            padding:"14px 18px 16px",minHeight:"150px",position:"relative",
          }}>
            {currentMsg && (
              <div style={{
                display:"inline-block",marginBottom:"6px",
                padding:"3px 14px",fontSize:"11px",fontFamily:"var(--font-display)",letterSpacing:"0.15em",
                background:isT(currentMsg)?"var(--surface)":"var(--surface)",
                border:`1px solid ${isT(currentMsg)?"var(--accent)":"var(--secondary)"}`,
                color:isT(currentMsg)?"var(--accent)":"var(--secondary)",
                borderRadius:ui.radius,
              }}>{isT(currentMsg)?names[0]:names[1]}</div>
            )}
            <div style={{fontSize:"14.5px",lineHeight:1.9,color:"var(--text)",minHeight:"60px"}}>
              {currentMsg && (typing ? <TypewriterText key={messages.length} text={currentMsg.text} speed={28} onComplete={handleTypingComplete} skip={skipTyping} /> : currentMsg.text)}
            </div>
            {supplement && !typing && (
              <div style={{marginTop:"12px",padding:"8px 10px",background:"var(--accent-glow)",border:"1px dashed var(--accent)",fontSize:"11px",color:"var(--accent)",lineHeight:1.6,animation:"fadeSlideUp 0.3s ease-out",borderRadius:ui.radius}}>
                <span style={{fontFamily:"var(--font-display)",fontSize:"9px",letterSpacing:"0.15em",opacity:0.7}}>▸ SUPPLEMENT </span>
                {supplement.content}
              </div>
            )}
            <div style={{position:"absolute",bottom:"6px",right:"14px"}}>
              {typing?<span style={{fontSize:"11px",color:"var(--text-dim)"}}>……</span>
                :msgIndex>=data.length?<span style={{fontSize:"11px",color:"var(--accent)",fontFamily:"var(--font-display)",letterSpacing:"0.15em",animation:"pulse 2s infinite",display:"inline-flex",alignItems:"center",gap:"2px"}}>テストへ <ChevronRight size={14}/></span>
                :<span style={{fontSize:"14px",color:"var(--accent)",animation:"pulse 2s infinite"}}>▸</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
//  CONFIRM TEST (旧 Identify)
// ═══════════════════════════════════════════
const ConfirmScreen = ({ episode, onComplete, onScore }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const qs = episode.testPhase.confirm;
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [ans, setAns] = useState(false);
  const [score, setScore] = useState(0);
  const q = qs[qi];
  const isCorrect = ans && sel === q.correctIndex;

  const pick = i=>{ if(ans)return; setSel(i); setAns(true); if(i===q.correctIndex) setScore(p=>p+1); };
  const next = ()=>{ if(qi+1>=qs.length){onScore(score);onComplete();}else{setQi(p=>p+1);setSel(null);setAns(false);} };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",background:ui.barBg}}>
        <div style={{fontSize:"10px",letterSpacing:"0.2em",color:"var(--accent)",fontFamily:"var(--font-display)",display:"flex",alignItems:"center",gap:"6px"}}><ShieldAlert size={13} />{lb.confirmLabel}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"4px"}}>
          <span style={{fontSize:"13px",color:"var(--text)"}}>選択式テスト</span>
          <span style={{fontSize:"12px",color:"var(--text-dim)",fontFamily:"var(--font-display)"}}>Q{qi+1}/{qs.length}</span>
        </div>
      </div>
      <div style={{height:"2px",background:"var(--border)"}}><div style={{height:"100%",background:"var(--accent)",width:`${((qi+(ans?1:0))/qs.length)*100}%`,transition:"width 0.5s",...(ui.glowShadow?{boxShadow:"0 0 8px var(--accent-glow)"}:{})}}/></div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>
        <TBox style={{marginBottom:"20px"}}><div style={{fontSize:"14px",lineHeight:1.8,color:"var(--text)"}}>{q.question}</div></TBox>
        {ans && (
          <div style={{
            padding:"14px 16px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"12px",
            background:isCorrect?"var(--accent-glow)":`${t.vars.error}14`,
            border:`1px solid ${isCorrect?"var(--accent)":"var(--error)"}`,
            borderRadius:ui.radius,animation:"fadeSlideUp 0.3s ease-out",
          }}>
            {isCorrect ? <CheckCircle2 size={22} color="var(--accent)" /> : <XCircle size={22} color="var(--error)" />}
            <span style={{fontSize:"17px",fontWeight:"bold",letterSpacing:"0.15em",color:isCorrect?"var(--accent)":"var(--error)",fontFamily:"var(--font-display)"}}>
              {isCorrect ? lb.correctBanner : lb.wrongBanner}
            </span>
          </div>
        )}
        {q.choices.map((c,i)=>{
          let bc="var(--border)",bg="var(--surface)",tc="var(--text)";
          if(ans){if(i===q.correctIndex){bc="var(--accent)";bg="var(--accent-glow)";tc="var(--accent)";}else if(i===sel){bc="var(--error)";bg=`${t.vars.error}14`;tc="var(--error)";}else tc="var(--text-dim)";}
          return (
            <div key={i} onClick={()=>pick(i)} {...(ans?{}:tapProps)} style={{padding:"14px 16px",marginBottom:"10px",cursor:ans?"default":"pointer",border:`1px solid ${bc}`,background:bg,color:tc,fontSize:"13.5px",lineHeight:1.6,transition:"all 0.3s",display:"flex",alignItems:"center",gap:"12px",borderRadius:ui.radius}}>
              <span style={{width:"24px",height:"24px",minWidth:"24px",border:`1px solid ${bc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontFamily:"var(--font-display)",borderRadius:ui.radiusFull}}>
                {ans&&i===q.correctIndex?"✓":ans&&i===sel?"✗":String.fromCharCode(65+i)}
              </span>{c}
            </div>
          );
        })}
        {ans&&(<div style={{marginTop:"16px",padding:"14px",background:"var(--accent-glow)",border:"1px solid var(--border)",animation:"fadeSlideUp 0.3s ease-out",borderRadius:ui.radius}}>
          <div style={{fontSize:"10px",letterSpacing:"0.15em",color:"var(--accent)",fontFamily:"var(--font-display)",marginBottom:"6px"}}>▸ ANALYSIS</div>
          <div style={{fontSize:"12.5px",lineHeight:1.7,color:"var(--text-dim)"}}>{q.explanation}</div>
        </div>)}
      </div>
      {ans&&(<div onClick={next} {...tapProps} style={{padding:"16px",textAlign:"center",borderTop:"1px solid var(--border)",cursor:"pointer",background:ui.barBg}}>
        <span style={{fontSize:"13px",color:"var(--accent)",fontFamily:"var(--font-display)",letterSpacing:"0.2em",display:"inline-flex",alignItems:"center",gap:"4px"}}>{qi+1>=qs.length?"探究フェーズへ":"次の問題へ"}<ChevronRight size={16} /></span>
      </div>)}
    </div>
  );
};

// ═══════════════════════════════════════════
//  EXPLORE TEST（穴埋め探究テスト）
// ═══════════════════════════════════════════
const ExploreScreen = ({ episode, onComplete, onScore }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const qs = episode.testPhase.explore;
  const [qi, setQi] = useState(0);
  const [fills, setFills] = useState({});
  const [activeBlank, setActiveBlank] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const q = qs[qi];
  const blankKeys = Object.keys(q.answers);
  const allFilled = blankKeys.every(k => fills[k]);
  const eAccent = "var(--secondary)";
  const usedWords = new Set(Object.values(fills).filter(Boolean));

  const handleWordTap = (word) => {
    if (submitted || usedWords.has(word)) return;
    let target = activeBlank;
    if (!target || fills[target]) target = blankKeys.find(k => !fills[k]);
    if (!target) return;
    setFills(prev => ({ ...prev, [target]: word }));
    const nextEmpty = blankKeys.find(k => k !== target && !fills[k]);
    setActiveBlank(nextEmpty || null);
  };

  const handleBlankTap = (blankId) => {
    if (submitted) return;
    if (fills[blankId]) { setFills(prev => ({ ...prev, [blankId]: null })); setActiveBlank(blankId); }
    else setActiveBlank(blankId);
  };

  const handleSubmit = () => { if (!allFilled) return; setSubmitted(true); if (blankKeys.every(k => fills[k] === q.answers[k])) setScore(prev => prev + 1); };
  const handleNext = () => { if (qi + 1 >= qs.length) { onScore(score); onComplete(); } else { setQi(p => p + 1); setFills({}); setActiveBlank(null); setSubmitted(false); } };
  const correctCount = submitted ? blankKeys.filter(k => fills[k] === q.answers[k]).length : 0;

  const renderSentence = () => {
    return q.sentence.split(/({{blank\d+}})/g).map((part, i) => {
      const m = part.match(/{{(blank\d+)}}/);
      if (!m) return <span key={i}>{part}</span>;
      const bId = m[1]; const word = fills[bId];
      const isActive = activeBlank === bId && !submitted;
      const isCorrect = submitted && word === q.answers[bId];
      const isWrong = submitted && word && word !== q.answers[bId];
      return (
        <span key={i} onClick={() => handleBlankTap(bId)} style={{
          display: "inline-block", minWidth: "72px", padding: "4px 10px", margin: "2px 3px",
          borderBottom: `2px solid ${isCorrect ? "var(--accent)" : isWrong ? t.vars.error : isActive ? "var(--secondary)" : word ? "var(--primary)" : "var(--text-dim)"}`,
          background: isCorrect ? "var(--accent-glow)" : isWrong ? `${t.vars.error}18` : isActive ? `${t.vars.secondary}18` : "transparent",
          color: isCorrect ? "var(--accent)" : isWrong ? "var(--error)" : word ? "var(--primary)" : "var(--text-dim)",
          fontWeight: "bold", textAlign: "center", cursor: submitted ? "default" : "pointer",
          transition: "all 0.25s", borderRadius: ui.radius,
          animation: isActive && !word ? "pulse 1.5s infinite" : "none",
        }}>
          {word || "＿＿＿"}
          {isWrong && <span style={{ fontSize: "10px", display: "block", color: "var(--accent)", marginTop: "2px", fontWeight: "normal" }}>→ {q.answers[bId]}</span>}
        </span>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: ui.barBg }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: eAccent, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "6px" }}><FlaskConical size={13} />{lb.exploreLabel}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontSize: "13px", color: "var(--text)" }}>キーワード穴埋め</span>
          <span style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "var(--font-display)" }}>Q{qi + 1}/{qs.length}</span>
        </div>
      </div>
      <div style={{ height: "2px", background: "var(--border)" }}>
        <div style={{ height: "100%", background: "var(--secondary)", width: `${((qi + (submitted ? 1 : 0)) / qs.length) * 100}%`, transition: "width 0.5s", ...(ui.glowShadow ? { boxShadow: `0 0 8px ${t.vars.secondary}66` } : {}) }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "14px", lineHeight: 1.6, textAlign: "center" }}>下のキーワードから正しい語句を選んで空欄を埋めよ</div>
        <TBox accent style={{ marginBottom: "24px" }}><div style={{ fontSize: "15px", lineHeight: 2.4, color: "var(--text)" }}>{renderSentence()}</div></TBox>

        {!submitted && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", justifyContent: "center" }}>
            {blankKeys.map((bId, idx) => (
              <div key={bId} onClick={() => !fills[bId] && handleBlankTap(bId)} style={{
                padding: "4px 12px", fontSize: "11px", fontFamily: "var(--font-display)",
                border: `1px solid ${activeBlank === bId ? "var(--secondary)" : fills[bId] ? "var(--accent)" : "var(--border)"}`,
                color: activeBlank === bId ? "var(--secondary)" : fills[bId] ? "var(--accent)" : "var(--text-dim)",
                background: activeBlank === bId ? `${t.vars.secondary}14` : "transparent",
                cursor: "pointer", transition: "all 0.2s", borderRadius: ui.radiusLg,
              }}>{fills[bId] ? `✓ 空欄${idx + 1}` : `空欄${idx + 1}`}</div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: eAccent, fontFamily: "var(--font-display)", marginBottom: "10px", textAlign: "center" }}>{lb.keywordBank}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {q.wordBank.map(word => {
              const isUsed = usedWords.has(word);
              const isCA = submitted && Object.values(q.answers).includes(word);
              const isPC = submitted && blankKeys.some(k => fills[k] === word && q.answers[k] === word);
              const isPW = submitted && blankKeys.some(k => fills[k] === word && q.answers[k] !== word);
              return (
                <div key={word} onClick={() => handleWordTap(word)} {...(submitted||isUsed?{}:tapProps)} style={{
                  padding: "9px 14px", fontSize: "13px", fontFamily: "var(--font-display)",
                  cursor: submitted || isUsed ? "default" : "pointer",
                  border: `1px solid ${isPC ? "var(--accent)" : isPW ? t.vars.error : isCA ? "var(--accent)" : "var(--border)"}`,
                  background: isPC ? "var(--accent-glow)" : isPW ? `${t.vars.error}14` : isUsed ? `${t.vars.border}22` : "var(--surface)",
                  color: isPC ? "var(--accent)" : isPW ? "var(--error)" : isCA ? "var(--accent)" : isUsed ? "var(--text-dim)" : "var(--text)",
                  opacity: isUsed && !submitted ? 0.35 : 1, transition: "all 0.25s",
                  borderRadius: ui.radius, textDecoration: isUsed && !submitted ? "line-through" : "none",
                }}>{word}</div>
              );
            })}
          </div>
        </div>

        {submitted && (
          <div style={{ padding: "14px", background: "var(--accent-glow)", border: "1px solid var(--border)", animation: "fadeSlideUp 0.3s ease-out", borderRadius: ui.radius }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: "var(--accent)", fontFamily: "var(--font-display)" }}>▸ EXPLORATION REPORT</span>
              <span style={{ fontSize: "12px", fontFamily: "var(--font-display)", color: correctCount === blankKeys.length ? "var(--accent)" : "var(--error)" }}>{correctCount}/{blankKeys.length} 正解</span>
            </div>
            <div style={{ fontSize: "12.5px", lineHeight: 1.7, color: "var(--text-dim)" }}>{q.explanation}</div>
          </div>
        )}
      </div>

      <div style={{ padding: "16px", borderTop: "1px solid var(--border)", background: ui.barBg, textAlign: "center" }}>
        {!submitted ? (
          <div onClick={handleSubmit} {...(allFilled?tapProps:{})} style={{
            padding: "12px", cursor: allFilled ? "pointer" : "default",
            border: `1px solid ${allFilled ? "var(--secondary)" : "var(--border)"}`,
            color: allFilled ? eAccent : "var(--text-dim)",
            fontFamily: "var(--font-display)", fontSize: "13px", letterSpacing: "0.2em",
            opacity: allFilled ? 1 : 0.4, transition: "all 0.3s", borderRadius: ui.radius,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}><FlaskConical size={15} />{lb.exploreButton}</div>
        ) : (
          <div onClick={handleNext} {...tapProps} style={{ cursor: "pointer" }}>
            <span style={{ fontSize: "13px", color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: "0.2em", display: "inline-flex", alignItems: "center", gap: "4px" }}>{qi + 1 >= qs.length ? "結果を見る" : "次の問題へ"}<ChevronRight size={16} /></span>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
//  RESULT SCREEN
// ═══════════════════════════════════════════
const ResultScreen = ({ episode, confirmScore, exploreScore, onHome }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const [show,setShow]=useState(0);
  const totalQ=episode.testPhase.confirm.length+episode.testPhase.explore.length;
  const totalScore=confirmScore+exploreScore;
  useEffect(()=>{setTimeout(()=>setShow(1),300);setTimeout(()=>setShow(2),1000);setTimeout(()=>setShow(3),1800);},[]);
  const rank=totalScore===totalQ?"S":totalScore>=totalQ*0.8?"A":totalScore>=totalQ*0.5?"B":"C";
  const rc={S:"#ffd700",A:"var(--accent)",B:"var(--secondary)",C:"var(--text-dim)"}[rank];

  return (
    <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px",position:"relative",overflow:"hidden"}}>
      <div style={{
        position:"absolute",top:"50%",left:"50%",
        transform:"translate(-50%,-50%) rotate(-12deg)",
        fontSize: lb.watermark.length <= 2 ? "min(200px,45vw)" : "min(120px,28vw)",
        fontWeight:900,fontFamily:"var(--font-display)",
        color:"var(--accent)",opacity:0.04,
        border:`8px solid`,borderColor:"var(--accent)",
        padding:"10px 30px",letterSpacing:"0.1em",
        pointerEvents:"none",whiteSpace:"nowrap",
        borderRadius:ui.radius,
        transition:"opacity 1s",
        ...(show>=1?{opacity:0.04}:{opacity:0}),
      }}>{lb.watermark}</div>

      <div style={{opacity:show>=1?1:0,transform:show>=1?"none":"scale(0.9)",transition:"all 0.8s",textAlign:"center",marginBottom:"32px",position:"relative"}}>
        {ui.stampFrame && (
          <div style={{
            position:"absolute",inset:"-10px -16px",
            border:"3px solid var(--accent)",
            transform:"rotate(-2deg)",
            borderRadius:ui.radius,
            opacity:show>=1?0.25:0,transition:"opacity 0.8s 0.3s",
            pointerEvents:"none",
          }}/>
        )}
        <div style={{fontSize:"10px",letterSpacing:"0.4em",color:"var(--accent)",fontFamily:"var(--font-display)",marginBottom:"16px"}}>{lb.caseClosedLabel}</div>
        <GlitchText as="div" style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,8vw,42px)",color:"var(--primary)",letterSpacing:"0.1em",lineHeight:1.3,fontWeight:ui.fontWeightDisplay}}>
          {lb.caseClosedTitle}
        </GlitchText>
        <TitleDivider style={{ marginTop: "16px" }} />
        <div style={{fontSize:"13px",color:"var(--text-dim)",lineHeight:1.6}}>{episode.meta.title}</div>
      </div>

      <div style={{opacity:show>=2?1:0,transform:show>=2?"none":"translateY(20px)",transition:"all 0.8s",textAlign:"center",marginBottom:"32px"}}>
        <div style={{width:"80px",height:"80px",border:`3px solid ${rc}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 0 30px ${rc}44`,borderRadius:ui.radiusFull}}>
          <span style={{fontFamily:"var(--font-display)",fontSize:"40px",color:rc}}>{rank}</span>
        </div>
        <div style={{fontSize:"13px",color:"var(--text-dim)",fontFamily:"var(--font-display)"}}>{totalScore}/{totalQ} 正解</div>
      </div>

      <TBox style={{width:"100%",maxWidth:"320px",marginBottom:"32px",opacity:show>=3?1:0,transform:show>=3?"none":"translateY(20px)",transition:"all 0.8s"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px",fontSize:"13px"}}>
          <span style={{color:"var(--text-dim)",display:"flex",alignItems:"center",gap:"6px"}}><ShieldAlert size={13}/>確認（選択式）</span>
          <span style={{color:"var(--accent)",fontFamily:"var(--font-display)"}}>{confirmScore}/{episode.testPhase.confirm.length}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px"}}>
          <span style={{color:"var(--text-dim)",display:"flex",alignItems:"center",gap:"6px"}}><FlaskConical size={13}/>探究（穴埋め）</span>
          <span style={{color:"var(--secondary)",fontFamily:"var(--font-display)"}}>{exploreScore}/{episode.testPhase.explore.length}</span>
        </div>
      </TBox>

      <button onClick={onHome} {...tapProps} style={{
        padding:"14px 40px",background:"transparent",
        border:`${ui.borderWidth} ${ui.borderStyle} var(--accent)`,color:"var(--accent)",
        fontFamily:"var(--font-display)",fontSize:"13px",letterSpacing:"0.25em",
        cursor:"pointer",transition:"all 0.3s",opacity:show>=3?1:0,borderRadius:ui.radius,
        display:"inline-flex",alignItems:"center",gap:"6px",
      }}
        onMouseEnter={e=>{e.target.style.background="var(--accent)";e.target.style.color="var(--bg)";}}
        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="var(--accent)";}}
      >ホームに戻る <ChevronRight size={16} /></button>
    </div>
  );
};

// ═══════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [theme, setTheme] = useState(THEMES.cyber);
  const [phase, setPhase] = useState(PHASES.HOME);
  const [transition, setTransition] = useState(null);
  const [cfScore, setCfScore] = useState(0);
  const [exScore, setExScore] = useState(0);

  const goPhase = (next,label,sublabel) => setTransition({label,sublabel,next});
  const doneTrans = () => { setPhase(transition.next); setTransition(null); };
  const cssVars = Object.entries(theme.vars).map(([k,v])=>`--${k.replace(/([A-Z])/g,"-$1").toLowerCase()}:${v};`).join("");

  return (
    <ThemeContext.Provider value={theme}>
      <style>{`
        ${theme.fonts}
        :root{${cssVars}--font-display:${theme.fontDisplay};--font-body:${theme.fontBody};}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes float{0%{transform:translateY(0) translateX(0)}100%{transform:translateY(-30px) translateX(15px)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border)}
      `}</style>
      <div style={{maxWidth:"430px",margin:"0 auto",minHeight:"100dvh",background:"var(--bg)",position:"relative",overflow:"hidden",borderLeft:"1px solid var(--border)",borderRight:"1px solid var(--border)",...theme.bgStyle}}>
        <ParticleBg/><Scanlines/><ThemeDecor/>
        <div style={{position:"relative",zIndex:1,minHeight:"100dvh"}}>
          {phase===PHASES.HOME&&<HomeScreen episode={EPISODE_DATA} onStart={()=>goPhase(PHASES.LEARNING,"調査開始","OBSERVATION START")} currentTheme={theme} onThemeChange={setTheme}/>}
          {phase===PHASES.LEARNING&&<LearningScreen episode={EPISODE_DATA} onComplete={()=>goPhase(PHASES.CONFIRM,"確認","CONFIRM PHASE")}/>}
          {phase===PHASES.CONFIRM&&<ConfirmScreen episode={EPISODE_DATA} onScore={setCfScore} onComplete={()=>goPhase(PHASES.EXPLORE,"探究","EXPLORE PHASE")}/>}
          {phase===PHASES.EXPLORE&&<ExploreScreen episode={EPISODE_DATA} onScore={setExScore} onComplete={()=>goPhase(PHASES.RESULT,"調査完了","REPORT FILED")}/>}
          {phase===PHASES.RESULT&&<ResultScreen episode={EPISODE_DATA} confirmScore={cfScore} exploreScore={exScore} onHome={()=>{setCfScore(0);setExScore(0);setPhase(PHASES.HOME);}}/>}
        </div>
        {transition&&<PhaseTransition label={transition.label} sublabel={transition.sublabel} onDone={doneTrans}/>}
      </div>
    </ThemeContext.Provider>
  );
}
