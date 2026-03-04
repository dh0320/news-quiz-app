import { useState, useEffect, useContext } from "react";
import { Clock, FolderOpen, Telescope } from "lucide-react";
import { ThemeContext, tapProps } from "../context/ThemeContext.jsx";
import { GlitchText, TBox, TitleDivider } from "./shared/index.jsx";
import ThemeSelector from "./ThemeSelector.jsx";

const GENRES = [
  { id: "all", label: "すべて" },
  { id: "politics_policy", label: "政治・政策" },
  { id: "economy_finance", label: "経済・金融" },
  { id: "entertainment_culture", label: "エンタメ・カルチャー（映画/音楽/配信）" },
  { id: "tech_ai", label: "テック・AI" },
  { id: "career_workstyle", label: "キャリア・働き方" },
];

const HomeScreen = ({ episode, onStart, currentTheme, onThemeChange, selectedGenre, onGenreChange }) => {
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

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {GENRES.map((genre) => {
          const isSelected = selectedGenre === genre.id;
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => onGenreChange(genre.id)}
              style={{
                padding: "10px 12px",
                textAlign: "center",
                border: `${ui.borderWidth} ${ui.borderStyle} ${isSelected ? "var(--accent)" : "var(--border)"}`,
                background: isSelected ? "var(--accent-glow)" : "var(--surface)",
                fontSize: "12px",
                color: isSelected ? "var(--accent)" : "var(--text-dim)",
                cursor: "pointer",
                transition: "all 0.2s",
                borderRadius: ui.radius,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.06em",
                boxShadow: isSelected ? "0 0 0 1px var(--accent), 0 0 12px var(--accent-glow)" : "none",
              }}
              {...tapProps}
            >
              {genre.label}
            </button>
          );
        })}
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

export default HomeScreen;
