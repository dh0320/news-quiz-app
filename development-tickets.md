# 開発チケット一覧 — 地球人調査センター v2

> 作成日: 2026-02-28 / 更新日: 2026-03-01
> スタック: React 18 + Vite (Vercel) + Supabase (予定)

---

## アーキテクチャ

```
[ユーザー] ← Vercel CDN → [React SPA]
                                ↕ Supabase Client SDK
                          [Supabase]
                            ├── PostgreSQL (データ)
                            ├── Auth (匿名→アカウント昇格)
                            ├── Storage (将来: 画像等)
                            └── Row Level Security (将来: 課金ゲート)
                                ↑
                     [AIエージェント (毎朝CRON)]
                                ↓
                          [エピソードJSON → DB]
```

---

## EPIC 1: Web公開 (デプロイ基盤)

### ✅ TICKET 1-1: プロジェクト構成の整理とビルド環境構築
**ステータス: 完了** (2026-03-01)
- Viteプロジェクト化、Base64画像→WebPファイル分離
- EPISODE_DATA→JSON外部化、コンポーネント9ファイル分割

### ✅ TICKET 1-2: ホスティング環境の構築とデプロイ
**ステータス: 完了** (2026-03-01)
- Vercelデプロイ済み、GitHub push→自動デプロイ稼働中

### ✅ TICKET 1-3: Supabase接続とデータベース構築
**ステータス: 完了** (2026-03-01)
**目的:** ユーザーの行動データ（完走・スコア・いいね）を記録する基盤を用意する

**対応内容:**

1. Supabaseプロジェクト作成
2. データベーススキーマ:

```sql
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
  user_id         UUID,  -- Supabase Auth の user id (匿名含む)
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

-- ポリシー
CREATE POLICY "Users can insert own sessions" ON play_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON play_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can read own sessions" ON play_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Episodes are public" ON episodes
  FOR SELECT USING (true);
```

3. Supabase Client セットアップ:
   - `npm install @supabase/supabase-js`
   - `src/lib/supabase.js` に client初期化
   - 環境変数: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

4. 匿名認証の初期化:
   - App起動時に `supabase.auth.signInAnonymously()` で匿名セッション作成
   - 認証状態をContext or stateで管理

**完了条件:**
- Supabaseプロジェクトが稼働
- テーブルが作成されRLSが有効
- アプリから匿名認証でSupabaseに接続できる
- サンプルエピソードがepisodesテーブルに挿入されている

---

## EPIC 2: 成績ページの拡張（シェア・いいね・みんなの結果）

### ✅ TICKET 2-1: Xシェアボタンの実装
**ステータス: 完了** (2026-03-02) / 依存: なし（バックエンド不要で実装可能）

**対応内容:**
1. ResultScreen にシェアボタンUI追加
2. シェアテキスト動的生成 → `twitter.com/intent/tweet` で遷移
3. モバイル: `navigator.share` 対応時はWeb Share API優先
4. (任意) `@vercel/og` で動的OG画像

### ✅ TICKET 2-2: いいねボタンの実装
**ステータス: 完了** (2026-03-02) / 依存: 1-3

**対応内容:**
1. ❤️ボタン（スケール+色変化アニメーション）
2. Supabase直接操作: insert / delete
3. いいね数表示（count機能）
4. 1ユーザー1いいね（UNIQUE制約）

### ✅ TICKET 2-3: 「みんなの結果を見る」画面の実装
**ステータス: 完了** (2026-03-02) / 依存: 1-3, 3-1

**対応内容:**
1. StatsScreen（またはモーダル）
2. 完走者数、いいね率、ランク分布（横棒グラフ）、スコア分布
3. 自分のランクをハイライト

---

## EPIC 3: ユーザー集計・分析

### ✅ TICKET 3-1: プレイデータの記録
**ステータス: 完了** (2026-03-02) / 依存: 1-3

**対応内容:**
1. Learning開始時: `play_sessions` INSERT
2. Confirm完了時: UPDATE `confirm_score, confirm_total`
3. Explore完了時: UPDATE `explore_score, explore_total, completed: true`
4. エラー時はローカルのみで続行（UX最優先）

### TICKET 3-2: 管理者向け集計ダッシュボード
**ステータス: 未着手** / 依存: 1-3, 3-1

**対応内容:**
1. `/admin` ページ（Supabase認証で管理者のみ）
2. アクセス数、完走率、平均スコア、ランク分布、いいね数
3. 日次サマリー折れ線グラフ

---

## EPIC 4: AIエージェントによる毎日の自動コンテンツ更新

### TICKET 4-1: エピソードJSONスキーマの定義とバリデーション
**ステータス: 未着手** / 依存: なし

### TICKET 4-2: エピソードインポート + アプリの動的データ読み込み
**ステータス: 未着手** / 依存: 1-3, 4-1

**対応内容:**
1. `EPISODE_DATA` 定数 → Supabaseからfetchに変更
2. ローディングUI / エラーUI追加
3. URLパラメータで特定エピソード表示: `?ep=2026-02-28-news-01`

---

## 実装ロードマップ

```
Phase 1 — Supabase接続 (2-3日)
  ├── 1-3  Supabase + DB + 匿名認証
  ├── 3-1  プレイデータ記録
  └── 2-1  Xシェア (バックエンド不要、並行可)

Phase 2 — ソーシャル機能 (2-3日)
  ├── 2-2  いいね
  └── 2-3  みんなの結果

Phase 3 — コンテンツ自動化 (2-3日)
  ├── 4-1  JSONスキーマ
  ├── 4-2  動的読み込み + インポート
  └── 3-2  管理ダッシュボード
```
