#!/bin/bash
# =====================================================
# 毎日のエピソード自動生成 & デプロイ (Windows Task Scheduler / cron 用)
# =====================================================
# 使い方:
#   bash scripts/daily-cron.sh [YYYY-MM-DD]
#
# 処理フロー:
#   1. git pull (最新化)
#   2. generate-episode.sh (5ジャンル生成)
#   3. バリデーション
#   4. git commit & push
#   5. (オプション) Supabase アップロード
# =====================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DATE=${1:-$(date +%Y-%m-%d)}
LOG_FILE="${REPO_DIR}/logs/daily-${DATE}.log"

# ログディレクトリ作成
mkdir -p "${REPO_DIR}/logs"

# ログ出力を設定（ターミナル + ファイル両方に出力）
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=============================================="
echo " 日次エピソード生成: ${DATE}"
echo " 開始: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=============================================="

cd "$REPO_DIR"

# --- 1. git pull ---
echo ""
echo "[1/5] git pull..."
git pull origin main || {
  echo "WARNING: git pull に失敗しましたが続行します"
}

# --- 2. npm install (依存が更新されている場合に備えて) ---
echo ""
echo "[2/5] npm install..."
npm install --silent

# --- 3. エピソード生成 ---
echo ""
echo "[3/5] エピソード生成中... (5ジャンル)"
bash scripts/generate-episode.sh "$DATE"

# --- 4. 生成結果の確認 ---
echo ""
echo "[4/5] 生成ファイル確認..."
GENERATED=$(find src/data/episodes -name "${DATE}-news-*.json" | sort)
COUNT=$(echo "$GENERATED" | grep -c . || true)

if [ "$COUNT" -eq 0 ]; then
  echo "ERROR: エピソードが1つも生成されませんでした"
  exit 1
fi

echo "${COUNT} 件のエピソードが生成されました:"
echo "$GENERATED"

# --- 5. git commit & push ---
echo ""
echo "[5/5] git commit & push..."
git add src/data/episodes/${DATE}-news-*.json

if git diff --cached --quiet; then
  echo "変更なし（既にコミット済み）"
else
  git commit -m "add: ${DATE} エピソード自動生成 (${COUNT}件)"

  # プッシュ (リトライ付き)
  RETRY_DELAYS=(2 4 8 16)
  PUSHED=false
  for i in "${!RETRY_DELAYS[@]}"; do
    if git push origin main; then
      PUSHED=true
      break
    fi
    echo "push失敗。${RETRY_DELAYS[$i]}秒後にリトライ... ($((i+1))/4)"
    sleep "${RETRY_DELAYS[$i]}"
  done

  if [ "$PUSHED" = false ]; then
    echo "ERROR: git push が4回失敗しました"
    exit 1
  fi
fi

# --- (オプション) Supabase アップロード ---
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo ""
  echo "[optional] Supabase アップロード..."
  node scripts/upload-episodes.mjs "$DATE"
else
  echo ""
  echo "[optional] Supabase環境変数が未設定のためアップロードをスキップ"
fi

echo ""
echo "=============================================="
echo " 完了: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=============================================="
