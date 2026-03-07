-- 008_admin_episode_management.sql
-- 管理者向けエピソード管理用RPC関数

-- エピソード一覧取得（管理用: 全フィールド含む）
CREATE OR REPLACE FUNCTION get_admin_episodes()
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json)
  FROM (
    SELECT
      ep.episode_id,
      ep.data_json->'meta'->>'title' AS title,
      ep.data_json->'meta'->>'subtitle' AS subtitle,
      ep.data_json->'meta'->>'date' AS episode_date,
      ep.genre,
      ep.published_at,
      ep.created_at,
      COALESCE(ps.session_count, 0) AS session_count,
      COALESCE(ps.completed_count, 0) AS completed_count
    FROM episodes ep
    LEFT JOIN (
      SELECT
        episode_id,
        COUNT(*) AS session_count,
        COUNT(*) FILTER (WHERE completed = true) AS completed_count
      FROM play_sessions
      GROUP BY episode_id
    ) ps ON ps.episode_id = ep.episode_id
    ORDER BY ep.published_at DESC NULLS LAST, ep.created_at DESC
  ) e;
$$ LANGUAGE sql SECURITY DEFINER;

-- 各ジャンルで現在表示されているエピソード（published_at降順の先頭1件）
CREATE OR REPLACE FUNCTION get_active_episodes_by_genre()
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
  FROM (
    SELECT DISTINCT ON (genre)
      episode_id,
      genre,
      data_json->'meta'->>'title' AS title,
      published_at
    FROM episodes
    WHERE published_at IS NOT NULL AND genre IS NOT NULL
    ORDER BY genre, published_at DESC
  ) r;
$$ LANGUAGE sql SECURITY DEFINER;

-- エピソードのpublished_atを更新（公開/非公開/差し替え）
CREATE OR REPLACE FUNCTION admin_update_episode_published(
  target_episode_id TEXT,
  new_published_at TIMESTAMPTZ
)
RETURNS JSON AS $$
  UPDATE episodes
  SET published_at = new_published_at
  WHERE episode_id = target_episode_id
  RETURNING json_build_object('episode_id', episode_id, 'published_at', published_at);
$$ LANGUAGE sql SECURITY DEFINER;

-- エピソード削除（play_sessions/likesのFK参照があるので CASCADE的に処理）
CREATE OR REPLACE FUNCTION admin_delete_episode(target_episode_id TEXT)
RETURNS JSON AS $$
  WITH deleted_likes AS (
    DELETE FROM likes WHERE episode_id = target_episode_id
  ),
  deleted_sessions AS (
    DELETE FROM play_sessions WHERE episode_id = target_episode_id
  ),
  deleted_ep AS (
    DELETE FROM episodes WHERE episode_id = target_episode_id
    RETURNING episode_id
  )
  SELECT json_build_object(
    'deleted', (SELECT COUNT(*) FROM deleted_ep)
  );
$$ LANGUAGE sql SECURITY DEFINER;
