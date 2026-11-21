import { useState } from 'react';
import { Award, CheckCircle2, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AWARENESS_QUIZ_QUESTIONS, getQuizRankLabel } from '../data/awarenessQuiz';

export { getQuizRankLabel };

interface ScamAwarenessQuizProps {
  onQuizComplete: (score: number) => void;
}

export function ScamAwarenessQuiz({ onQuizComplete }: ScamAwarenessQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'genuine' | 'scam' | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const questions = AWARENESS_QUIZ_QUESTIONS;
  const currentQuestion = questions[currentIndex];
  const progressPct = isFinished
    ? 100
    : Math.round(((currentIndex + (selectedAnswer ? 1 : 0)) / questions.length) * 100);

  const handleSelectOption = (choice: 'genuine' | 'scam') => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choice);
    if (choice === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 10);
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
      onQuizComplete(score);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setCorrectCount(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const rankInfo = getQuizRankLabel(score);
    return (
      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-6 sm:p-8 max-w-2xl mx-auto text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/70 flex items-center justify-center mx-auto">
          <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-[#A7B4C7]">Quiz Completed</p>
          <h2 className="mt-1 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC]">
            {score} / 100
          </h2>
          <p className={`mt-1 text-lg font-bold ${rankInfo.colorClass}`}>{rankInfo.rank}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-[#A7B4C7] max-w-md mx-auto leading-relaxed">
            {rankInfo.description}
          </p>
        </div>

        <div className="py-3 px-4 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] text-xs font-mono tabular-nums text-slate-700 dark:text-[#E2E8F0] inline-block">
          Correct Answers: {correctCount} of {questions.length} · 10 pts per question
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left text-[11px] pt-2">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
            <div className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">0–30</div>
            <div className="text-slate-600 dark:text-[#A7B4C7]">Beginner</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
            <div className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">31–60</div>
            <div className="text-slate-600 dark:text-[#A7B4C7]">Learning</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
            <div className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">61–80</div>
            <div className="text-slate-600 dark:text-[#A7B4C7]">Scam Aware</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
            <div className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">81–100</div>
            <div className="text-slate-600 dark:text-[#A7B4C7]">Scam Detective</div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleRetake}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Retake Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedAnswer !== null && selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 space-y-5">
        {/* Header & progress */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                Test Your Scam Awareness
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#A7B4C7]">
                Can you identify a fraudulent message before it tricks you?
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums font-semibold text-slate-700 dark:text-[#E2E8F0]">
              Question {currentIndex + 1} of {questions.length} · Score: {score}
            </div>
          </div>

          <div
            className="w-full h-2 bg-slate-100 dark:bg-[#0B1220] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Quiz progress"
          >
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.max(5, progressPct)}%` }}
            />
          </div>
        </div>

        {/* Message card */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500 dark:text-[#A7B4C7]">
            Channel:{' '}
            <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">
              {currentQuestion.channel}
            </span>
          </div>
          <blockquote className="p-4 rounded-lg bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#273449] text-sm font-mono text-slate-900 dark:text-[#F8FAFC] leading-relaxed">
            &ldquo;{currentQuestion.message}&rdquo;
          </blockquote>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={selectedAnswer !== null}
            onClick={() => handleSelectOption('genuine')}
            className={`px-4 py-3 text-sm font-semibold rounded-lg border transition-colors flex items-center justify-center gap-2 ${
              selectedAnswer === null
                ? 'bg-white dark:bg-[#111827] border-slate-300 dark:border-[#273449] text-slate-800 dark:text-[#F8FAFC] hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30'
                : selectedAnswer === 'genuine'
                  ? currentQuestion.correctAnswer === 'genuine'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
                  : currentQuestion.correctAnswer === 'genuine'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-[#0B1220] border-slate-200 dark:border-[#273449] text-slate-400 dark:text-[#64748B]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Genuine</span>
          </button>

          <button
            type="button"
            disabled={selectedAnswer !== null}
            onClick={() => handleSelectOption('scam')}
            className={`px-4 py-3 text-sm font-semibold rounded-lg border transition-colors flex items-center justify-center gap-2 ${
              selectedAnswer === null
                ? 'bg-white dark:bg-[#111827] border-slate-300 dark:border-[#273449] text-slate-800 dark:text-[#F8FAFC] hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30'
                : selectedAnswer === 'scam'
                  ? currentQuestion.correctAnswer === 'scam'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
                  : currentQuestion.correctAnswer === 'scam'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-[#0B1220] border-slate-200 dark:border-[#273449] text-slate-400 dark:text-[#64748B]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            <span>Potential Scam</span>
          </button>
        </div>

        {/* Immediate feedback revealed only AFTER answering */}
        {selectedAnswer !== null && (
          <div
            aria-live="polite"
            className="pt-4 border-t border-slate-200 dark:border-[#273449] space-y-4"
          >
            <div
              className={`px-4 py-3 rounded-lg border text-sm ${
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/70 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/70 text-red-900 dark:text-red-200'
              }`}
            >
              <div className="font-semibold">
                {isCorrect ? 'Correct (+10 pts)' : 'Incorrect'} · Answer:{' '}
                {currentQuestion.correctAnswer === 'scam' ? 'Potential Scam' : 'Genuine'} (
                {currentQuestion.category})
              </div>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{currentQuestion.explanation}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] mb-1.5">
                  {currentQuestion.correctAnswer === 'scam'
                    ? 'Detected Red Flags'
                    : 'Legitimate Signals'}
                </h3>
                <ul className="space-y-1 text-slate-600 dark:text-[#A7B4C7] list-disc list-inside">
                  {currentQuestion.indicators.map((ind, idx) => (
                    <li key={idx}>{ind}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] mb-1.5">
                  Safety Recommendation
                </h3>
                <p className="text-slate-600 dark:text-[#A7B4C7] leading-relaxed flex items-start gap-1.5">
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{currentQuestion.safetyRecommendation}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {currentIndex + 1 < questions.length ? 'Next Question' : 'View Final Score'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
