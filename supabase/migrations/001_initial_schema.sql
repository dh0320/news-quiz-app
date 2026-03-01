-- 001_initial_schema.sql
-- 地球人調査センター — 初期DBスキーマ

-- エピソードマスタ
CREATE TABLE episodes (
  episode_id    TEXT PRIMARY KEY,
  data_json     JSONB NOT NULL,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- プレイログ
CREATE TABLE play_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id      TEXT REFERENCES episodes(episode_id),
  user_id         UUID,
  completed       BOOLEAN DEFAULT FALSE,
  confirm_score   INTEGER,
  explore_score   INTEGER,
  confirm_total   INTEGER,
  explore_total   INTEGER,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- いいね
CREATE TABLE likes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id   TEXT REFERENCES episodes(episode_id),
  user_id      UUID NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(episode_id, user_id)
);

-- RLS有効化
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- ポリシー: play_sessions
CREATE POLICY "Users can insert own sessions" ON play_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON play_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own sessions" ON play_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- ポリシー: likes
CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);

-- ポリシー: episodes（誰でも読める）
CREATE POLICY "Episodes are public" ON episodes
  FOR SELECT USING (true);

-- サンプルエピソード挿入
INSERT INTO episodes (episode_id, data_json, published_at)
VALUES (
  '2026-02-28-news-01',
  '{
    "episodeId": "2026-02-28-news-01",
    "meta": {
      "category": "daily_news",
      "subject": "経済",
      "title": "日銀、17年ぶりの追加利上げを決定",
      "subtitle": "地球人はなぜ「金利」で経済を操るのか？",
      "estimatedMinutes": 15,
      "difficulty": 2,
      "date": "2026.02.28"
    }
  }'::jsonb,
  '2026-02-28T00:00:00Z'
);
