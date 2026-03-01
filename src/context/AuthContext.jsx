import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase が未設定ならスキップ
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        // セッションがなければ匿名サインイン
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (error) {
            console.error("[Auth] 匿名認証エラー:", error.message);
          } else {
            setUser(data.user);
          }
          setLoading(false);
        });
      }
    });

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
