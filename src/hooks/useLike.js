import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * いいね状態の管理フック
 * @param {string} episodeId
 * @returns {{ liked, likeCount, toggleLike, loading }}
 */
export function useLike(episodeId) {
  const { user, supabase } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 初回: いいね数 + 自分がいいね済みか取得
  useEffect(() => {
    if (!supabase || !episodeId) return;

    const fetch = async () => {
      // いいね総数
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("episode_id", episodeId);
      setLikeCount(count ?? 0);

      // 自分のいいね状態
      if (user) {
        const { data } = await supabase
          .from("likes")
          .select("id")
          .eq("episode_id", episodeId)
          .eq("user_id", user.id)
          .maybeSingle();
        setLiked(!!data);
      }
    };
    fetch();
  }, [supabase, episodeId, user]);

  const toggleLike = useCallback(async () => {
    if (!supabase || !user || loading) return;
    setLoading(true);

    try {
      if (liked) {
        // いいね解除
        await supabase
          .from("likes")
          .delete()
          .eq("episode_id", episodeId)
          .eq("user_id", user.id);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        // いいね追加
        const { error } = await supabase
          .from("likes")
          .insert({ episode_id: episodeId, user_id: user.id });
        if (!error) {
          setLiked(true);
          setLikeCount((c) => c + 1);
        }
      }
    } catch {
      /* UX最優先: エラー時は何もしない */
    } finally {
      setLoading(false);
    }
  }, [supabase, user, episodeId, liked, loading]);

  return { liked, likeCount, toggleLike, loading };
}
