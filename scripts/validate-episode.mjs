#!/usr/bin/env node
/**
 * エピソードJSONバリデーター
 * 使い方: node scripts/validate-episode.mjs [ファイルパス ...]
 * 引数なしで実行すると src/data/episodes/*.json を全てチェック
 */
import { readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = resolve(import.meta.dirname, "..");
const SCHEMA_PATH = join(ROOT, "src/data/schemas/episode.schema.json");
const EPISODES_DIR = join(ROOT, "src/data/episodes");

const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf-8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

// 対象ファイル決定
let files = process.argv.slice(2);
if (files.length === 0) {
  files = readdirSync(EPISODES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(EPISODES_DIR, f));
}

let hasError = false;

for (const filePath of files) {
  const abs = resolve(filePath);
  let data;
  try {
    data = JSON.parse(readFileSync(abs, "utf-8"));
  } catch (e) {
    console.error(`❌ ${abs}: JSONパースエラー — ${e.message}`);
    hasError = true;
    continue;
  }

  const valid = validate(data);
  if (valid) {
    // 追加チェック: wordBankに正解が全て含まれているか
    const warnings = [];
    for (const eq of data.testPhase.explore) {
      for (const [key, ans] of Object.entries(eq.answers)) {
        if (!eq.wordBank.includes(ans)) {
          warnings.push(`explore問題: ${key}の正解「${ans}」がwordBankに含まれていません`);
        }
      }
    }
    // 追加チェック: correctIdがchoices内に存在するか・choice id重複がないか
    for (const [i, cq] of data.testPhase.confirm.entries()) {
      const choiceIds = cq.choices.map((c) => c?.id).filter((id) => typeof id === "string");

      if (choiceIds.length !== cq.choices.length) {
        warnings.push(`confirm問題${i + 1}: choicesにid未定義の要素があります`);
      }

      if (!choiceIds.includes(cq.correctId)) {
        warnings.push(`confirm問題${i + 1}: correctId「${cq.correctId}」がchoicesのidに含まれていません`);
      }

      const duplicatedIds = [...new Set(choiceIds.filter((id, idx) => choiceIds.indexOf(id) !== idx))];
      if (duplicatedIds.length > 0) {
        warnings.push(`confirm問題${i + 1}: choicesのidが重複しています [${duplicatedIds.join(", ")}]`);
      }
    }

    if (warnings.length > 0) {
      console.warn(`⚠️  ${abs}: スキーマOK、但し警告あり`);
      warnings.forEach((w) => console.warn(`   → ${w}`));
    } else {
      console.log(`✅ ${abs}`);
    }
  } else {
    hasError = true;
    console.error(`❌ ${abs}: バリデーションエラー`);
    for (const err of validate.errors) {
      console.error(`   → ${err.instancePath || "/"}: ${err.message}`);
    }
  }
}

process.exit(hasError ? 1 : 0);
