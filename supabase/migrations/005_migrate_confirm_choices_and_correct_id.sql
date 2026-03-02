-- 005_migrate_confirm_choices_and_correct_id.sql
-- episodes.data_json の testPhase.confirm を新フォーマットへ移行
-- - choices: ["A", "B"] -> [{"id":"a","text":"A"}, ...]
-- - correctIndex -> correctId
-- - correctIndex を削除

UPDATE episodes
SET data_json = jsonb_set(
  data_json,
  '{testPhase,confirm}',
  (
    SELECT jsonb_agg(
      (confirm_item - 'correctIndex') || jsonb_build_object(
        'choices', (
          SELECT jsonb_agg(
            jsonb_build_object('id', chr(96 + choice_ord), 'text', choice_text)
            ORDER BY choice_ord
          )
          FROM jsonb_array_elements_text(confirm_item->'choices') WITH ORDINALITY AS choice(choice_text, choice_ord)
        ),
        'correctId', chr(97 + (confirm_item->>'correctIndex')::int)
      )
      ORDER BY confirm_ord
    )
    FROM jsonb_array_elements(data_json->'testPhase'->'confirm') WITH ORDINALITY AS confirm(confirm_item, confirm_ord)
  ),
  false
)
WHERE jsonb_typeof(data_json->'testPhase'->'confirm') = 'array';
