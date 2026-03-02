import { useState, useEffect, useCallback } from "react";

/**
 * 管理者ダッシュボード用の集計データを取得するフック
 * Supabase RPC関数を呼び出して全体概要・日次推移・エピソード別統計を返す
 */
export function useAdminStats(supabase) {
  const [overview, setOverview] = useState(null);
  const [daily, setDaily] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setError("Supabase未接続");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [ovRes, dailyRes, epRes] = await Promise.all([
        supabase.rpc("get_admin_overview"),
        supabase.rpc("get_admin_daily_stats", { days_back: 14 }),
        supabase.rpc("get_admin_episode_stats"),
      ]);

      if (ovRes.error) throw ovRes.error;
      if (dailyRes.error) throw dailyRes.error;
      if (epRes.error) throw epRes.error;

      setOverview(ovRes.data);
      setDaily(dailyRes.data || []);
      setEpisodes(epRes.data || []);
    } catch (e) {
      console.error("[useAdminStats]", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { overview, daily, episodes, loading, error, refetch: fetchAll };
}
