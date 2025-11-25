import React from 'react';

/**
 * StudyGuideDisplay Component
 * Shows the complete study guide with summaries, quiz, and study tips
 */
function StudyGuideDisplay({ studyGuide }) {
  if (!studyGuide) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No study guide available.</p>
      </div>
    );
  }

  const { title, study_tips, sections_overview, key_takeaways, summaries, quiz } = studyGuide;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {title || 'Research Paper Study Guide'}
        </h1>
        {sections_overview && (
          <p className="text-gray-600 max-w-3xl mx-auto">{sections_overview}</p>
        )}
      </div>

      {/* Key Takeaways */}
      {key_takeaways && key_takeaways.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-300">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Key Takeaways</h2>
          </div>
          <ul className="space-y-2">
            {key_takeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-600 text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-800">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Study Tips */}
      {study_tips && study_tips.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-300">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Study Tips & Strategies</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {study_tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Summaries */}
      {summaries && (
        <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Section Summaries</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(summaries).map(([section, summary]) => {
              const isAvailable = summary && summary !== "Section not available in paper" && summary !== "Not Found";
              
              if (!isAvailable) return null;
              
              return (
                <div key={section} className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">{section}</h3>
                  <p className="text-gray-700 text-sm">{summary}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz Summary */}
      {quiz && quiz.questions && quiz.questions.length > 0 && (
        <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Assessment Questions</h2>
          </div>
          <p className="text-gray-600 mb-4">
            {quiz.questions.length} multiple choice questions have been generated to test your understanding. 
            Switch to the Quiz tab to take the assessment.
          </p>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-900 font-medium">
              💡 Tip: Complete the quiz in the Quiz tab to assess your comprehension of the material.
            </p>
          </div>
        </div>
      )}

      {/* Download/Print Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Study Guide Complete!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use this comprehensive guide to master the research paper content.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Study Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agent Credit */}
      <div className="text-center py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Generated by Agent 4: Study Guide Builder • Powered by Llama 3.1 8B
        </p>
      </div>
    </div>
  );
}

export default StudyGuideDisplay;

