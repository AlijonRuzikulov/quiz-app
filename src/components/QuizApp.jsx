import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, RefreshCw, Timer, Trophy, XCircle } from "lucide-react";
import { BRAND, useScreenSize, supabase } from "../config";
import { pollBank } from "../quizBank";
import AppHeader from "./AppHeader";
import { createStyles } from "../styleUtils";

const RESULT_LIMIT = 4;

export default function QuizApp() {
  const { isMobile, isTablet } = useScreenSize();
  const styles = useMemo(() => createStyles(isMobile, isTablet), [isMobile, isTablet]);

  const [nickname, setNickname] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [stage, setStage] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [visitError, setVisitError] = useState("");
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [showRecentFinishes, setShowRecentFinishes] = useState(false);

  const active = pollBank[current];
  const cashEarned = score * 1000;
  const scorePercent = Math.round((score / pollBank.length) * 100);
  const recentLeaderboard = results.slice(0, RESULT_LIMIT);

  const loadResults = useCallback(async () => {
    setLoadingResults(true);
    setResultsError("");

    try {
      if (supabase) {
        const { data, error } = await supabase.from("quiz_results").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setResults(data || []);
      } else {
        setResults(JSON.parse(localStorage.getItem("quiz_results") || "[]"));
      }
    } catch (error) {
      console.error("Results load error:", error);
      setResultsError("Could not load completed results.");
    } finally {
      setLoadingResults(false);
    }
  }, []);

  const saveResult = useCallback(async () => {
    // For polls, we don't save individual results, just track visits
    setSaveState("success");
  }, []);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  useEffect(() => {
    if (stage === "finish" && saveState === "idle") {
      void saveResult();
    }
  }, [saveResult, saveState, stage]);

  const recordAnswer = useCallback(
    (option) => {
      if (selectedAnswer || stage !== "quiz") return;
      const selected = option || "Time out";
      setSelectedAnswer(selected);
      setAnswers((prev) => [
        ...prev,
        {
          question_id: active.id,
          question: active.question,
          selected,
        },
      ]);
    },
    [active, selectedAnswer, stage],
  );

  const saveVisit = async () => {
    setVisitError("");
    const visit = {
      nickname: nickname.trim() || "Anonymous",
      device: window.innerWidth < 768 ? "mobile" : "desktop",
    };

    try {
      if (supabase) {
        const { error } = await supabase.from("quiz_visits").insert(visit);
        if (error) throw error;
      } else {
        const old = JSON.parse(localStorage.getItem("quiz_visits") || "[]");
        localStorage.setItem("quiz_visits", JSON.stringify([{ ...visit, created_at: new Date().toISOString() }, ...old]));
      }
    } catch (error) {
      console.error("Visit save error:", error);
      setVisitError("Could not save your visit.");
    }
  };

  const startQuiz = async () => {
    if (!nickname.trim()) return;
    setNameSubmitted(true);
    await saveVisit();
    setStage("quiz");
  };

  const nextQuestion = () => {
    if (current + 1 >= pollBank.length) {
      setStage("finish");
      return;
    }

    setCurrent((value) => value + 1);
    setSelectedAnswer(null);
  };

  const restart = () => {
    setNameSubmitted(false);
    setNickname("");
    setStage("intro");
    setCurrent(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setSaveState("idle");
    setSaveError("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <AppHeader styles={styles} onReset={restart} isMobile={isMobile} />

        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.main
              key="intro"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              style={styles.nameCard}
            >
              <div style={styles.goldLabel}>PLAYER PROFILE</div>
              <h1 style={styles.heroTitle}>Ready for the live poll session?</h1>
              <p style={styles.heroText}>Enter your name to join the voting and see real-time results.</p>
              {visitError && <p style={{ color: BRAND.red, fontWeight: 800 }}>{visitError}</p>}
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Example: Team Alpha"
                style={styles.nameInput}
                maxLength={40}
              />
              <button onClick={startQuiz} style={{ ...styles.mainButton, opacity: nickname.trim() ? 1 : 0.6 }} disabled={!nickname.trim()}>
                Continue <ArrowRight size={20} />
              </button>
              <div style={styles.infoGrid}>
                <div style={styles.infoCard}><strong>{pollBank.length}</strong><span>Polls</span></div>
                <div style={styles.infoCard}><strong>Live</strong><span>Voting</span></div>
                <div style={styles.infoCard}><strong>Instant</strong><span>Results</span></div>
              </div>

              {recentLeaderboard.length > 0 && (
                <section style={{ ...styles.answerList, marginTop: isMobile ? "16px" : "24px" }}>
                  <div style={styles.leaderHeader}>
                    <div>
                      <div style={styles.goldLabel}>RECENT FINISHES</div>
                      <h3 style={{ ...styles.heroTitle, margin: "8px 0 12px", fontSize: isMobile ? "20px" : "24px" }}>See what others scored</h3>
                    </div>
                  </div>
                  {recentLeaderboard.map((result, index) => (
                    <div key={result.id || index} style={styles.scoreRow}>
                      <div>
                        <div style={styles.answerQuestion}>{result.nickname || "Anonymous"}</div>
                        <div style={styles.answerMeta}>{result.score}/{result.total_questions} correct · €{Number(result.cash || 0).toLocaleString()}</div>
                      </div>
                      <div style={styles.resultTag}>{result.created_at ? new Date(result.created_at).toLocaleDateString() : "saved"}</div>
                    </div>
                  ))}
                </section>
              )}
            </motion.main>
          )}

          {stage === "quiz" && active && (
            <motion.main
              key={active.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              style={styles.quizCard}
            >
              <section style={styles.quizTop}>
                <div>
                  <div style={styles.goldLabel}>POLL {current + 1} OF {pollBank.length}</div>
                  <div style={styles.meta}>{nickname} · {active.type}</div>
                </div>
                <div style={styles.topBadges}>
                  <div style={styles.scoreBadge}>Poll {current + 1}</div>
                </div>
              </section>
              <div style={styles.progressOuter}><div style={{ ...styles.progressInner, width: `${((current + 1) / pollBank.length) * 100}%` }} /></div>
              <section style={styles.questionBox}>
                <h2 style={styles.questionText}>{active.question}</h2>
              </section>
              <section style={styles.optionsGrid}>
                {active.options.map((option, index) => {
                  const isChosen = selectedAnswer === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => recordAnswer(option)}
                      disabled={!!selectedAnswer}
                      style={{
                        ...styles.answerButton,
                        borderColor: isChosen ? BRAND.green : BRAND.sky,
                        background: isChosen ? "#E9FFF4" : BRAND.cream,
                        color: BRAND.navy,
                      }}
                    >
                      <span style={styles.answerLetter}>{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                      {isChosen && <CheckCircle2 size={22} />}
                    </button>
                  );
                })}
              </section>
              {selectedAnswer && (
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.feedbackBox}>
                  <strong style={{ color: BRAND.green }}>Thanks for voting!</strong>
                  <p style={styles.feedbackText}>Your vote is live. See how the group voted.</p>
                  <div style={{ marginTop: "20px" }}>
                    {active.options.map((option, index) => {
                      const voteCount = answers.filter(a => a.selected === option).length;
                      const percentage = answers.length ? Math.round((voteCount / answers.length) * 100) : 0;
                      return (
                        <div key={option} style={{ marginBottom: "10px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <span>{String.fromCharCode(65 + index)}. {option}</span>
                            <span>{percentage}% ({voteCount})</span>
                          </div>
                          <div style={{ width: "100%", height: "10px", background: "rgba(46,78,123,0.1)", borderRadius: "999px" }}>
                            <div style={{ width: `${percentage}%`, height: "100%", background: BRAND.gold, borderRadius: "999px" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={nextQuestion} style={styles.mainButtonSmall}>
                    {current + 1 >= pollBank.length ? "Finish session" : "Next poll"}
                  </button>
                </motion.section>
              )}
            </motion.main>
          )}

          {stage === "finish" && (
            <motion.main
              key="finish"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={styles.finishCard}
            >
              <section style={styles.finishCenter}>
                <div style={styles.trophyBox}><Trophy size={isMobile ? 36 : 48} color={BRAND.navy} /></div>
                <div style={styles.goldLabel}>SESSION COMPLETE</div>
                <h2 style={styles.finalScore}>Thanks for participating!</h2>
                <p style={styles.heroText}>{nickname} completed {pollBank.length} polls. Review the group answers below.</p>
                <section style={styles.answerList}>
                  <div style={styles.leaderHeader}>
                    <div>
                      <div style={styles.goldLabel}>POLL RESULTS</div>
                      <h3 style={{ ...styles.heroTitle, margin: "8px 0 12px", fontSize: isMobile ? "22px" : "26px" }}>How the group voted</h3>
                    </div>
                  </div>
                  {pollBank.map((poll, index) => {
                    const pollAnswers = answers.filter(a => a.question_id === poll.id);
                    const topOption = poll.options.reduce((best, option) =>
                      pollAnswers.filter(a => a.selected === option).length > pollAnswers.filter(a => a.selected === best).length ? option : best,
                    poll.options[0]);
                    return (
                      <div key={poll.id} style={styles.scoreRow}>
                        <div>
                          <div style={styles.answerQuestion}>{poll.question}</div>
                          <div style={styles.answerMeta}>Top choice: {topOption} ({pollAnswers.filter(a => a.selected === topOption).length} votes)</div>
                        </div>
                        <div style={styles.resultTag}>Poll {index + 1}</div>
                      </div>
                    );
                  })}
                </section>
                {!showRecentFinishes && (
                  <button onClick={() => setShowRecentFinishes(true)} style={styles.mainButtonSmall}>
                    See what others scored
                  </button>
                )}
                {showRecentFinishes && (
                  <section style={styles.answerList}>
                    <div style={styles.leaderHeader}>
                      <div>
                        <div style={styles.goldLabel}>RECENT FINISHES</div>
                        <h3 style={{ ...styles.heroTitle, margin: "8px 0 12px", fontSize: isMobile ? "22px" : "26px" }}>See what others scored</h3>
                      </div>
                      <button onClick={loadResults} style={styles.mainButtonSmall}>
                        <RefreshCw size={16} /> Refresh
                      </button>
                    </div>
                    {resultsError && <p style={{ color: BRAND.red, padding: 12, fontWeight: 800 }}>{resultsError}</p>}
                    {loadingResults ? (
                      <p style={styles.heroText}>Loading latest results...</p>
                    ) : results.length === 0 ? (
                      <p style={styles.heroText}>No completed results yet.</p>
                    ) : (
                      recentLeaderboard.map((result, index) => (
                        <div key={result.id || index} style={styles.scoreRow}>
                          <div>
                            <div style={styles.answerQuestion}>{result.nickname || "Anonymous"}</div>
                            <div style={styles.answerMeta}>{result.score}/{result.total_questions} correct · €{Number(result.cash || 0).toLocaleString()}</div>
                          </div>
                          <div style={styles.resultTag}>{result.created_at ? new Date(result.created_at).toLocaleDateString() : "saved"}</div>
                        </div>
                      ))
                    )}
                  </section>
                )}
                <button onClick={restart} style={styles.mainButton}><RefreshCw size={20} /> Start new session</button>
              </section>
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
