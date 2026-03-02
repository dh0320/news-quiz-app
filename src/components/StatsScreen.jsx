import { useState, useEffect, useContext } from "react";
import { X, Users, Heart, Trophy } from "lucide-react";
import { ThemeContext, tapProps } from "../context/ThemeContext.jsx";
import { TBox, TitleDivider } from "./shared/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// ランク判定（App.jsx / ResultScreen と同じロジック）
const getRank = (score, total) =>
  score === total ? "S" : score >= total * 0.8 ? "A" : score >= total * 0.5 ? "B" : "C";

const RANK_COLORS = { S: "#ffd700", A: "var(--accent)", B: "var(--secondary)", C: "var(--text-dim)" };
const RANK_ORDER = ["S", "A", "B", "C"];

// 横棒グラフ1本
const Bar = ({ label, count, max, color, highlight }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
    <span style={{
      width: "24px", textAlign: "center", fontFamily: "var(--font-display)", fontSize: "16px",
      color, fontWeight: highlight ? "bold" : "normal",
      textShadow: highlight ? `0 0 8px ${color}` : "none",
    }}>{label}</span>
    <div style={{ flex: 1, height: "20px", background: "var(--bg)", borderRadius: "3px", overflow: "hidden", position: "relative" }}>
      <div style={{
        width: max > 0 ? `${(count / max) * 100}%` : "0%",
        height: "100%", background: color, borderRadius: "3px",
        transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
        opacity: highlight ? 1 : 0.6,
        minWidth: count > 0 ? "4px" : "0",
      }} />
    </div>
    <span style={{ width: "32px", textAlign: "right", fontSize: "12px", color: "var(--text-dim)", fontFamily: "var(--font-display)" }}>
      {count}
    </span>
  </div>
);

const StatsScreen = ({ episode, myRank, onClose }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const { supabase } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !episode.episodeId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // 完走者データ取得
        const { data: sessions } = await supabase
          .from("play_sessions")
          .select("confirm_score, confirm_total, explore_score, explore_total")
          .eq("episode_id", episode.episodeId)
          .eq("completed", true);

        // いいね数
        const { count: likeCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("episode_id", episode.episodeId);

        if (sessions && sessions.length > 0) {
          // ランク分布を集計
          const rankDist = { S: 0, A: 0, B: 0, C: 0 };
          let totalScoreSum = 0;

          sessions.forEach((s) => {
            const total = (s.confirm_total || 0) + (s.explore_total || 0);
            const score = (s.confirm_score || 0) + (s.explore_score || 0);
            const r = getRank(score, total);
            rankDist[r]++;
            totalScoreSum += total > 0 ? score / total : 0;
          });

          setStats({
            completedCount: sessions.length,
            likeCount: likeCount ?? 0,
            avgScore: Math.round((totalScoreSum / sessions.length) * 100),
            rankDist,
          });
        } else {
          setStats({ completedCount: 0, likeCount: likeCount ?? 0, avgScore: 0, rankDist: { S: 0, A: 0, B: 0, C: 0 } });
        }
      } catch {
        /* エラー時はデータなし表示 */
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase, episode.episodeId]);

  const maxRankCount = stats ? Math.max(...Object.values(stats.rankDist), 1) : 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      padding: "20px",
    }} onClick={onClose}>
      <div style={{
        width: "100%", maxWidth: "380px",
        background: "var(--surface)", border: `${ui.borderWidth} ${ui.borderStyle} var(--border)`,
        borderRadius: ui.radiusLg, padding: "24px", position: "relative",
        boxShadow: ui.glowShadow ? "0 0 40px var(--accent-glow)" : ui.boxShadow,
        maxHeight: "85dvh", overflowY: "auto",
      }} onClick={(e) => e.stopPropagation()}>

        {/* 閉じるボタン */}
        <button onClick={onClose} {...tapProps} style={{
          position: "absolute", top: "12px", right: "12px",
          background: "transparent", border: "none", color: "var(--text-dim)",
          cursor: "pointer", padding: "4px",
        }}>
          <X size={20} />
        </button>

        {/* タイトル */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "var(--accent)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>
            COMMUNITY STATS
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--primary)", fontWeight: ui.fontWeightDisplay }}>
            みんなの結果
          </div>
          <TitleDivider style={{ marginTop: "12px" }} />
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "8px" }}>{episode.meta.title}</div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-dim)", fontSize: "13px" }}>
            読み込み中...
          </div>
        ) : !stats || !supabase ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-dim)", fontSize: "13px" }}>
            データがありません
          </div>
        ) : (
          <>
            {/* サマリーカード */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { icon: <Users size={16} />, value: stats.completedCount, label: "完走者" },
                { icon: <Heart size={16} />, value: stats.likeCount, label: "いいね" },
                { icon: <Trophy size={16} />, value: `${stats.avgScore}%`, label: "平均正答率" },
              ].map(({ icon, value, label }) => (
                <TBox key={label} style={{ textAlign: "center", padding: "12px 8px" }}>
                  <div style={{ color: "var(--accent)", marginBottom: "6px" }}>{icon}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--primary)" }}>{value}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "4px" }}>{label}</div>
                </TBox>
              ))}
            </div>

            {/* ランク分布 */}
            <TBox style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--text-dim)", fontFamily: "var(--font-display)", marginBottom: "12px" }}>
                RANK DISTRIBUTION
              </div>
              {RANK_ORDER.map((r) => (
                <Bar
                  key={r}
                  label={r}
                  count={stats.rankDist[r]}
                  max={maxRankCount}
                  color={RANK_COLORS[r]}
                  highlight={myRank === r}
                />
              ))}
              {myRank && (
                <div style={{ fontSize: "11px", color: "var(--accent)", marginTop: "8px", textAlign: "center" }}>
                  ▸ あなたのランク: <strong>{myRank}</strong>
                </div>
              )}
            </TBox>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsScreen;
