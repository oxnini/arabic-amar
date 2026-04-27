interface ExerciseFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  transliteration: string;
  english: string;
  onNext: () => void;
}

export function ExerciseFeedback({
  isCorrect,
  correctAnswer,
  transliteration,
  english,
  onNext,
}: ExerciseFeedbackProps) {
  return (
    <div
      className={`mt-4 rounded-lg p-4 ${
        isCorrect
          ? "border border-green-200 bg-green-50"
          : "border border-red-200 bg-red-50"
      }`}
    >
      <p className={`font-semibold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
        {isCorrect ? "Correct!" : "Incorrect"}
      </p>
      {!isCorrect && (
        <div className="mt-2">
          <p className="text-sm text-red-700">The correct answer is:</p>
          <p dir="rtl" lang="ar" className="font-arabic mt-1 text-xl text-stone-900">{correctAnswer}</p>
          <p className="text-sm text-amber-700">{transliteration}</p>
          <p className="text-sm text-stone-500">{english}</p>
        </div>
      )}
      <button onClick={onNext} className="mt-3 rounded-md bg-stone-800 px-4 py-1.5 text-sm text-white hover:bg-stone-700">Next</button>
    </div>
  );
}
