import { useState, useContext } from "react";
import { FlaskConical, ChevronRight } from "lucide-react";
import { ThemeContext, tapProps } from "../context/ThemeContext.jsx";
import { TBox } from "./shared/index.jsx";

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

export default ExploreScreen;
