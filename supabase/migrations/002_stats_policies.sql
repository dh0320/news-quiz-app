-- 002_stats_policies.sql
-- みんなの結果表示用: 集計クエリ向けのSELECTポリシー

-- play_sessions: 完了済みセッションの集計データを全ユーザーに公開
-- （個人を特定する情報は返さず、集計のみ）
CREATE POLICY "Anyone can read completed sessions for stats" ON play_sessions
  FOR SELECT USING (completed = true);

-- likes: いいね数の集計を全ユーザーに公開
CREATE POLICY "Anyone can read likes for count" ON likes
  FOR SELECT USING (true);
