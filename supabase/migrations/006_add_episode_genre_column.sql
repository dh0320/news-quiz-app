-- 006_add_episode_genre_column.sql
-- episodes.genre を追加し、meta.genre からバックフィルする

ALTER TABLE episodes
ADD COLUMN genre TEXT;

ALTER TABLE episodes
ADD CONSTRAINT episodes_genre_check
CHECK (
  genre IS NULL
  OR genre IN (
    'politics_policy',
    'economy_finance',
    'entertainment_culture',
    'tech_ai',
    'career_workstyle'
  )
);

-- 既存データの backfill: data_json.meta.genre が許可値のときのみ反映
UPDATE episodes
SET genre = CASE data_json->'meta'->>'genre'
  WHEN 'politics_policy' THEN 'politics_policy'
  WHEN 'economy_finance' THEN 'economy_finance'
  WHEN 'entertainment_culture' THEN 'entertainment_culture'
  WHEN 'tech_ai' THEN 'tech_ai'
  WHEN 'career_workstyle' THEN 'career_workstyle'
  ELSE NULL
END
WHERE genre IS NULL;
