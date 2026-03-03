# エピソード運用ルール（案）

このドキュメントは「JSONを追加したら自動反映」運用の最低限ルールです。

## 1. 目的

- エピソード品質を壊さずに、更新作業を高速化する
- 人手レビュー前に機械チェックで不正JSONを止める

## 2. 反映フロー

1. `src/data/episodes/` に新規JSONを追加（または更新）
2. PR作成
3. GitHub Actions `Episode Content Guard` が自動実行
4. 全チェック成功時のみマージ可
5. `main` 反映後にVercelが自動デプロイ

## 3. CIでチェックする内容（止めるポイント）

### Gate-1: スキーマ検証（`npm run validate`）
- 失敗条件:
  - 必須キー不足（`meta`, `learningPhase`, `testPhase` など）
  - `confirm` が3問以外、`explore` が2問以外
  - `correctId` 不正、`sentence` の `{{blankN}}` 不正
- 失敗時: **PRはマージ禁止**

### Gate-2: 命名/ID/日付ルール（`node scripts/check-episodes.mjs`）
- 失敗条件:
  - ファイル名が `YYYY-MM-DD-news-NN.json` 形式でない
  - `episodeId` とファイル名ベース名が一致しない
  - `episodeId` 重複
  - `meta.date` が `YYYY.MM.DD` 形式でない
- 失敗時: **PRはマージ禁止**

## 4. 運用ルール（決めるべき事項）

### 4-1. 命名・識別子
- ファイル名: `YYYY-MM-DD-news-01.json`
- `episodeId`: ファイル名と完全一致（拡張子除く）
- 同日で複数本なら末尾を `-02`, `-03` で連番

### 4-2. 公開単位
- 1 PR = 原則1エピソード
- スキーマ更新PRとコンテンツ更新PRは分離

### 4-3. レビュー基準（人手）
- 事実誤認（数値・日付・主語）
- 難易度が `meta.difficulty` と本文の難しさに合っているか
- `explanation` が学習者向けに平易か

### 4-4. ロールバック
- 問題が出たら当該PRをRevert
- 緊急時は直前安定コミットへ戻す

### 4-5. 変更権限
- `src/data/episodes/**` はCODEOWNERSでレビュアー必須化を推奨
- 直接 `main` push禁止（PR経由のみ）

## 5. すぐ使える運用チェックリスト

- [ ] ファイル名が規則通り
- [ ] `episodeId` が一致
- [ ] `npm run validate` 成功
- [ ] `node scripts/check-episodes.mjs` 成功
- [ ] 内容レビュー（事実・日本語・難易度）完了
- [ ] マージ後、Vercel本番で表示確認
