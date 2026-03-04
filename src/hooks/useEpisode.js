import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import fallbackEpisode from "../data/episodes/2026-02-28-news-01.json";

const localEpisodeModules = import.meta.glob("../data/episodes/*.json", { eager: true });

function normalizeGenre(genre) {
  return genre && genre !== "all" ? genre : null;
}

function filterEpisodesByGenre(episodes, selectedGenre) {
  const genre = normalizeGenre(selectedGenre);
  if (!genre) return episodes;
  return episodes.filter((episode) => episode?.meta?.genre === genre);
}

function getLocalEpisodes(selectedGenre) {
  const localEpisodes = Object.values(localEpisodeModules)
    .map((mod) => mod.default)
    .filter(isValidEpisodeShape)
    .sort((a, b) => b.episodeId.localeCompare(a.episodeId));

  const filteredEpisodes = filterEpisodesByGenre(localEpisodes, selectedGenre);
  return filteredEpisodes.length > 0 ? filteredEpisodes : localEpisodes;
}

function resolveLocalEpisode(epParam, selectedGenre) {
  const localEpisodes = getLocalEpisodes(selectedGenre);

  if (epParam) {
    const matched = Object.values(localEpisodeModules)
      .map((mod) => mod.default)
      .filter(isValidEpisodeShape)
      .find((ep) => ep.episodeId === epParam);
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
 * @param {string} selectedGenre 選択されたジャンル（all の場合は全件対象）
 * @returns {{ episode: object|null, loading: boolean, error: string|null }}
 */
export function useEpisode(selectedGenre = "all") {
  const { supabase } = useAuth();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const epParam = params.get("ep");

    // Supabase未接続 → ローカルJSONを最新順で選択
    if (!supabase) {
      setEpisode(resolveLocalEpisode(epParam, selectedGenre));
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
          // 公開済みエピソード候補を取得（genre指定時はDB側で絞り込み）
          const normalizedGenre = normalizeGenre(selectedGenre);
          query = supabase
            .from("episodes")
            .select("data_json")
            .not("published_at", "is", null)
            .order("published_at", { ascending: false })
            .limit(20);

          if (normalizedGenre) {
            query = query.eq("genre", normalizedGenre);
          }
        }

        const { data, error: fetchError } = await query;

        if (cancelled) return;

        if (fetchError) {
          console.warn("[useEpisode] Supabase取得失敗、ローカルにフォールバック:", fetchError.message);
          setEpisode(resolveLocalEpisode(epParam, selectedGenre));
        } else if (epParam) {
          if (!isValidEpisodeShape(data?.data_json)) {
            console.warn("[useEpisode] 取得データの形式が不正のためローカルにフォールバック");
            setEpisode(resolveLocalEpisode(epParam, selectedGenre));
          } else {
            setEpisode(data.data_json);
          }
        } else {
          const candidates = Array.isArray(data)
            ? data.map((row) => row?.data_json).filter(isValidEpisodeShape)
            : [];
          const resolvedEpisode = candidates[0] || resolveLocalEpisode(null, selectedGenre);
          setEpisode(resolvedEpisode);
        }
      } catch (e) {
        if (cancelled) return;
        console.warn("[useEpisode] 予期しないエラー、ローカルにフォールバック:", e.message);
        setEpisode(resolveLocalEpisode(epParam, selectedGenre));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedGenre, supabase]);

  return { episode, loading, error };
}
