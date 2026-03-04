import { useState, useEffect, useContext } from "react";
import { Clock, FolderOpen, Telescope } from "lucide-react";
import { ThemeContext, tapProps } from "../context/ThemeContext.jsx";
import { GENRES, getGenreById } from "../constants/genres.js";
import { GlitchText, TBox, TitleDivider } from "./shared/index.jsx";
import ThemeSelector from "./ThemeSelector.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const HomeScreen = ({ episode, onStart, currentTheme, onThemeChange, selectedGenre, onGenreChange }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const { user, supabase } = useAuth();
  const [show, setShow] = useState(false);
  const [recentCases, setRecentCases] = useState([]);

  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  useEffect(() => {
    if (!supabase || !user) {
      setRecentCases([]);
      return;
    }

    const fetchRecentCases = async () => {
      try {
        const { data: sessions } = await supabase
          .from("play_sessions")
          .select("episode_id, completed, completed_at, created_at")
          .order("created_at", { ascending: false })
          .limit(20);

        if (!sessions || sessions.length === 0) {
          setRecentCases([]);
          return;
        }

        const latestByEpisode = new Map();
        sessions.forEach((s) => {
          if (!s.episode_id || latestByEpisode.has(s.episode_id)) return;
          latestByEpisode.set(s.episode_id, s);
        });

        const episodeIds = Array.from(latestByEpisode.keys());
        const { data: episodes } = await supabase
          .from("episodes")
          .select("episode_id, data_json")
          .in("episode_id", episodeIds);

        const titleByEpisodeId = new Map();
        episodes?.forEach((ep) => {
          titleByEpisodeId.set(ep.episode_id, ep?.data_json?.meta?.title ?? ep.episode_id);
        });

        const toDateLabel = (session) => {
          const source = session.completed_at ?? session.created_at;
          if (!source) return "--.--";
          const d = new Date(source);
          if (Number.isNaN(d.getTime())) return "--.--";
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${mm}.${dd}`;
        };

        const cases = Array.from(latestByEpisode.values())
          .sort((a, b) => new Date(b.completed_at ?? b.created_at) - new Date(a.completed_at ?? a.created_at))
          .slice(0, 3)
          .map((s) => ({
            title: titleByEpisodeId.get(s.episode_id) ?? s.episode_id,
            date: toDateLabel(s),
            completed: !!s.completed,
          }));

        setRecentCases(cases);
      } catch {
        setRecentCases([]);
      }
    };

    fetchRecentCases();
  }, [supabase, user]);

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
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Clock size={12} /> 約{episode.meta.estimatedMinutes}分</span><span style={{ display: "flex", alignItems: "center", gap: "3px" }}><FolderOpen size={12} /> {getGenreById(episode.meta.genre)?.shortLabel ?? episode.meta.subject}</span><span>{"◆".repeat(episode.meta.difficulty)}{"◇".repeat(5-episode.meta.difficulty)}</span>
        </div>
      </TBox>

      <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--text-dim)", fontFamily: "var(--font-display)", marginBottom: "10px" }}>{lb.genreFilter}</div>
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
      {(recentCases.length > 0 ? recentCases : [{ title: "履歴がまだありません", date: "--.--", completed: false }]).map((ep,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px",borderBottom:"1px solid var(--border)",fontSize:"13px"}}>
          <div><div style={{color:"var(--text)",marginBottom:"2px"}}>{ep.title}</div><div style={{fontSize:"10px",color:"var(--text-dim)"}}>{ep.date}</div></div>
          <div style={{fontSize:"10px",color:ep.completed?"var(--accent)":"var(--text-dim)",fontFamily:"var(--font-display)",letterSpacing:"0.1em"}}>{ep.completed ? "✓ 完了" : "未完了"}</div>
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
