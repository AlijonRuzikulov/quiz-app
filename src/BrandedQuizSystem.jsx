import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Brain,
  Calculator,
  Timer,
  ArrowRight,
} from "lucide-react";

const BRAND = {
  name: "Millionaire Mind",
  subtitle: "Business Simulation Training",
  navy: "#2E4E7B",
  gold: "#F3A40B",
  cream: "#F6F3EB",
  sky: "#9CCAEE",
  taupe: "#8B7E74",
  red: "#F15D65",
  green: "#00BF63",
  deep: "#1A2332",
};

const quizBank = [
  {
    id: 1,
    type: "business",
    difficulty: "easy",
    question: "Your logistics startup has monthly revenue of €6,000 and monthly costs of €8,000. What is your cash flow?",
    options: ["+€2,000", "-€2,000", "€14,000", "€48,000"],
    correct: "-€2,000",
  },
  {
    id: 2,
    type: "business",
    difficulty: "easy",
    question: "You have €15,000 in the bank and burn €3,000 per month. How many months until you run out?",
    options: ["3 months", "4 months", "5 months", "6 months"],
    correct: "5 months",
  },
  {
    id: 3,
    type: "business",
    difficulty: "easy",
    question: "You invest €8,000 in a delivery van. It generates €2,000 profit per year. What is your ROI?",
    options: ["4%", "25%", "40%", "250%"],
    correct: "25%",
  },
  {
    id: 4,
    type: "business",
    difficulty: "medium",
    question: "A new competitor enters your market offering delivery 20% cheaper than you. Your best response is to:",
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
    question: "Before spending €10,000 on a new fleet vehicle you should:",
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
    question: "In a 5-person startup, who is responsible for flagging that the company is 3 weeks from bankruptcy?",
    options: ["CEO", "CFO", "COO", "Everyone equally"],
    correct: "CFO",
  },
  {
    id: 8,
    type: "business",
    difficulty: "hard",
    question: "You have three urgent situations: a key client complaint, payroll due today, investor meeting tomorrow. You handle first:",
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
    question: "A partner offers you a deal - they bring the clients, you do the work, 70/30 split in their favor. You:",
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
    question: "Which of these has been a real mode of transport in Latvian history?",
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

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function BrandedQuizSystem() {
  const [timeLeft, setTimeLeft] = useState(20);
  const getQuestionTime = (question) => (question?.correct === null ? 90 : 20);
  const [started, setStarted] = useState(false);
  // Fixed quiz order. No category filtering, because this quiz must run exactly as written.
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => quizBank, []);
  const scoredQuestionsCount = questions.filter((q) => q.correct !== null).length;

  const active = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;
  const scorePercent = Math.round((score / scoredQuestionsCount) * 100);
  const cashEarned = score * 1000;

  React.useEffect(() => {
    if (!started || finished || !active) return;
    setTimeLeft(getQuestionTime(active));
  }, [current, started, finished, active?.id]);

  React.useEffect(() => {
    if (!started || finished) return;
    if (selectedAnswer && active?.correct !== null) return;

    if (timeLeft === 0) {
      nextQuestion();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, started, finished, selectedAnswer, active?.id]);

  const handleAnswer = (option) => {
    if (selectedAnswer) return;

    const isDiscussion = active.correct === null;
    const isCorrect = !isDiscussion && option === active.correct;

    setSelectedAnswer(option);
    if (isCorrect) setScore((s) => s + 1);

    setAnswers((prev) => [
      ...prev,
      {
        question: active.question,
        selected: option,
        correct: isDiscussion ? "No right answer" : active.correct,
        isCorrect,
        isDiscussion,
      },
    ]);
  };

  const nextQuestion = () => {
    setTimeLeft(20);
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelectedAnswer(null);
    }
  };

  const restart = () => {
    setTimeLeft(20);
    setStarted(false);
    setCurrent(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setFinished(false);
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
            <Brain size={24} color={BRAND.navy} />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!started && !finished && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.card}
            >
              <div style={styles.startGrid}>
                <div style={styles.startLeft}>
                  <div style={styles.goldLabel}>START QUIZ</div>
                  <h1 style={styles.heroTitle}>Millionaire Mind Warm-Up Quiz</h1>
                  <p style={styles.heroText}>TSI Edition</p>

                  <div style={styles.infoGrid}>
                    <div style={styles.infoButton}>11 Questions</div>
                    <div style={styles.infoButton}>20s Each</div>
                    <div style={styles.infoButton}>€1,000 / Correct</div>
                  </div>

                  <button onClick={() => setStarted(true)} style={styles.mainButton}>
                    Start now <ArrowRight size={20} />
                  </button>
                </div>

                <div style={styles.previewPanel}>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={styles.previewCard}
                  >
                    <div style={styles.previewIcons}>
                      <Calculator size={34} color={BRAND.cream} />
                      <Brain size={34} color={BRAND.cream} />
                    </div>
                    <div style={styles.previewQuestion}>Are you ready?</div>
                    <div style={styles.previewSubtext}>Burn your brain.</div>
                    <div style={styles.previewOptions}>
                      {["Think", "Decide", "Win"].map((x) => (
                        <div key={x} style={styles.previewOption}>{x}</div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {started && !finished && active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              style={styles.card}
            >
              <div style={styles.questionTop}>
                <div style={styles.timerBox}>⏱ {timeLeft}s</div>
                <div>
                  <div style={styles.goldLabel}>QUESTION {current + 1} OF {questions.length}</div>
                  <div style={styles.meta}>{active.type} · {active.difficulty}</div>
                </div>
                <div style={styles.scoreBadge}>Cash: €{cashEarned.toLocaleString()}</div>
              </div>

              <div style={styles.progressOuter}>
                <motion.div style={styles.progressInner} animate={{ width: `${progress}%` }} />
              </div>

              <div style={styles.questionBox}>
                <h2 style={styles.questionText}>{active.question}</h2>
              </div>

              <div style={styles.optionsGrid}>
                {active.options.map((option) => {
                  const isChosen = selectedAnswer === option;
                  const isCorrect = option === active.correct;
                  const isDiscussion = active.correct === null;
                  const showCorrect = selectedAnswer && !isDiscussion && isCorrect;
                  const showWrong = selectedAnswer && !isDiscussion && isChosen && !isCorrect;
                  const showDiscussion = selectedAnswer && isDiscussion && isChosen;

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      style={{
                        ...styles.answerButton,
                        borderColor: showCorrect ? BRAND.green : showWrong ? BRAND.red : BRAND.sky,
                        background: showCorrect ? "#E9FFF4" : showWrong ? "#FFF0F1" : showDiscussion ? BRAND.sky : BRAND.cream,
                        color: showCorrect ? BRAND.green : showWrong ? BRAND.red : BRAND.navy,
                      }}
                    >
                      {option}
                      {showCorrect && <CheckCircle2 size={24} />}
                      {showWrong && <XCircle size={24} />}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.feedbackBox}>
                  <div style={{ fontWeight: 900, color: selectedAnswer === active.correct ? BRAND.green : BRAND.red }}>
                    {active.correct === null ? "Discussion question" : selectedAnswer === active.correct ? "Correct answer" : "Incorrect answer"}
                  </div>
                  <p style={styles.feedbackText}>{active.correct === null ? "Discuss as a team. You have 90 seconds." : active.explanation}</p>
                  <button onClick={nextQuestion} style={styles.mainButtonSmall}>
                    {current + 1 >= questions.length ? "Show final score" : "Next question"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {finished && (
            <motion.div
              key="finish"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={styles.card}
            >
              <div style={styles.finishCenter}>
                <div style={styles.trophyBox}>
                  <Trophy size={44} color={BRAND.navy} />
                </div>
                <div style={styles.goldLabel}>FINAL SCORE</div>
                <h2 style={styles.finalScore}>€{cashEarned.toLocaleString()}</h2>
                <p style={styles.heroText}>{score} correct answers from {scoredQuestionsCount} scored questions · {scorePercent}%</p>

                <div style={styles.progressOuterBig}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${scorePercent}%` }} style={styles.progressInner} />
                </div>

                <button onClick={restart} style={styles.mainButton}>
                  <RotateCcw size={20} /> Restart quiz
                </button>
              </div>

              <div style={styles.answerList}>
                {answers.map((item, index) => (
                  <div key={index} style={styles.answerRow}>
                    <div>
                      <div style={styles.answerQuestion}>{index + 1}. {item.question}</div>
                      <div style={styles.answerMeta}>{item.isDiscussion ? `Team discussion answer: ${item.selected}` : `Your answer: ${item.selected} · Correct answer: ${item.correct}`}</div>
                    </div>
                    {item.isDiscussion ? (
                      <Brain size={26} color={BRAND.gold} />
                    ) : item.isCorrect ? (
                      <CheckCircle2 size={26} color={BRAND.green} />
                    ) : (
                      <XCircle size={26} color={BRAND.red} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: BRAND.cream,
    padding: "28px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  container: { maxWidth: "1100px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    background: "#FFFFFF",
    border: `1px solid ${BRAND.sky}`,
    borderRadius: "22px",
    padding: "14px 18px",
    marginBottom: "24px",
    boxShadow: "0 10px 28px rgba(26,35,50,0.10)",
  },
  brandWrap: { display: "flex", alignItems: "center", gap: "18px", cursor: "pointer" },
  logoBox: {
    width: "48px",
    height: "48px",
    borderRadius: "18px",
    background: BRAND.gold,
    display: "grid",
    placeItems: "center",
  },
  logoBoxSmall: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: BRAND.gold,
    display: "grid",
    placeItems: "center",
  },
  logoImage: {
    width: "88px",
    height: "58px",
    objectFit: "contain",
  },
  subtitle: { color: BRAND.taupe, fontSize: "14px", fontWeight: 700 },
  brandTitle: { color: BRAND.navy, fontSize: "26px", fontWeight: 1000 },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: BRAND.navy,
    background: BRAND.sky,
    borderRadius: "999px",
    padding: "10px 16px",
    fontWeight: 800,
  },
  card: {
    background: BRAND.cream,
    border: `1px solid ${BRAND.sky}`,
    borderRadius: "34px",
    overflow: "hidden",
    boxShadow: "0 24px 60px rgba(26,35,50,0.16)",
  },
  startGrid: { display: "grid", gridTemplateColumns: "1fr 1fr" },
  startLeft: { padding: "48px" },
  goldLabel: { color: BRAND.gold, fontSize: "13px", fontWeight: 1000, letterSpacing: "1.5px" },
  heroTitle: { color: BRAND.navy, fontSize: "46px", lineHeight: 1.05, margin: "14px 0" },
  heroText: { color: BRAND.taupe, fontSize: "18px", lineHeight: 1.55 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", margin: "34px 0" },
  infoButton: {
    border: `2px solid ${BRAND.sky}`,
    borderRadius: "20px",
    padding: "16px",
    color: BRAND.navy,
    background: BRAND.cream,
    fontWeight: 900,
    textAlign: "center",
  },
  mainButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    border: "none",
    borderRadius: "20px",
    padding: "16px 28px",
    background: BRAND.gold,
    color: BRAND.navy,
    fontWeight: 1000,
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(243,164,11,0.25)",
  },
  mainButtonSmall: {
    border: "none",
    borderRadius: "18px",
    padding: "13px 22px",
    background: BRAND.gold,
    color: BRAND.navy,
    fontWeight: 1000,
    cursor: "pointer",
    marginTop: "10px",
  },
  previewPanel: {
    minHeight: "430px",
    background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.deep})`,
    display: "grid",
    placeItems: "center",
    padding: "36px",
  },
  previewCard: {
    width: "100%",
    borderRadius: "32px",
    background: "rgba(246,243,235,0.12)",
    padding: "36px",
    textAlign: "center",
    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
  },
  previewIcons: { display: "flex", justifyContent: "center", gap: "16px", marginBottom: "22px" },
  previewQuestion: { color: BRAND.cream, fontSize: "42px", fontWeight: 1000 },
  previewSubtext: { color: BRAND.gold, fontSize: "28px", fontWeight: 900, marginTop: "12px" },
  previewOptions: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "28px" },
  previewOption: { background: "rgba(246,243,235,0.18)", color: BRAND.cream, borderRadius: "18px", padding: "14px", fontSize: "22px", fontWeight: 1000 },
  questionTop: { display: "flex", justifyContent: "space-between", padding: "38px 42px 0", gap: "16px" },
  meta: { color: BRAND.taupe, marginTop: "6px", textTransform: "capitalize", fontWeight: 700 },
  scoreBadge: { background: BRAND.sky, color: BRAND.navy, borderRadius: "999px", padding: "10px 18px", fontWeight: 1000, height: "fit-content" },
  progressOuter: { height: "12px", background: "rgba(156,202,238,0.35)", borderRadius: "999px", overflow: "hidden", margin: "28px 42px" },
  progressOuterBig: { height: "16px", background: "rgba(156,202,238,0.35)", borderRadius: "999px", overflow: "hidden", margin: "28px 0" },
  progressInner: { height: "100%", background: BRAND.gold, borderRadius: "999px" },
  questionBox: { margin: "0 42px 34px", padding: "42px", borderRadius: "30px", background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.deep})`, textAlign: "center" },
  questionText: { color: BRAND.cream, fontSize: "44px", lineHeight: 1.15, margin: 0 },
  optionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", padding: "0 42px 38px" },
  answerButton: { minHeight: "82px", border: "2px solid", borderRadius: "26px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "22px", fontWeight: 1000, cursor: "pointer" },
  feedbackBox: { margin: "0 42px 42px", padding: "22px", borderRadius: "26px", background: BRAND.cream, border: `1px solid ${BRAND.sky}` },
  feedbackText: { color: BRAND.taupe, fontSize: "16px", lineHeight: 1.5 },
  finishCenter: { maxWidth: "680px", margin: "0 auto", textAlign: "center", padding: "48px 32px 20px" },
  trophyBox: { width: "86px", height: "86px", borderRadius: "28px", background: BRAND.gold, display: "grid", placeItems: "center", margin: "0 auto 18px" },
  finalScore: { color: BRAND.navy, fontSize: "58px", margin: "10px 0" },
  answerList: { padding: "10px 42px 42px", display: "grid", gap: "12px" },
  answerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "18px", border: `1px solid ${BRAND.sky}`, borderRadius: "20px", background: BRAND.cream },
  answerQuestion: { color: BRAND.navy, fontWeight: 900 },
  answerMeta: { color: BRAND.taupe, marginTop: "4px", fontSize: "14px" },
};
