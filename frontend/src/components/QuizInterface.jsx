import React, { useState } from 'react';

/**
 * QuizInterface Component
 * Interactive quiz with radio buttons, answer checking, and score tracking
 */
function QuizInterface({ quiz }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);

  const questions = quiz.questions || [];

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleCheckAnswer = (questionIndex) => {
    setShowResults(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  const handleSubmitQuiz = () => {
    const newResults = {};
    questions.forEach((_, index) => {
      newResults[index] = true;
    });
    setShowResults(newResults);
    setQuizComplete(true);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('quiz-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return '🎉 Outstanding! You have excellent understanding!';
    if (percentage >= 80) return '✨ Great job! You understand the material well!';
    if (percentage >= 70) return '👍 Good work! Keep studying to improve further.';
    if (percentage >= 60) return '📚 Not bad! Review the material for better retention.';
    return '💪 Keep practicing! Review the summaries and try again.';
  };

  if (!questions.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No quiz questions available.</p>
      </div>
    );
  }

  const score = calculateScore();
  const scorePercentage = (score.correct / score.total) * 100;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Assessment Quiz</h2>
        <p className="text-sm text-gray-600">
          Test your understanding with {questions.length} multiple choice questions
        </p>
      </div>

      {/* Questions */}
      {questions.map((question, index) => {
        const isAnswered = selectedAnswers[index] !== undefined;
        const isCorrect = selectedAnswers[index] === question.correct_answer;
        const showResult = showResults[index];

        return (
          <div
            key={index}
            className={`border-2 rounded-lg p-6 transition-all duration-200 ${
              showResult
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex-1">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold mr-3">
                  {index + 1}
                </span>
                {question.question}
              </h3>
              
              {showResult && (
                <span className="ml-4">
                  {isCorrect ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </span>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-4 ml-11">
              {Object.entries(question.options).map(([key, value]) => {
                const isSelected = selectedAnswers[index] === key;
                const isCorrectAnswer = key === question.correct_answer;
                
                return (
                  <label
                    key={key}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-150 ${
                      showResult
                        ? isCorrectAnswer
                          ? 'border-green-500 bg-green-100'
                          : isSelected
                          ? 'border-red-500 bg-red-100'
                          : 'border-gray-200 bg-gray-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={key}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(index, key)}
                      disabled={showResult}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-gray-900 flex-1">{value}</span>
                    
                    {showResult && isCorrectAnswer && (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Check Answer Button */}
            {!showResult && (
              <button
                onClick={() => handleCheckAnswer(index)}
                disabled={!isAnswered}
                className={`ml-11 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                  isAnswered
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Check Answer
              </button>
            )}

            {/* Explanation */}
            {showResult && question.explanation && (
              <div className="ml-11 mt-4 p-4 bg-white rounded-lg border border-gray-300">
                <p className="text-sm font-medium text-gray-900 mb-1">Explanation:</p>
                <p className="text-sm text-gray-700">{question.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Submit Quiz Button */}
      {!quizComplete && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length !== questions.length}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
              Object.keys(selectedAnswers).length === questions.length
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Quiz
          </button>
        </div>
      )}

      {/* Quiz Results */}
      {quizComplete && (
        <div id="quiz-results" className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete! 🎓</h3>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(scorePercentage)}`}>
              {score.correct} / {score.total}
            </div>
            <p className="text-lg text-gray-700 mb-4">
              {scorePercentage.toFixed(0)}% Correct
            </p>
            <p className="text-md text-gray-600 mb-4">
              {getScoreMessage(scorePercentage)}
            </p>
            
            {/* Score Breakdown */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{score.correct}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{score.total - score.correct}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Info */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium text-purple-900">
              {questions.length} questions generated from paper summaries
            </span>
          </div>
          <span className="text-xs text-purple-700">
            Generated by Agent 3
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuizInterface;

