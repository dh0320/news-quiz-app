#!/usr/bin/env node
import { readdirSync, readFileSync } from 'fs';
import { join, resolve, basename } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const EPISODES_DIR = join(ROOT, 'src/data/episodes');
const FILE_RE = /^\d{4}-\d{2}-\d{2}-news-\d{2}\.json$/;
const ID_RE = /^\d{4}-\d{2}-\d{2}-news-\d{2}$/;

const files = readdirSync(EPISODES_DIR).filter((f) => f.endsWith('.json')).sort();
const ids = new Set();
let hasError = false;

for (const file of files) {
  const full = join(EPISODES_DIR, file);

  if (!FILE_RE.test(file)) {
    console.error(`❌ ファイル名形式エラー: ${file} (期待: YYYY-MM-DD-news-NN.json)`);
    hasError = true;
    continue;
  }

  let json;
  try {
    json = JSON.parse(readFileSync(full, 'utf-8'));
  } catch (e) {
    console.error(`❌ JSON構文エラー: ${file} (${e.message})`);
    hasError = true;
    continue;
  }

  const expectedId = basename(file, '.json');

  if (json.episodeId !== expectedId) {
    console.error(`❌ episodeId不一致: ${file} (episodeId=${json.episodeId}, expected=${expectedId})`);
    hasError = true;
  }

  if (!ID_RE.test(json.episodeId || '')) {
    console.error(`❌ episodeId形式エラー: ${file} (episodeId=${json.episodeId})`);
    hasError = true;
  }

  if (ids.has(json.episodeId)) {
    console.error(`❌ episodeId重複: ${json.episodeId}`);
    hasError = true;
  }
  ids.add(json.episodeId);

  const date = json?.meta?.date;
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(date || '')) {
    console.error(`❌ meta.date形式エラー: ${file} (meta.date=${date}, expected=YYYY.MM.DD)`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`✅ ${files.length} 件のエピソードで命名・ID・日付ルールを確認`);
