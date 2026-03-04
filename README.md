# 地球人調査センター / Earth Observation Center

15分でニュースを学ぶ、ビジュアルノベル型の日本語学習アプリです。  
ゾルク博士（teacher）とピノ（student）が、ニュースを対話形式で解説します。

- 学習フェーズ（対話）
- 確認テスト（3択）
- 探究テスト（穴埋め）
- 結果表示

---

## 1. アプリ概要（現行仕様）

### 1-1. コンセプト
- 毎日のニュースを「短時間で」「楽しく」理解する
- 読むだけでなく、クイズで理解度を確認
- 世界観付きUI（テーマ切替可能）で継続しやすくする

### 1-2. 主な機能
- エピソード学習（JSONデータ読込）
- フェーズ遷移型の学習体験
- 7テーマのUI切替
- 匿名認証ベースの利用（Supabase）
- いいね/統計/管理ダッシュボード（実装済みコードあり）

### 1-3. 画面フロー
`HomeScreen → LearningScreen → ConfirmScreen → ExploreScreen → ResultScreen`

---

## 2. 利用者向けの使い方

1. ホーム画面で「学習を開始」
2. 対話形式でニュース内容を読む（学習フェーズ）
3. 確認テスト（3択問題）に回答
4. 探究テスト（穴埋め問題）に回答
5. 結果画面でスコアを確認

### テーマ変更
- 画面上のテーマセレクタから変更可能
- テーマは全画面に即時反映されます

---

## 3. 管理者・運用者向け（管理方法）

> この章は「日々の運用」を想定しています。

### 3-1. エピソード追加・更新

エピソードは以下に JSON で配置します。

- `src/data/episodes/*.json`

#### 追加手順
1. 既存ファイルを参考に新規JSONを作成
2. 命名規則に沿って保存（例: `2026-03-01-news-01.json`）
3. `meta.subject` は表示用ラベル、`meta.genre` はフィルタ用の内部IDとして必ず分けて設定
   - `category`（`daily_news` / `deep_dive` / `special`）は配信種別として別軸で維持
   - `genre` は以下のいずれかを指定: `politics_policy` / `economy_finance` / `entertainment_culture` / `tech_ai` / `career_workstyle`
4. 必要に応じてバリデーション実行  
   - `scripts/validate-episode.mjs`
5. ローカルで表示確認後にデプロイ

### 3-2. Supabaseスキーマ管理

DB変更は migration SQL で管理します。

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_stats_policies.sql`
- `supabase/migrations/003_update_sample_episode_full_data.sql`
- `supabase/migrations/004_admin_stats_functions.sql`

#### 運用ルール（推奨）
- スキーマ変更は必ず新規 migration を追加
- 既存 migration の直接書き換えは避ける
- 適用順が分かる連番命名を維持する

### 3-3. 管理ダッシュボード

- 管理機能は `src/components/AdminDashboard.jsx` を中心に実装
- 集計ロジックは `src/hooks/useAdminStats.js` を参照
- 権限制御は Supabase 側の RLS / policy とセットで運用する

### 3-4. 認証運用（匿名ファースト）

- 初回利用時は匿名セッションで開始
- 将来的にメール/Google連携でアカウント昇格を想定
- `src/context/AuthContext.jsx` と `src/lib/supabase.js` が基点

---

## 4. 開発者向けセットアップ

### 前提
- Node.js 18+ 推奨
- npm 利用

### セットアップ
```bash
npm install
npm run dev
```

### ビルド
```bash
npm run build
npm run preview
```

---

## 5. ディレクトリ構成（主要部分）

```txt
.
├── public/assets/                 # アバター画像
├── src/
│   ├── components/                # 画面・UIコンポーネント
│   ├── context/                   # Auth/Theme Context
│   ├── hooks/                     # データ取得・集計系フック
│   ├── lib/supabase.js            # Supabase初期化
│   └── data/episodes/             # エピソードJSON
├── supabase/migrations/           # DBマイグレーション
├── scripts/validate-episode.mjs   # エピソード検証スクリプト
├── package.json
└── README.md
```

---

## 6. 環境変数

Supabase連携時は `.env` を設定してください（値は環境ごとに管理）。

例（キー名は実装に合わせて設定）:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 7. デプロイ

- Vercelを利用（`vercel.json` あり）
- `main` への反映をトリガーに自動デプロイする運用を推奨

---

## 8. よくある運用タスク

### Q. 新しいニュース回を追加したい
- `src/data/episodes/` にJSON追加
- バリデーション
- 表示確認
- デプロイ

### Q. 集計項目を増やしたい
- Supabase migration を追加
- 集計関数/ビュー更新
- `useAdminStats` と `AdminDashboard` を更新

### Q. テーマを追加したい
- `ThemeContext.jsx` のテーマ定義に追加
- セレクターUIにラベル追加
- 全フェーズで視認性確認

---

## 9. 今後の拡張候補

- 学習履歴の可視化
- 問題難易度の自動調整
- SNSシェア機能強化
- 管理画面のCSV出力
- 有料プラン導線（将来）

---

## 10. ライセンス / クレジット

（必要に応じて追記）
- 利用ライブラリ
- 画像・フォントのライセンス
- 運営・開発体制
