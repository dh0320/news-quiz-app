#!/usr/bin/env node
/**
 * 生成済みエピソードJSONをSupabaseにアップロード（published_at=null、非公開状態）
 *
 * 使い方:
 *   node scripts/upload-episodes.mjs [YYYY-MM-DD]
 *   引数なしで当日分を対象
 *
 * 環境変数:
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 *   または SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (CI用、優先)
 */
import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const ROOT = resolve(import.meta.dirname, "..");
const EPISODES_DIR = join(ROOT, "src/data/episodes");

// 日付引数
const targetDate = process.argv[2] || new Date().toISOString().slice(0, 10);
const filePrefix = `${targetDate}-news-`;

// Supabase接続（CI用 service role key を優先）
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (または VITE_*) が未設定です");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 対象ファイル取得
const files = readdirSync(EPISODES_DIR)
  .filter((f) => f.startsWith(filePrefix) && f.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.log(`対象ファイルなし: ${filePrefix}*.json`);
  process.exit(0);
}

console.log(`${files.length} 件のエピソードをアップロードします (${targetDate})`);

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

for (const file of files) {
  const filePath = join(EPISODES_DIR, file);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  const episodeId = data.episodeId;
  const genre = data.meta?.genre || null;

  // upsert: 既存なら data_json と genre を更新、published_at は触らない
  const { error } = await supabase
    .from("episodes")
    .upsert(
      {
        episode_id: episodeId,
        data_json: data,
        genre: genre,
      },
      { onConflict: "episode_id", ignoreDuplicates: false }
    );

  if (error) {
    console.error(`  NG: ${file} — ${error.message}`);
    errorCount++;
  } else {
    console.log(`  OK: ${file} (${genre}) -> episodes テーブル (非公開)`);
    successCount++;
  }
}

console.log(`\n完了: 成功=${successCount}, スキップ=${skipCount}, エラー=${errorCount}`);
if (errorCount > 0) process.exit(1);
