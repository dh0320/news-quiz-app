import { useState, useRef, useCallback, useMemo } from "react";
import { ThemeContext, THEMES } from "./context/ThemeContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useEpisode } from "./hooks/useEpisode.js";
import { Scanlines, ParticleBg, ThemeDecor, PhaseTransition } from "./components/shared/index.jsx";
import HomeScreen from "./components/HomeScreen.jsx";
import LearningScreen from "./components/LearningScreen.jsx";
import ConfirmScreen from "./components/ConfirmScreen.jsx";
import ExploreScreen from "./components/ExploreScreen.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import StatsScreen from "./components/StatsScreen.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";

const PHASES = { HOME: "home", LEARNING: "learning", CONFIRM: "confirm", EXPLORE: "explore", RESULT: "result" };
const isAdminPage = window.location.pathname === "/admin";

// /admin パスなら管理ダッシュボードを表示（Hooksルール違反を避けるため分離）
export default function App() {
  if (isAdminPage) return <AdminDashboard />;
  return <MainApp />;
}

function MainApp() {
  const [theme, setTheme] = useState(THEMES.cyber);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [phase, setPhase] = useState(PHASES.HOME);
  const [transition, setTransition] = useState(null);
  const [cfScore, setCfScore] = useState(0);
  const [exScore, setExScore] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const sessionIdRef = useRef(null);
  const { user, supabase } = useAuth();
  const { episode, loading: episodeLoading } = useEpisode();

  // プレイセッション: INSERT（Learning開始時）
  const createSession = useCallback(async () => {
    if (!supabase || !user || !episode) return;
    try {
      const { data, error } = await supabase
        .from("play_sessions")
        .insert({ episode_id: episode.episodeId, user_id: user.id })
        .select("id")
        .single();
      if (!error) sessionIdRef.current = data.id;
    } catch { /* UX最優先: エラー時はローカルのみで続行 */ }
  }, [supabase, user, episode]);

  // プレイセッション: UPDATE（スコア記録）
  const updateSession = useCallback(async (fields) => {
    if (!supabase || !sessionIdRef.current) return;
    try {
      await supabase
        .from("play_sessions")
        .update(fields)
        .eq("id", sessionIdRef.current);
    } catch { /* UX最優先 */ }
  }, [supabase]);

  const goPhase = (next, label, sublabel) => setTransition({ label, sublabel, next });
  const doneTrans = () => { setPhase(transition.next); setTransition(null); };
  const cssVars = Object.entries(theme.vars).map(([k, v]) => `--${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v};`).join("");

  // フェーズ遷移ハンドラ
  const handleStart = () => {
    createSession();
    goPhase(PHASES.LEARNING, "調査開始", "OBSERVATION START");
  };
  const handleConfirmDone = (score) => {
    setCfScore(score);
    updateSession({ confirm_score: score, confirm_total: episode.testPhase.confirm.length });
    goPhase(PHASES.EXPLORE, "探究", "EXPLORE PHASE");
  };
  const handleExploreDone = (score) => {
    setExScore(score);
    updateSession({
      explore_score: score,
      explore_total: episode.testPhase.explore.length,
      completed: true,
      completed_at: new Date().toISOString(),
    });
    goPhase(PHASES.RESULT, "調査完了", "REPORT FILED");
  };
  const handleHome = () => {
    setCfScore(0); setExScore(0);
    sessionIdRef.current = null;
    setShowStats(false);
    setPhase(PHASES.HOME);
  };

  // 現在のランク（結果画面で使用）
  const totalQ = episode ? episode.testPhase.confirm.length + episode.testPhase.explore.length : 0;
  const totalScore = cfScore + exScore;
  const myRank = useMemo(() => {
    if (phase !== PHASES.RESULT || !episode) return null;
    return totalScore === totalQ ? "S" : totalScore >= totalQ * 0.8 ? "A" : totalScore >= totalQ * 0.5 ? "B" : "C";
  }, [phase, totalScore, totalQ, episode]);

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
      <div style={{ maxWidth: "430px", margin: "0 auto", minHeight: "100dvh", background: "var(--bg)", position: "relative", overflow: "hidden", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", ...theme.bgStyle }}>
        <ParticleBg /><Scanlines /><ThemeDecor />
        <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh" }}>
          {episodeLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: "16px", color: "var(--text-dim)" }}>
              <div style={{ width: "32px", height: "32px", border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "14px" }}>データ受信中...</span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : !episode ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: "12px", padding: "32px", textAlign: "center" }}>
              <span style={{ fontSize: "32px" }}>📡</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "var(--accent)" }}>通信エラー</span>
              <span style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6 }}>エピソードデータを取得できませんでした。<br />ページを再読み込みしてください。</span>
              <button onClick={() => window.location.reload()} style={{ marginTop: "8px", padding: "10px 24px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "6px", fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-display)" }}>再読み込み</button>
            </div>
          ) : (
            <>
              {phase === PHASES.HOME && (
                <HomeScreen
                  episode={episode}
                  onStart={handleStart}
                  currentTheme={theme}
                  onThemeChange={setTheme}
                  selectedGenre={selectedGenre}
                  onGenreChange={setSelectedGenre}
                />
              )}
              {phase === PHASES.LEARNING && <LearningScreen episode={episode} onComplete={() => goPhase(PHASES.CONFIRM, "確認", "CONFIRM PHASE")} />}
              {phase === PHASES.CONFIRM && <ConfirmScreen episode={episode} onScore={handleConfirmDone} onComplete={() => {}} />}
              {phase === PHASES.EXPLORE && <ExploreScreen episode={episode} onScore={handleExploreDone} onComplete={() => {}} />}
              {phase === PHASES.RESULT && <ResultScreen episode={episode} confirmScore={cfScore} exploreScore={exScore} onHome={handleHome} onShowStats={() => setShowStats(true)} />}
            </>
          )}
        </div>
        {transition && <PhaseTransition label={transition.label} sublabel={transition.sublabel} onDone={doneTrans} />}
        {showStats && episode && <StatsScreen episode={episode} myRank={myRank} onClose={() => setShowStats(false)} />}
      </div>
    </ThemeContext.Provider>
  );
}
