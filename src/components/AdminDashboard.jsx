import { useState, useEffect, useCallback } from "react";
import { LogOut, RefreshCw, Users, CheckCircle, Heart, TrendingUp, BookOpen, Database, Eye, EyeOff, Trash2, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useAdminStats } from "../hooks/useAdminStats.js";
import { GENRES } from "../constants/genres.js";

// 管理者メールリスト（env経由）
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// ダークテーマ固定のスタイル定数
const COLORS = {
  bg: "#0a0e17", surface: "#111827", border: "#1e293b",
  accent: "#38bdf8", accentDim: "#38bdf822",
  text: "#e2e8f0", textDim: "#64748b",
  green: "#34d399", red: "#f87171", yellow: "#fbbf24",
};

const card = {
  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
  borderRadius: "8px", padding: "20px",
};

// ─── ログインフォーム ───
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await onLogin(email, password);
    if (result?.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{ ...card, width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: COLORS.accent, marginBottom: "8px" }}>ADMIN CONSOLE</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text }}>管理ダッシュボード</div>
        </div>
        <input
          type="email" placeholder="メールアドレス" value={email}
          onChange={(e) => setEmail(e.target.value)} required autoFocus
          style={inputStyle}
        />
        <input
          type="password" placeholder="パスワード" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          style={{ ...inputStyle, marginTop: "12px" }}
        />
        {error && <div style={{ color: COLORS.red, fontSize: "13px", marginTop: "12px" }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "12px", marginTop: "16px",
          background: COLORS.accent, color: COLORS.bg, border: "none",
          borderRadius: "6px", fontSize: "14px", fontWeight: 600,
          cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1,
        }}>
          {loading ? "認証中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "10px 12px",
  background: COLORS.bg, border: `1px solid ${COLORS.border}`,
  borderRadius: "6px", color: COLORS.text, fontSize: "14px",
  outline: "none",
};

// ─── KPIカード ───
const KpiCard = ({ icon, value, label, sub }) => (
  <div style={card}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: COLORS.accent }}>{icon}</div>
    <div style={{ fontSize: "28px", fontWeight: 700, color: COLORS.text }}>{value}</div>
    <div style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "4px" }}>{label}</div>
    {sub && <div style={{ fontSize: "12px", color: COLORS.accent, marginTop: "2px" }}>{sub}</div>}
  </div>
);

// ─── SVG折れ線グラフ ───
const LineChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const W = 560, H = 200, PX = 40, PY = 20;
  const chartW = W - PX * 2, chartH = H - PY * 2;
  const maxVal = Math.max(...data.map((d) => Math.max(d.started, d.completed)), 1);

  const toX = (i) => PX + (i / (data.length - 1 || 1)) * chartW;
  const toY = (v) => PY + chartH - (v / maxVal) * chartH;

  const pathStarted = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.started)}`).join(" ");
  const pathCompleted = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.completed)}`).join(" ");

  // Y軸ラベル（0, max/2, max）
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div style={{ ...card, padding: "16px" }}>
      <div style={{ fontSize: "12px", color: COLORS.textDim, marginBottom: "12px", letterSpacing: "0.1em" }}>
        DAILY SESSIONS（過去14日）
      </div>
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%", height: "auto" }}>
        {/* グリッド */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PX} y1={toY(v)} x2={W - PX} y2={toY(v)} stroke={COLORS.border} strokeDasharray="4,4" />
            <text x={PX - 6} y={toY(v) + 4} fill={COLORS.textDim} fontSize="10" textAnchor="end">{v}</text>
          </g>
        ))}
        {/* 線 */}
        <path d={pathStarted} fill="none" stroke={COLORS.accent} strokeWidth="2" />
        <path d={pathCompleted} fill="none" stroke={COLORS.green} strokeWidth="2" />
        {/* ドット */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.started)} r="3" fill={COLORS.accent} />
            <circle cx={toX(i)} cy={toY(d.completed)} r="3" fill={COLORS.green} />
          </g>
        ))}
        {/* X軸ラベル（間引き） */}
        {data.map((d, i) => (
          i % 2 === 0 || i === data.length - 1 ? (
            <text key={i} x={toX(i)} y={H + 16} fill={COLORS.textDim} fontSize="9" textAnchor="middle">
              {d.date?.slice(5)}
            </text>
          ) : null
        ))}
      </svg>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "8px", fontSize: "12px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "12px", height: "3px", background: COLORS.accent, display: "inline-block", borderRadius: "2px" }} />
          <span style={{ color: COLORS.textDim }}>アクセス</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "12px", height: "3px", background: COLORS.green, display: "inline-block", borderRadius: "2px" }} />
          <span style={{ color: COLORS.textDim }}>完走</span>
        </span>
      </div>
    </div>
  );
};

// ─── エピソード別テーブル ───
const EpisodeTable = ({ episodes }) => {
  if (!episodes || episodes.length === 0) {
    return <div style={{ ...card, textAlign: "center", color: COLORS.textDim, fontSize: "13px" }}>エピソードデータなし</div>;
  }

  return (
    <div style={{ ...card, padding: "16px", overflowX: "auto" }}>
      <div style={{ fontSize: "12px", color: COLORS.textDim, marginBottom: "12px", letterSpacing: "0.1em" }}>
        EPISODE BREAKDOWN
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            {["エピソード", "アクセス", "完走", "完走率", "平均正答", "いいね"].map((h) => (
              <th key={h} style={{ padding: "8px 6px", color: COLORS.textDim, fontWeight: 500, textAlign: "left", fontSize: "11px", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {episodes.map((ep) => {
            const compRate = ep.session_count > 0 ? Math.round((ep.completed_count / ep.session_count) * 100) : 0;
            return (
              <tr key={ep.episode_id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "10px 6px", color: COLORS.text, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ep.title || ep.episode_id}
                </td>
                <td style={tdNum}>{ep.session_count}</td>
                <td style={tdNum}>{ep.completed_count}</td>
                <td style={{ ...tdNum, color: compRate >= 50 ? COLORS.green : COLORS.yellow }}>{compRate}%</td>
                <td style={tdNum}>{Math.round(ep.avg_score_pct || 0)}%</td>
                <td style={tdNum}>{ep.like_count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const tdNum = { padding: "10px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: COLORS.text };

// ─── ジャンルラベルマップ ───
const GENRE_LABEL = Object.fromEntries(GENRES.filter((g) => g.id !== "all").map((g) => [g.id, g.shortLabel]));

// ─── エピソード管理パネル ───
const EpisodeManager = ({ supabase }) => {
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [activeByGenre, setActiveByGenre] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // episode_id of currently acting
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [epRes, activeRes] = await Promise.all([
        supabase.rpc("get_admin_episodes"),
        supabase.rpc("get_active_episodes_by_genre"),
      ]);
      if (epRes.error) throw epRes.error;
      if (activeRes.error) throw activeRes.error;
      setAllEpisodes(epRes.data || []);
      setActiveByGenre(activeRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchEpisodes(); }, [fetchEpisodes]);

  const handleTogglePublish = async (ep) => {
    setActionLoading(ep.episode_id);
    try {
      const newVal = ep.published_at ? null : new Date().toISOString();
      const { error } = await supabase.rpc("admin_update_episode_published", {
        target_episode_id: ep.episode_id,
        new_published_at: newVal,
      });
      if (error) throw error;
      await fetchEpisodes();
    } catch (e) {
      alert("更新失敗: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeActive = async (ep) => {
    setActionLoading(ep.episode_id);
    try {
      // 同ジャンルの他の公開エピソードより新しいpublished_atを設定
      const { error } = await supabase.rpc("admin_update_episode_published", {
        target_episode_id: ep.episode_id,
        new_published_at: new Date().toISOString(),
      });
      if (error) throw error;
      await fetchEpisodes();
    } catch (e) {
      alert("差し替え失敗: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (episodeId) => {
    setActionLoading(episodeId);
    try {
      const { error } = await supabase.rpc("admin_delete_episode", { target_episode_id: episodeId });
      if (error) throw error;
      setConfirmDelete(null);
      await fetchEpisodes();
    } catch (e) {
      alert("削除失敗: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textDim }}>データ取得中...</div>;
  if (error) return <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.red }}>エラー: {error}</div>;

  // アクティブエピソードのIDセット
  const activeIds = new Set(activeByGenre.map((a) => a.episode_id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ジャンル別 表示中エピソード */}
      <div style={card}>
        <div style={{ fontSize: "12px", color: COLORS.textDim, marginBottom: "16px", letterSpacing: "0.1em" }}>
          ACTIVE EPISODES（各ジャンルで表示中）
        </div>
        {GENRES.filter((g) => g.id !== "all").map((genre) => {
          const active = activeByGenre.find((a) => a.genre === genre.id);
          return (
            <div key={genre.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: "11px", color: COLORS.accent, fontWeight: 600, minWidth: "60px" }}>{genre.shortLabel}</span>
              {active ? (
                <>
                  <span style={{ fontSize: "13px", color: COLORS.text, flex: 1 }}>{active.title}</span>
                  <span style={{ fontSize: "11px", color: COLORS.textDim }}>{active.episode_id}</span>
                </>
              ) : (
                <span style={{ fontSize: "13px", color: COLORS.textDim, fontStyle: "italic" }}>未設定</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 全エピソード一覧 */}
      <div style={{ ...card, padding: "16px", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", color: COLORS.textDim, letterSpacing: "0.1em" }}>
            ALL EPISODES（{allEpisodes.length}件）
          </div>
          <button onClick={fetchEpisodes} style={iconBtn}><RefreshCw size={14} /></button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["状態", "ジャンル", "タイトル", "エピソードID", "公開日", "PV", "操作"].map((h) => (
                <th key={h} style={{ padding: "8px 6px", color: COLORS.textDim, fontWeight: 500, textAlign: "left", fontSize: "11px", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((ep) => {
              const isActive = activeIds.has(ep.episode_id);
              const isPublished = !!ep.published_at;
              const isActing = actionLoading === ep.episode_id;
              return (
                <tr key={ep.episode_id} style={{ borderBottom: `1px solid ${COLORS.border}`, opacity: isActing ? 0.5 : 1 }}>
                  <td style={{ padding: "10px 6px", whiteSpace: "nowrap" }}>
                    {isActive ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: COLORS.green, fontSize: "11px", fontWeight: 600 }}>
                        <Star size={12} fill={COLORS.green} /> 表示中
                      </span>
                    ) : isPublished ? (
                      <span style={{ color: COLORS.accent, fontSize: "11px" }}>公開</span>
                    ) : (
                      <span style={{ color: COLORS.textDim, fontSize: "11px" }}>非公開</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 6px", fontSize: "12px", color: COLORS.text }}>
                    {GENRE_LABEL[ep.genre] || ep.genre || "-"}
                  </td>
                  <td style={{ padding: "10px 6px", color: COLORS.text, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ep.title || "(untitled)"}
                  </td>
                  <td style={{ padding: "10px 6px", fontSize: "11px", color: COLORS.textDim, fontFamily: "monospace" }}>
                    {ep.episode_id}
                  </td>
                  <td style={{ padding: "10px 6px", fontSize: "11px", color: COLORS.textDim, whiteSpace: "nowrap" }}>
                    {ep.published_at ? new Date(ep.published_at).toLocaleDateString("ja-JP") : "-"}
                  </td>
                  <td style={{ ...tdNum, fontSize: "12px" }}>{ep.session_count}</td>
                  <td style={{ padding: "10px 6px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {/* 表示中にする（公開済みで非アクティブの場合） */}
                      {isPublished && !isActive && (
                        <button
                          onClick={() => handleMakeActive(ep)}
                          disabled={isActing}
                          title="このジャンルの表示エピソードにする"
                          style={{ ...smallBtn, color: COLORS.green, borderColor: COLORS.green }}
                        >
                          <Star size={12} />
                        </button>
                      )}
                      {/* 公開/非公開トグル */}
                      <button
                        onClick={() => handleTogglePublish(ep)}
                        disabled={isActing}
                        title={isPublished ? "非公開にする" : "公開する"}
                        style={{ ...smallBtn, color: isPublished ? COLORS.yellow : COLORS.accent, borderColor: isPublished ? COLORS.yellow : COLORS.accent }}
                      >
                        {isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      {/* 削除 */}
                      {confirmDelete === ep.episode_id ? (
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <button
                            onClick={() => handleDelete(ep.episode_id)}
                            disabled={isActing}
                            style={{ ...smallBtn, color: COLORS.red, borderColor: COLORS.red, fontSize: "10px", padding: "3px 8px" }}
                          >
                            確定
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            style={{ ...smallBtn, fontSize: "10px", padding: "3px 8px" }}
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(ep.episode_id)}
                          disabled={isActing}
                          title="削除"
                          style={{ ...smallBtn, color: COLORS.red, borderColor: COLORS.red }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const smallBtn = {
  background: "transparent", border: "1px solid " + COLORS.border,
  borderRadius: "4px", padding: "4px 6px", cursor: "pointer",
  display: "inline-flex", alignItems: "center", color: COLORS.textDim,
};

// ─── メインダッシュボード ───
export default function AdminDashboard() {
  const { supabase, user } = useAuth();
  const [adminUser, setAdminUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 初回: 既存セッションチェック
  useEffect(() => {
    if (!supabase) { setAuthChecked(true); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email && isAdmin(session.user.email)) {
        setAdminUser(session.user);
      }
      setAuthChecked(true);
    });
  }, [supabase]);

  const handleLogin = useCallback(async (email, password) => {
    if (!supabase) return { error: "Supabase未接続" };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!isAdmin(data.user.email)) {
      await supabase.auth.signOut();
      return { error: "管理者権限がありません" };
    }
    setAdminUser(data.user);
    return {};
  }, [supabase]);

  const handleLogout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setAdminUser(null);
  }, [supabase]);

  if (!authChecked) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, color: COLORS.textDim }}>読み込み中...</div>;
  }

  if (!adminUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard supabase={supabase} adminUser={adminUser} onLogout={handleLogout} />;
}

function isAdmin(email) {
  if (!email) return false;
  // VITE_ADMIN_EMAILS 未設定時はどのメールでも許可（開発用）
  if (ADMIN_EMAILS.length === 0) return true;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// ─── ダッシュボード本体 ───
function Dashboard({ supabase, adminUser, onLogout }) {
  const [tab, setTab] = useState("stats"); // "stats" | "episodes"
  const { overview, daily, episodes, loading, error, refetch } = useAdminStats(supabase);

  const compRate = overview && overview.total_sessions > 0
    ? Math.round((overview.completed_sessions / overview.total_sessions) * 100)
    : 0;

  const tabs = [
    { id: "stats", label: "統計", icon: <TrendingUp size={14} /> },
    { id: "episodes", label: "エピソード管理", icon: <Database size={14} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text }}>
      {/* ヘッダー */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`,
        position: "sticky", top: 0, background: COLORS.bg, zIndex: 10,
      }}>
        <div>
          <span style={{ fontSize: "11px", letterSpacing: "0.3em", color: COLORS.accent }}>ADMIN</span>
          <span style={{ fontSize: "16px", fontWeight: 700, marginLeft: "8px" }}>地球人調査センター</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: COLORS.textDim }}>{adminUser.email}</span>
          <button onClick={refetch} title="更新" style={iconBtn}><RefreshCw size={16} /></button>
          <button onClick={onLogout} title="ログアウト" style={iconBtn}><LogOut size={16} /></button>
        </div>
      </div>

      {/* タブ */}
      <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${COLORS.border}`, maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "12px 20px", background: "transparent", border: "none",
              borderBottom: tab === t.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              color: tab === t.id ? COLORS.accent : COLORS.textDim,
              fontSize: "13px", fontWeight: tab === t.id ? 600 : 400,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 20px" }}>
        {tab === "stats" && (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textDim }}>データ取得中...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ color: COLORS.red, marginBottom: "12px" }}>エラー: {error}</div>
                <button onClick={refetch} style={{ padding: "8px 20px", background: COLORS.accent, color: COLORS.bg, border: "none", borderRadius: "6px", cursor: "pointer" }}>再試行</button>
              </div>
            ) : (
              <>
                {/* KPIカード */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                  <KpiCard icon={<Users size={18} />} value={overview?.total_sessions ?? 0} label="総アクセス数" />
                  <KpiCard
                    icon={<CheckCircle size={18} />}
                    value={overview?.completed_sessions ?? 0}
                    label="完走数"
                    sub={`完走率 ${compRate}%`}
                  />
                  <KpiCard icon={<TrendingUp size={18} />} value={`${overview?.avg_confirm_pct ?? 0}%`} label="平均確認正答率" sub={`探究: ${overview?.avg_explore_pct ?? 0}%`} />
                  <KpiCard icon={<Heart size={18} />} value={overview?.total_likes ?? 0} label="総いいね数" />
                  <KpiCard icon={<BookOpen size={18} />} value={overview?.total_episodes ?? 0} label="公開エピソード" />
                </div>

                {/* 日次折れ線グラフ */}
                <div style={{ marginBottom: "24px" }}>
                  <LineChart data={daily} />
                </div>

                {/* エピソード別テーブル */}
                <EpisodeTable episodes={episodes} />
              </>
            )}
          </>
        )}

        {tab === "episodes" && <EpisodeManager supabase={supabase} />}
      </div>
    </div>
  );
}

const iconBtn = {
  background: "transparent", border: `1px solid ${COLORS.border}`,
  borderRadius: "6px", padding: "6px", color: COLORS.textDim,
  cursor: "pointer", display: "flex", alignItems: "center",
};
