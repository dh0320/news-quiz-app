-- 004_admin_stats_functions.sql
-- 管理者向け集計ダッシュボード用 RPC関数
-- SECURITY DEFINER: RLSをバイパスして全データを集計

-- 全体概要
CREATE OR REPLACE FUNCTION get_admin_overview()
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_sessions', (SELECT COUNT(*) FROM play_sessions),
    'completed_sessions', (SELECT COUNT(*) FROM play_sessions WHERE completed = true),
    'total_likes', (SELECT COUNT(*) FROM likes),
    'total_episodes', (SELECT COUNT(*) FROM episodes WHERE published_at IS NOT NULL),
    'avg_confirm_pct', (SELECT COALESCE(ROUND(AVG(
      CASE WHEN confirm_total > 0 THEN confirm_score::numeric / confirm_total * 100 END
    ), 1), 0) FROM play_sessions WHERE completed = true),
    'avg_explore_pct', (SELECT COALESCE(ROUND(AVG(
      CASE WHEN explore_total > 0 THEN explore_score::numeric / explore_total * 100 END
    ), 1), 0) FROM play_sessions WHERE completed = true)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 日次サマリー（過去N日、デフォルト14日）
CREATE OR REPLACE FUNCTION get_admin_daily_stats(days_back INT DEFAULT 14)
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json)
  FROM (
    SELECT
      dt::date AS date,
      COALESCE(s.started, 0) AS started,
      COALESCE(s.completed, 0) AS completed
    FROM generate_series(
      CURRENT_DATE - (days_back - 1),
      CURRENT_DATE,
      '1 day'
    ) AS dt
    LEFT JOIN (
      SELECT
        created_at::date AS day,
        COUNT(*) AS started,
        COUNT(*) FILTER (WHERE completed = true) AS completed
      FROM play_sessions
      GROUP BY created_at::date
    ) s ON s.day = dt::date
    ORDER BY dt
  ) d;
$$ LANGUAGE sql SECURITY DEFINER;

-- エピソード別統計
CREATE OR REPLACE FUNCTION get_admin_episode_stats()
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json)
  FROM (
    SELECT
      ep.episode_id,
      ep.data_json->'meta'->>'title' AS title,
      ep.published_at,
      COALESCE(ps.session_count, 0) AS session_count,
      COALESCE(ps.completed_count, 0) AS completed_count,
      COALESCE(ps.avg_score_pct, 0) AS avg_score_pct,
      COALESCE(lk.like_count, 0) AS like_count
    FROM episodes ep
    LEFT JOIN (
      SELECT
        episode_id,
        COUNT(*) AS session_count,
        COUNT(*) FILTER (WHERE completed = true) AS completed_count,
        ROUND(AVG(
          CASE WHEN completed = true AND (confirm_total + explore_total) > 0
          THEN (confirm_score + explore_score)::numeric / (confirm_total + explore_total) * 100
          END
        ), 1) AS avg_score_pct
      FROM play_sessions
      GROUP BY episode_id
    ) ps ON ps.episode_id = ep.episode_id
    LEFT JOIN (
      SELECT episode_id, COUNT(*) AS like_count
      FROM likes
      GROUP BY episode_id
    ) lk ON lk.episode_id = ep.episode_id
    ORDER BY ep.published_at DESC NULLS LAST
  ) e;
$$ LANGUAGE sql SECURITY DEFINER;
