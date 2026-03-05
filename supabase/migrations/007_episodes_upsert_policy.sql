-- 007_episodes_upsert_policy.sql
-- フロントエンドからローカルJSONエピソードを自動同期するためのポリシー追加

-- 認証済みユーザー（匿名含む）がエピソードをupsertできるようにする
CREATE POLICY "Authenticated users can insert episodes" ON episodes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update episodes" ON episodes
  FOR UPDATE USING (auth.role() = 'authenticated');
