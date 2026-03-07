#!/bin/bash
# =====================================================
# エピソード自動生成スクリプト (Claude Code CLI用)
# =====================================================
# 使い方:
#   全5ジャンル一括生成:  bash scripts/generate-episode.sh [YYYY-MM-DD]
#   特定ジャンルのみ:     bash scripts/generate-episode.sh YYYY-MM-DD politics_policy 01
#
# 前提: claude CLI がインストールされていること
# =====================================================

set -euo pipefail

DATE=${1:-$(date +%Y-%m-%d)}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPT_FILE="${SCRIPT_DIR}/prompts/generate-episode.md"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "ERROR: プロンプトファイルが見つかりません: $PROMPT_FILE"
  exit 1
fi

PROMPT=$(cat "$PROMPT_FILE")

generate_one() {
  local genre=$1
  local num=$2
  local filename="${DATE}-news-${num}.json"
  local filepath="src/data/episodes/${filename}"

  echo ""
  echo "=============================================="
  echo " Generating: ${genre} -> ${filename}"
  echo "=============================================="

  claude -p "${PROMPT}

---

本日は${DATE}です。
ジャンル: ${genre}
ファイル番号: ${num}

今日の日本の「${genre}」に関するニュースを1つ選び、エピソードJSONを生成してください。
ファイルを ${filepath} に保存してください。
episodeId は「${DATE}-news-${num}」、meta.date は「${DATE//-/.}」としてください。

保存後、以下のバリデーションを実行してください:
npm run validate
npm run check:episodes

エラーが出た場合はJSONを修正して再度バリデーションしてください。"

  if [ -f "$filepath" ]; then
    echo "OK: ${filename} が生成されました"
  else
    echo "WARNING: ${filename} が見つかりません。生成に失敗した可能性があります。"
  fi
}

if [ -n "${2:-}" ] && [ -n "${3:-}" ]; then
  # 特定ジャンルのみ生成
  generate_one "$2" "$3"
else
  # 全5ジャンルを順次生成（1ジャンル=1セッション）
  generate_one "politics_policy"        "01"
  generate_one "economy_finance"        "02"
  generate_one "entertainment_culture"  "03"
  generate_one "tech_ai"                "04"
  generate_one "career_workstyle"       "05"
fi

echo ""
echo "=============================================="
echo " 生成完了。最終バリデーション実行中..."
echo "=============================================="
npm run validate && npm run check:episodes

echo ""
echo "全てのバリデーションが通りました。"
