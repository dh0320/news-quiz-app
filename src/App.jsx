import { useState } from "react";
import { ThemeContext, THEMES } from "./context/ThemeContext.jsx";
import { Scanlines, ParticleBg, ThemeDecor, PhaseTransition } from "./components/shared/index.jsx";
import HomeScreen from "./components/HomeScreen.jsx";
import LearningScreen from "./components/LearningScreen.jsx";
import ConfirmScreen from "./components/ConfirmScreen.jsx";
import ExploreScreen from "./components/ExploreScreen.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import episodeDataJson from "./data/episodes/2026-02-28-news-01.json";

const EPISODE_DATA = episodeDataJson;
const PHASES = { HOME: "home", LEARNING: "learning", CONFIRM: "confirm", EXPLORE: "explore", RESULT: "result" };

export default function App() {
  const [theme, setTheme] = useState(THEMES.cyber);
  const [phase, setPhase] = useState(PHASES.HOME);
  const [transition, setTransition] = useState(null);
  const [cfScore, setCfScore] = useState(0);
  const [exScore, setExScore] = useState(0);

  const goPhase = (next, label, sublabel) => setTransition({ label, sublabel, next });
  const doneTrans = () => { setPhase(transition.next); setTransition(null); };
  const cssVars = Object.entries(theme.vars).map(([k, v]) => `--${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v};`).join("");

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
          {phase === PHASES.HOME && <HomeScreen episode={EPISODE_DATA} onStart={() => goPhase(PHASES.LEARNING, "調査開始", "OBSERVATION START")} currentTheme={theme} onThemeChange={setTheme} />}
          {phase === PHASES.LEARNING && <LearningScreen episode={EPISODE_DATA} onComplete={() => goPhase(PHASES.CONFIRM, "確認", "CONFIRM PHASE")} />}
          {phase === PHASES.CONFIRM && <ConfirmScreen episode={EPISODE_DATA} onScore={setCfScore} onComplete={() => goPhase(PHASES.EXPLORE, "探究", "EXPLORE PHASE")} />}
          {phase === PHASES.EXPLORE && <ExploreScreen episode={EPISODE_DATA} onScore={setExScore} onComplete={() => goPhase(PHASES.RESULT, "調査完了", "REPORT FILED")} />}
          {phase === PHASES.RESULT && <ResultScreen episode={EPISODE_DATA} confirmScore={cfScore} exploreScore={exScore} onHome={() => { setCfScore(0); setExScore(0); setPhase(PHASES.HOME); }} />}
        </div>
        {transition && <PhaseTransition label={transition.label} sublabel={transition.sublabel} onDone={doneTrans} />}
      </div>
    </ThemeContext.Provider>
  );
}
