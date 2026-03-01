# CLAUDE.md — プロジェクトコンテキスト

## プロジェクト概要

**地球人調査センター** — 15分でニュースを学ぶビジュアルノベル型学習アプリ（日本語）。
宇宙人のゾルク博士（teacher）とピノ（student）が、地球観測ステーションから日本のニュースを調査・解説する設定。

- **ターゲット:** 日本語話者（中高生〜社会人）
- **1エピソード:** 学習フェーズ（23ターン対話）→ 確認テスト（3択×3問）→ 探究テスト（穴埋め×2問）→ 結果画面
- **テーマ:** 7種（サイバー/和モダン/ノワール/レトロ/理科室/ヴェイパー/コミック）を切替可能

## 技術スタック

### 現在（フロントエンドのみ）
- **フレームワーク:** React 18 + Vite
- **ホスティング:** Vercel（GitHub連携で自動デプロイ済み）
- **アイコン:** lucide-react
- **データ:** 静的JSON（`src/data/episodes/`）
- **画像:** WebPアバター2枚（`public/assets/`）

### 予定（バックエンド）
- **DB + 認証:** Supabase（PostgreSQL + Supabase Auth）
- **認証フロー:** 匿名セッション → 後からアカウント化（メール/Google）
- **決済（将来）:** Stripe

## プロジェクト構成

```
news-quiz/
├── public/
│   └── assets/
│       ├── avatar-zork.webp      # ゾルク博士アバター
│       └── avatar-pino.webp      # ピノアバター
├── src/
│   ├── main.jsx                  # エントリポイント
│   ├── App.jsx                   # ルーティング + グローバルCSS (51行)
│   ├── context/
│   │   └── ThemeContext.jsx       # テーマ定義・定数・THEMES・tapProps (332行)
│   ├── components/
│   │   ├── shared/
│   │   │   └── index.jsx         # TBox, TypewriterText, Scanlines等 (144行)
│   │   ├── ThemeSelector.jsx     # テーマ切替UI (37行)
│   │   ├── HomeScreen.jsx        # ホーム画面 (74行)
│   │   ├── LearningScreen.jsx    # 学習画面 チャット+VNモード (198行)
│   │   ├── ConfirmScreen.jsx     # 選択式テスト (69行)
│   │   ├── ExploreScreen.jsx     # 穴埋めテスト (153行)
│   │   └── ResultScreen.jsx      # 結果画面 (84行)
│   └── data/
│       └── episodes/
│           └── 2026-02-28-news-01.json  # サンプルエピソード
├── index.html
├── package.json
├── vite.config.js
└── development-tickets.md        # 開発チケット一覧
```

## 画面フロー

```
HomeScreen → LearningScreen → ConfirmScreen → ExploreScreen → ResultScreen
   ↑                                                              │
   └──────────────────── 「ホームに戻る」 ←─────────────────────────┘
```

フェーズ遷移は `App.jsx` の `useState(PHASES.HOME)` で管理。
遷移時に `PhaseTransition` アニメーション（2.8秒）が挟まる。

## テーマシステム

`ThemeContext.jsx` で定義。各テーマは以下を持つ:
- `vars`: CSS変数（--bg, --accent, --text等）
- `uiStyle`: UI形状（borderRadius, cornerBrackets, glowShadow等）
- `labels`: 表示テキスト（ボタン名、フェーズ名等）
- `fonts`: Google Fontsインポート

テーマは `ThemeContext` (React Context) 経由で全コンポーネントに配信。
CSS変数はApp.jsxの `<style>` タグで `:root` に注入。

## 設計上の決定事項

### 認証
- **匿名ファースト:** 初回はUUID生成でlocalStorageに保存、ログイン不要で即プレイ
- **後からアカウント化:** Supabase Authの匿名→メール/Google昇格機能を使用
- **理由:** 学習アプリなので「すぐ始められる」体験が最優先

### マネタイズ（将来）
- 1日1エピソード無料、過去分やプレミアムは月額制を想定
- Vercel Pro ($20/月) + Supabase Pro ($25/月) で運用
- Supabase Row Level Security で課金ゲート

### コーディング規約
- インラインスタイル使用（CSS-in-JSの代わり。テーマのCSS変数と併用）
- コンポーネントは関数コンポーネント + hooks
- 日本語コメント推奨
- コミットメッセージは日本語OK

## 開発チケット

`development-tickets.md` を参照。現在のステータス:

| チケット | ステータス |
|---------|-----------|
| 1-1 プロジェクト構成 | ✅ 完了 |
| 1-2 デプロイ | ✅ 完了（Vercel） |
| 1-3 API + DB | 🔜 次のタスク |
| 2-1 Xシェア | 未着手 |
| 2-2 いいね | 未着手（1-3依存） |
| 2-3 みんなの結果 | 未着手（1-3, 3-1依存） |
| 3-1 プレイデータ記録 | 未着手（1-3依存） |
| 3-2 管理ダッシュボード | 未着手 |
| 4-1 JSONスキーマ | 未着手 |
| 4-2 インポート+動的読み込み | 未着手（1-3, 4-1依存） |

### 次の作業（推奨順）
1. **Supabase プロジェクト作成 + DB スキーマ構築** (1-3)
2. **プレイデータ記録** (3-1) — API接続の最小実装
3. **Xシェアボタン** (2-1) — バックエンド不要で並行可能
4. **いいね** (2-2)
5. **みんなの結果** (2-3)

## ビルド・開発コマンド

```bash
npm install       # 依存インストール
npm run dev       # ローカル開発サーバー (localhost:3000)
npm run build     # プロダクションビルド (dist/)
npm run preview   # ビルド結果のプレビュー
```

## 注意事項

- `ThemeContext.jsx` が332行と大きいが、7テーマの定義データなので分割不要
- `LearningScreen.jsx` はチャットモード/VNモードの2表示を持つため198行ある
- テーマシステムは `var(--accent)` 等のCSS変数に依存しているため、新コンポーネントもこれに準拠すること
- アバター画像は `public/assets/` にあり、パス参照は `/assets/avatar-zork.webp` 形式
