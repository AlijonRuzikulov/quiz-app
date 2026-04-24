import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  RotateCcw,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";

const BRAND = {
  name: "Millionaire Mind",
  subtitle: "TSI Edition",
  navy: "#2E4E7B",
  gold: "#F3A40B",
  cream: "#F6F3EB",
  sky: "#9CCAEE",
  taupe: "#8B7E74",
  red: "#F15D65",
  green: "#00BF63",
  deep: "#1A2332",
  white: "#FFFFFF",
};

const quizBank = [
  {
    id: 1,
    type: "business",
    difficulty: "easy",
    question:
      "Your logistics startup has monthly revenue of €6,000 and monthly costs of €8,000. What is your cash flow?",
    options: ["+€2,000", "-€2,000", "€14,000", "€48,000"],
    correct: "-€2,000",
  },
  {
    id: 2,
    type: "business",
    difficulty: "easy",
    question:
      "You have €15,000 in the bank and burn €3,000 per month. How many months until you run out?",
    options: ["3 months", "4 months", "5 months", "6 months"],
    correct: "5 months",
  },
  {
    id: 3,
    type: "business",
    difficulty: "easy",
    question:
      "You invest €8,000 in a delivery van. It generates €2,000 profit per year. What is your ROI?",
    options: ["4%", "25%", "40%", "250%"],
    correct: "25%",
  },
  {
    id: 4,
    type: "business",
    difficulty: "medium",
    question:
      "A new competitor enters your market offering delivery 20% cheaper than you. Your best response is to:",
    options: [
      "Match their price immediately",
      "Find what they cannot offer and lead with that",
      "Increase your marketing budget",
      "Exit the market",
    ],
    correct: "Find what they cannot offer and lead with that",
  },
  {
    id: 5,
    type: "business",
    difficulty: "medium",
    question: "Recommended financial emergency reserve for a small business is:",
    options: [
      "1 month of expenses",
      "2 months of expenses",
      "3-6 months of expenses",
      "12 months of expenses",
    ],
    correct: "3-6 months of expenses",
  },
  {
    id: 6,
    type: "business",
    difficulty: "medium",
    question:
      "Before spending €10,000 on a new fleet vehicle you should:",
    options: [
      "Check if competitors have one",
      "Confirm it generates more than it costs",
      "Ask your team what they think",
      "Wait until next quarter",
    ],
    correct: "Confirm it generates more than it costs",
  },
  {
    id: 7,
    type: "business",
    difficulty: "medium",
    question:
      "In a 5-person startup, who is responsible for flagging that the company is 3 weeks from bankruptcy?",
    options: ["CEO", "CFO", "COO", "Everyone equally"],
    correct: "CFO",
  },
  {
    id: 8,
    type: "business",
    difficulty: "hard",
    question:
      "You have three urgent situations: a key client complaint, payroll due today, investor meeting tomorrow. You handle first:",
    options: [
      "Investor meeting - future money",
      "Client complaint - reputation",
      "Payroll - your team gets paid first",
      "All three simultaneously",
    ],
    correct: "Payroll - your team gets paid first",
  },
  {
    id: 9,
    type: "business",
    difficulty: "hard",
    question:
      "A partner offers you a deal - they bring the clients, you do the work, 70/30 split in their favor. You:",
    options: [
      "Accept - clients are hard to find",
      "Reject - 70/30 is never acceptable",
      "Negotiate - counter with 60/40 and add a volume clause",
      "Ask for time to think and never respond",
    ],
    correct: "Negotiate - counter with 60/40 and add a volume clause",
  },
  {
    id: 10,
    type: "bonus",
    difficulty: "fun",
    question: "Which of these is official public transport in Riga?",
    options: ["AirBaltic", "Vivi", "Rīgas satiksme", "Bolt"],
    correct: "Rīgas satiksme",
  },
  {
    id: 11,
    type: "bonus",
    difficulty: "fun",
    question:
      "Which of these has been a real mode of transport in Latvian history?",
    options: [
      "Submarine taxi on the Daugava",
      "Dog sled postal service",
      "Rotating cable car over Old Riga",
      "Steam-powered passenger sleigh",
      "Horse-drawn tram",
    ],
    correct: "Horse-drawn tram",
  },
];

function useScreenSize() {
  const [width, setWidth] = useState(typeof window === "undefined" ? 1024 : window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    width,
    isMobile: width < 640,
    isTablet: width >= 640 && width < 900,
  };
}

export default function BrandedQuizSystem() {
  const { isMobile, isTablet } = useScreenSize();
  const styles = useMemo(() => createStyles(isMobile, isTablet), [isMobile, isTablet]);

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  const questions = quizBank;
  const active = questions[current];
  const cashEarned = score * 1000;
  const progress = ((current + 1) / questions.length) * 100;
  const scorePercent = Math.round((score / questions.length) * 100);

  useEffect(() => {
    if (!started || finished || selectedAnswer) return;

    if (timeLeft <= 0) {
      recordAnswer(null);
      return;
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, started, finished, selectedAnswer]);

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setFinished(false);
    setTimeLeft(20);
  };

  const recordAnswer = (option) => {
    if (selectedAnswer) return;

    const isCorrect = option === active.correct;
    setSelectedAnswer(option || "Time out");
    if (isCorrect) setScore((s) => s + 1);

    setAnswers((prev) => [
      ...prev,
      {
        question: active.question,
        selected: option || "Time out",
        correct: active.correct,
        isCorrect,
      },
    ]);
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelectedAnswer(null);
      setTimeLeft(20);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.brandWrap} onClick={restart}>
            <img src="/logo.png" alt="Millionaire Mind Logo" style={styles.logoImage} />
            <div style={styles.brandTitle}>{BRAND.name}</div>
          </div>

          <div style={styles.logoBoxSmall}>
            <Brain size={isMobile ? 19 : 24} color={BRAND.navy} />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!started && !finished && (
            <motion.main
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.startCard}
            >
              <section style={styles.startLeft}>
                <div style={styles.goldLabel}>START QUIZ</div>
                <h1 style={styles.heroTitle}>Test Your Business Instincts</h1>
                <p style={styles.heroText}>Millionaire Mind — TSI Edition</p>

                <div style={styles.infoGrid}>
                  <div style={styles.infoCard}>
                    <strong>11</strong>
                    <span>Questions</span>
                  </div>
                  <div style={styles.infoCard}>
                    <strong>20s</strong>
                    <span>Each</span>
                  </div>
                  <div style={styles.infoCard}>
                    <strong>€1,000</strong>
                    <span>/ Correct</span>
                  </div>
                </div>

                <button onClick={() => setStarted(true)} style={styles.mainButton}>
                  Start the simulation <ArrowRight size={isMobile ? 18 : 22} />
                </button>

                <p style={styles.microText}>Think fast. Decide faster.</p>
              </section>

              <section style={styles.startRight}>
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={styles.readyCard}
                >
                  <div style={styles.readyText}>Are you ready?</div>
                  <div style={styles.burnText}>Burn your brain.</div>
                  <div style={styles.brainCircle}>
                    <Brain size={isMobile ? 52 : 86} color={BRAND.gold} />
                  </div>
                </motion.div>
              </section>
            </motion.main>
          )}

          {started && !finished && active && (
            <motion.main
              key={active.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={styles.quizCard}
            >
              <section style={styles.quizTop}>
                <div>
                  <div style={styles.goldLabel}>QUESTION {current + 1} OF {questions.length}</div>
                  <div style={styles.meta}>{active.type} · {active.difficulty}</div>
                </div>
                <div style={styles.topBadges}>
                  <div style={styles.timerBadge}><Timer size={16} /> {timeLeft}s</div>
                  <div style={styles.scoreBadge}>€{cashEarned.toLocaleString()}</div>
                </div>
              </section>

              <div style={styles.progressOuter}>
                <div style={{ ...styles.progressInner, width: `${progress}%` }} />
              </div>

              <section style={styles.questionBox}>
                <h2 style={styles.questionText}>{active.question}</h2>
              </section>

              <section style={styles.optionsGrid}>
                {active.options.map((option, index) => {
                  const isChosen = selectedAnswer === option;
                  const isCorrect = option === active.correct;
                  const showCorrect = selectedAnswer && isCorrect;
                  const showWrong = selectedAnswer && isChosen && !isCorrect;

                  return (
                    <button
                      key={option}
                      onClick={() => recordAnswer(option)}
                      disabled={!!selectedAnswer}
                      style={{
                        ...styles.answerButton,
                        borderColor: showCorrect ? BRAND.green : showWrong ? BRAND.red : BRAND.sky,
                        background: showCorrect ? "#E9FFF4" : showWrong ? "#FFF0F1" : BRAND.cream,
                        color: showCorrect ? BRAND.green : showWrong ? BRAND.red : BRAND.navy,
                      }}
                    >
                      <span style={styles.answerLetter}>{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                      {showCorrect && <CheckCircle2 size={22} />}
                      {showWrong && <XCircle size={22} />}
                    </button>
                  );
                })}
              </section>

              {selectedAnswer && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={styles.feedbackBox}
                >
                  <strong style={{ color: selectedAnswer === active.correct ? BRAND.green : BRAND.red }}>
                    {selectedAnswer === active.correct ? "Correct answer" : selectedAnswer === "Time out" ? "Time is up" : "Incorrect answer"}
                  </strong>
                  <p style={styles.feedbackText}>Correct answer: {active.correct}</p>
                  <button onClick={nextQuestion} style={styles.mainButtonSmall}>
                    {current + 1 >= questions.length ? "Show final score" : "Next question"}
                  </button>
                </motion.section>
              )}
            </motion.main>
          )}

          {finished && (
            <motion.main
              key="finish"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={styles.finishCard}
            >
              <section style={styles.finishCenter}>
                <div style={styles.trophyBox}>
                  <Trophy size={isMobile ? 36 : 48} color={BRAND.navy} />
                </div>
                <div style={styles.goldLabel}>FINAL SCORE</div>
                <h2 style={styles.finalScore}>€{cashEarned.toLocaleString()}</h2>
                <p style={styles.heroText}>{score} correct answers from {questions.length} questions · {scorePercent}%</p>

                <div style={styles.progressOuterBig}>
                  <div style={{ ...styles.progressInner, width: `${scorePercent}%` }} />
                </div>

                <button onClick={restart} style={styles.mainButton}>
                  <RotateCcw size={20} /> Restart quiz
                </button>
              </section>

              <section style={styles.answerList}>
                {answers.map((item, index) => (
                  <div key={index} style={styles.answerRow}>
                    <div>
                      <div style={styles.answerQuestion}>{index + 1}. {item.question}</div>
                      <div style={styles.answerMeta}>Your answer: {item.selected} · Correct answer: {item.correct}</div>
                    </div>
                    {item.isCorrect ? (
                      <CheckCircle2 size={24} color={BRAND.green} />
                    ) : (
                      <XCircle size={24} color={BRAND.red} />
                    )}
                  </div>
                ))}
              </section>
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function createStyles(isMobile, isTablet) {
  const compact = isMobile || isTablet;

  return {
    page: {
      minHeight: "100vh",
      background: BRAND.cream,
      padding: isMobile ? "12px" : "28px",
      fontFamily: "Inter, Arial, sans-serif",
      overflowX: "hidden",
      boxSizing: "border-box",
    },
    container: {
      width: "100%",
      maxWidth: "1120px",
      margin: "0 auto",
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: isMobile ? "8px" : "16px",
      background: BRAND.white,
      border: `1px solid ${BRAND.sky}`,
      borderRadius: isMobile ? "18px" : "24px",
      padding: isMobile ? "10px 12px" : "14px 18px",
      marginBottom: isMobile ? "14px" : "24px",
      boxShadow: "0 12px 30px rgba(26,35,50,0.10)",
      boxSizing: "border-box",
    },
    brandWrap: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "10px" : "18px",
      cursor: "pointer",
      minWidth: 0,
    },
    logoImage: {
      width: isMobile ? "58px" : "88px",
      height: isMobile ? "44px" : "58px",
      objectFit: "contain",
      flexShrink: 0,
    },
    brandTitle: {
      color: BRAND.navy,
      fontSize: isMobile ? "22px" : "30px",
      fontWeight: 1000,
      lineHeight: 1.05,
      whiteSpace: isMobile ? "normal" : "nowrap",
    },
    logoBoxSmall: {
      width: isMobile ? "42px" : "52px",
      height: isMobile ? "42px" : "52px",
      borderRadius: isMobile ? "14px" : "18px",
      background: BRAND.gold,
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
    },
    startCard: {
      display: "grid",
      gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
      background: BRAND.cream,
      border: `1px solid ${BRAND.sky}`,
      borderRadius: isMobile ? "26px" : "34px",
      overflow: "hidden",
      boxShadow: "0 22px 55px rgba(26,35,50,0.14)",
    },
    startLeft: {
      padding: isMobile ? "32px 20px" : isTablet ? "40px" : "54px",
      textAlign: isMobile ? "center" : "left",
    },
    startRight: {
      minHeight: isMobile ? "240px" : "430px",
      background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.deep})`,
      display: "grid",
      placeItems: "center",
      padding: isMobile ? "24px" : "36px",
    },
    goldLabel: {
      color: BRAND.gold,
      fontSize: isMobile ? "12px" : "13px",
      fontWeight: 1000,
      letterSpacing: "1.6px",
    },
    heroTitle: {
      color: BRAND.navy,
      fontSize: isMobile ? "34px" : isTablet ? "42px" : "52px",
      lineHeight: 1.05,
      margin: isMobile ? "14px 0 10px" : "16px 0 12px",
      letterSpacing: "-1px",
    },
    heroText: {
      color: BRAND.taupe,
      fontSize: isMobile ? "16px" : "18px",
      lineHeight: 1.45,
      margin: 0,
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: isMobile ? "10px" : "14px",
      margin: isMobile ? "28px 0" : "36px 0",
    },
    infoCard: {
      border: `2px solid ${BRAND.sky}`,
      borderRadius: "22px",
      padding: isMobile ? "14px" : "18px 12px",
      color: BRAND.navy,
      background: BRAND.white,
      boxShadow: "0 10px 24px rgba(46,78,123,0.08)",
      textAlign: "center",
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      justifyContent: "center",
      alignItems: "center",
      gap: isMobile ? "8px" : "4px",
    },
    mainButton: {
      width: isMobile ? "100%" : "auto",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      border: "none",
      borderRadius: "22px",
      padding: isMobile ? "16px 20px" : "17px 30px",
      background: BRAND.gold,
      color: BRAND.navy,
      fontWeight: 1000,
      fontSize: isMobile ? "16px" : "17px",
      cursor: "pointer",
      boxShadow: "0 16px 34px rgba(243,164,11,0.28)",
    },
    microText: {
      marginTop: "18px",
      color: BRAND.taupe,
      fontWeight: 800,
      fontSize: isMobile ? "14px" : "15px",
    },
    readyCard: {
      width: "100%",
      maxWidth: "450px",
      borderRadius: "32px",
      textAlign: "center",
      color: BRAND.cream,
    },
    readyText: {
      fontSize: isMobile ? "32px" : "46px",
      fontWeight: 1000,
      lineHeight: 1.05,
    },
    burnText: {
      fontSize: isMobile ? "34px" : "48px",
      fontWeight: 1000,
      lineHeight: 1.05,
      color: BRAND.gold,
      marginTop: "8px",
    },
    brainCircle: {
      margin: isMobile ? "28px auto 0" : "44px auto 0",
      width: isMobile ? "110px" : "170px",
      height: isMobile ? "110px" : "170px",
      borderRadius: "50%",
      background: "rgba(246,243,235,0.08)",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 0 40px rgba(243,164,11,0.20)",
    },
    quizCard: {
      background: BRAND.cream,
      border: `1px solid ${BRAND.sky}`,
      borderRadius: isMobile ? "26px" : "34px",
      boxShadow: "0 22px 55px rgba(26,35,50,0.14)",
      overflow: "hidden",
    },
    quizTop: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      gap: "14px",
      padding: isMobile ? "24px 20px 0" : "36px 42px 0",
    },
    meta: {
      color: BRAND.taupe,
      marginTop: "6px",
      textTransform: "capitalize",
      fontWeight: 800,
    },
    topBadges: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    timerBadge: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: BRAND.gold,
      color: BRAND.navy,
      borderRadius: "999px",
      padding: "10px 15px",
      fontWeight: 1000,
      height: "fit-content",
    },
    scoreBadge: {
      background: BRAND.sky,
      color: BRAND.navy,
      borderRadius: "999px",
      padding: "10px 15px",
      fontWeight: 1000,
      height: "fit-content",
    },
    progressOuter: {
      height: "12px",
      background: "rgba(156,202,238,0.35)",
      borderRadius: "999px",
      overflow: "hidden",
      margin: isMobile ? "22px 20px" : "28px 42px",
    },
    progressOuterBig: {
      height: "16px",
      background: "rgba(156,202,238,0.35)",
      borderRadius: "999px",
      overflow: "hidden",
      margin: "26px 0",
    },
    progressInner: {
      height: "100%",
      background: BRAND.gold,
      borderRadius: "999px",
      transition: "width 300ms ease",
    },
    questionBox: {
      margin: isMobile ? "0 20px 22px" : "0 42px 34px",
      padding: isMobile ? "26px 18px" : "42px",
      borderRadius: isMobile ? "24px" : "30px",
      background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.deep})`,
      textAlign: "center",
    },
    questionText: {
      color: BRAND.cream,
      fontSize: isMobile ? "25px" : isTablet ? "34px" : "42px",
      lineHeight: 1.18,
      margin: 0,
      wordBreak: "normal",
    },
    optionsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
      gap: isMobile ? "12px" : "16px",
      padding: isMobile ? "0 20px 28px" : "0 42px 38px",
    },
    answerButton: {
      minHeight: isMobile ? "64px" : "82px",
      border: "2px solid",
      borderRadius: isMobile ? "18px" : "26px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: isMobile ? "12px" : "16px",
      fontSize: isMobile ? "17px" : "21px",
      fontWeight: 1000,
      cursor: "pointer",
      textAlign: "center",
      lineHeight: 1.2,
    },
    answerLetter: {
      opacity: 0.9,
      flexShrink: 0,
    },
    feedbackBox: {
      margin: isMobile ? "0 20px 28px" : "0 42px 42px",
      padding: isMobile ? "18px" : "22px",
      borderRadius: "24px",
      background: BRAND.white,
      border: `1px solid ${BRAND.sky}`,
      textAlign: isMobile ? "center" : "left",
    },
    feedbackText: {
      color: BRAND.taupe,
      fontSize: "15px",
      lineHeight: 1.45,
      margin: "8px 0 0",
    },
    mainButtonSmall: {
      width: isMobile ? "100%" : "auto",
      border: "none",
      borderRadius: "18px",
      padding: "13px 22px",
      background: BRAND.gold,
      color: BRAND.navy,
      fontWeight: 1000,
      cursor: "pointer",
      marginTop: "14px",
    },
    finishCard: {
      background: BRAND.cream,
      border: `1px solid ${BRAND.sky}`,
      borderRadius: isMobile ? "26px" : "34px",
      boxShadow: "0 22px 55px rgba(26,35,50,0.14)",
      overflow: "hidden",
    },
    finishCenter: {
      maxWidth: "720px",
      margin: "0 auto",
      textAlign: "center",
      padding: isMobile ? "34px 20px 20px" : "48px 32px 24px",
    },
    trophyBox: {
      width: isMobile ? "74px" : "90px",
      height: isMobile ? "74px" : "90px",
      borderRadius: "28px",
      background: BRAND.gold,
      display: "grid",
      placeItems: "center",
      margin: "0 auto 18px",
    },
    finalScore: {
      color: BRAND.navy,
      fontSize: isMobile ? "48px" : "64px",
      margin: "10px 0",
      lineHeight: 1,
    },
    answerList: {
      padding: isMobile ? "8px 20px 28px" : "10px 42px 42px",
      display: "grid",
      gap: "12px",
    },
    answerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "14px",
      padding: isMobile ? "14px" : "18px",
      border: `1px solid ${BRAND.sky}`,
      borderRadius: "20px",
      background: BRAND.white,
    },
    answerQuestion: {
      color: BRAND.navy,
      fontWeight: 900,
      fontSize: isMobile ? "14px" : "16px",
      lineHeight: 1.3,
    },
    answerMeta: {
      color: BRAND.taupe,
      marginTop: "5px",
      fontSize: isMobile ? "12px" : "14px",
      lineHeight: 1.35,
    },
  };
}
