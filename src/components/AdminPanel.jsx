import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Lock, Trophy } from "lucide-react";
import { BRAND, ADMIN_PASSWORD, useScreenSize, supabase } from "../config";
import AppHeader from "./AppHeader";
import { createStyles } from "../styleUtils";

export default function AdminPanel() {
  const { isMobile, isTablet } = useScreenSize();
  const styles = useMemo(() => createStyles(isMobile, isTablet), [isMobile, isTablet]);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [results, setResults] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      if (supabase) {
        const { data, error } = await supabase.from("quiz_results").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setResults(data || []);

        const { data: visitData, error: visitError } = await supabase.from("quiz_visits").select("*").order("created_at", { ascending: false });
        if (visitError) throw visitError;
        setVisits(visitData || []);
      } else {
        setResults(JSON.parse(localStorage.getItem("quiz_results") || "[]"));
        setVisits(JSON.parse(localStorage.getItem("quiz_visits") || "[]"));
      }
    } catch (err) {
      console.error(err);
      setError("Could not load results. Check Supabase settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) {
      void loadAdminData();
    }
  }, [unlocked]);

  const restart = () => {
    window.location.hash = "";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <AppHeader styles={styles} onReset={restart} isMobile={isMobile} />

        {!unlocked ? (
          <main style={styles.nameCard}>
            <Lock size={42} color={BRAND.gold} />
            <h1 style={styles.heroTitle}>Owner Results</h1>
            <p style={styles.heroText}>Enter admin password to view all scores.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={styles.nameInput}
            />
            <button onClick={() => setUnlocked(password === ADMIN_PASSWORD)} style={styles.mainButton}>
              Open results
            </button>
            {password && password !== ADMIN_PASSWORD && <p style={{ color: BRAND.red, fontWeight: 800 }}>Wrong password</p>}
          </main>
        ) : (
          <main style={styles.finishCard}>
            <section style={styles.quizTop}>
              <div>
                <div style={styles.goldLabel}>ADMIN PANEL</div>
                <h1 style={{ ...styles.heroTitle, margin: "8px 0" }}>Quiz Results</h1>
              </div>
              <button onClick={loadAdminData} style={styles.mainButtonSmall}>
                <RefreshCw size={16} /> Refresh
              </button>
            </section>
            {error && <p style={{ color: BRAND.red, padding: 20, fontWeight: 800 }}>{error}</p>}
            <section style={styles.adminStats}>
              <div style={styles.statBox}><strong>{visits.length}</strong><span>Total visits</span></div>
              <div style={styles.statBox}><strong>{results.length}</strong><span>Completed quizzes</span></div>
              <div style={styles.statBox}><strong>{getTodayCount(visits)}</strong><span>Visits today</span></div>
              <div style={styles.statBox}><strong>{getYesterdayCount(visits)}</strong><span>Yesterday</span></div>
            </section>
            {loading ? (
              <p style={{ padding: 20 }}>Loading...</p>
            ) : (
              <section style={styles.answerList}>
                {results.length === 0 && <p style={styles.heroText}>No results yet.</p>}
                {results.map((r, i) => (
                  <div key={r.id || i} style={styles.answerRow}>
                    <div>
                      <div style={styles.answerQuestion}>{r.nickname || "Anonymous"} — €{Number(r.cash || 0).toLocaleString()}</div>
                      <div style={styles.answerMeta}>{r.score}/{r.total_questions} correct · {r.created_at ? new Date(r.created_at).toLocaleString() : "local result"}</div>
                    </div>
                    <Trophy size={24} color={BRAND.gold} />
                  </div>
                ))}
              </section>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

function getTodayCount(items) {
  const today = new Date().toDateString();
  return items.filter((item) => item.created_at && new Date(item.created_at).toDateString() === today).length;
}

function getYesterdayCount(items) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();
  return items.filter((item) => item.created_at && new Date(item.created_at).toDateString() === yesterdayString).length;
}
