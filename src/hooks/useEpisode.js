import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import fallbackEpisode from "../data/episodes/2026-02-28-news-01.json";

const localEpisodeModules = import.meta.glob("../data/episodes/*.json", { eager: true });

function getLocalEpisodes() {
  return Object.values(localEpisodeModules)
    .map((mod) => mod.default)
    .filter(isValidEpisodeShape)
    .sort((a, b) => b.episodeId.localeCompare(a.episodeId));
}

function resolveLocalEpisode(epParam) {
  const localEpisodes = getLocalEpisodes();

  if (epParam) {
    const matched = localEpisodes.find((ep) => ep.episodeId === epParam);
    if (matched) return matched;
  }

  return localEpisodes[0] ?? fallbackEpisode;
}

function isValidEpisodeShape(data) {
  return Array.isArray(data?.testPhase?.confirm) && Array.isArray(data?.testPhase?.explore);
}

/**
 * エピソードデータを動的に取得するフック
 * - Supabase接続時: episodesテーブルからfetch
 * - 未接続時: ローカルJSONにフォールバック
 * - ?ep=XXXX で特定エピソード指定可能
 * @returns {{ episode: object|null, loading: boolean, error: string|null }}
 */
export function useEpisode() {
  const { supabase } = useAuth();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const epParam = params.get("ep");

    // Supabase未接続 → ローカルJSONを最新順で選択
    if (!supabase) {
      setEpisode(resolveLocalEpisode(epParam));
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        let query;
        if (epParam) {
          // URLパラメータ指定: 特定エピソードを取得
          query = supabase
            .from("episodes")
            .select("data_json")
            .eq("episode_id", epParam)
            .single();
        } else {
          // 最新の公開済みエピソードを取得
          query = supabase
            .from("episodes")
            .select("data_json")
            .not("published_at", "is", null)
            .order("published_at", { ascending: false })
            .limit(1)
            .single();
        }

        const { data, error: fetchError } = await query;

        if (cancelled) return;

        if (fetchError) {
          console.warn("[useEpisode] Supabase取得失敗、ローカルにフォールバック:", fetchError.message);
          setEpisode(resolveLocalEpisode(epParam));
        } else if (!isValidEpisodeShape(data?.data_json)) {
          console.warn("[useEpisode] 取得データの形式が不正のためローカルにフォールバック");
          setEpisode(resolveLocalEpisode(epParam));
        } else {
          setEpisode(data.data_json);
        }
      } catch (e) {
        if (cancelled) return;
        console.warn("[useEpisode] 予期しないエラー、ローカルにフォールバック:", e.message);
        setEpisode(resolveLocalEpisode(epParam));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [supabase]);

  return { episode, loading, error };
}
