import React, { useState } from 'react';
import AgentProgress from './components/AgentProgress';
import SummaryDisplay from './components/SummaryDisplay';
import QuizInterface from './components/QuizInterface';
import StudyGuideDisplay from './components/StudyGuideDisplay';

function App() {
  const [paperText, setPaperText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentProgress, setAgentProgress] = useState([
    { id: 1, name: 'Section Extractor', status: 'pending', message: '' },
    { id: 2, name: 'Summarizer', status: 'pending', message: '' },
    { id: 3, name: 'Quiz Generator', status: 'pending', message: '' },
    { id: 4, name: 'Study Guide Builder', status: 'pending', message: '' }
  ]);
  const [activeTab, setActiveTab] = useState('summaries');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paperText.trim()) {
      setError('Please paste research paper text');
      return;
    }

    if (paperText.length < 100) {
      setError('Paper text is too short. Please provide a complete research paper.');
      return;
    }

    // Reset state
    setIsProcessing(true);
    setError(null);
    setResults(null);
    setAgentProgress([
      { id: 1, name: 'Section Extractor', status: 'pending', message: '' },
      { id: 2, name: 'Summarizer', status: 'pending', message: '' },
      { id: 3, name: 'Quiz Generator', status: 'pending', message: '' },
      { id: 4, name: 'Study Guide Builder', status: 'pending', message: '' }
    ]);

    try {
      // Connect to Server-Sent Events stream
      const response = await fetch('http://localhost:8000/api/process-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paper_text: paperText })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.status === 'error') {
              setError(data.message);
              setIsProcessing(false);
              return;
            }

            if (data.status === 'done') {
              setResults(data.result);
              setIsProcessing(false);
              return;
            }

            // Update agent progress
            if (data.agent) {
              setAgentProgress(prev => prev.map(agent => {
                if (agent.id === data.agent) {
                  return {
                    ...agent,
                    status: data.status,
                    message: data.message,
                    data: data.data
                  };
                }
                return agent;
              }));
            }
          }
        }
      }
    } catch (err) {
      setError(`Error: ${err.message}. Make sure the backend server is running.`);
      setIsProcessing(false);
    }
  };

  const sampleText = `Abstract

This study examines the effects of machine learning algorithms on predictive accuracy in healthcare diagnostics. We compared three different approaches: traditional statistical methods, random forest classifiers, and deep neural networks. Our results indicate that deep learning models achieved 94% accuracy in diagnosing cardiovascular diseases, significantly outperforming traditional methods.

Introduction

Healthcare diagnostics have traditionally relied on statistical analysis and expert clinical judgment. However, with the advent of artificial intelligence and machine learning, new possibilities have emerged for improving diagnostic accuracy. This research investigates how modern ML algorithms can enhance early detection of cardiovascular diseases, potentially saving thousands of lives annually.

Methods

We collected data from 5,000 patients across 10 medical centers. Three ML models were trained: logistic regression (baseline), random forest with 100 trees, and a convolutional neural network with 5 layers. Each model was evaluated using 5-fold cross-validation. Performance metrics included accuracy, precision, recall, and F1 score.

Results

The deep learning model achieved 94% accuracy, compared to 87% for random forest and 79% for logistic regression. Precision was 92% and recall was 91% for the neural network. The model successfully identified high-risk patients with cardiovascular disease 48 hours earlier than traditional methods on average.

Discussion

Our findings demonstrate that deep learning approaches can significantly improve diagnostic accuracy in cardiovascular medicine. The neural network's ability to detect subtle patterns in patient data enables earlier intervention. However, model interpretability remains a challenge that requires further research.

Conclusion

This study provides strong evidence for integrating deep learning into clinical diagnostic workflows. The 94% accuracy rate and early detection capabilities could transform cardiovascular care. Future work should focus on model explainability and multi-institutional validation studies.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Research Paper Study Assistant
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                AI-powered 4-agent workflow for academic paper analysis
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">4 AI Agents</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="paper-text" className="block text-lg font-semibold text-gray-900 mb-2">
                📄 Paste Research Paper Text
              </label>
              <textarea
                id="paper-text"
                value={paperText}
                onChange={(e) => setPaperText(e.target.value)}
                placeholder="Paste your research paper text here (minimum 100 characters)..."
                className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm font-mono"
                disabled={isProcessing}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Characters: {paperText.length}
                </p>
                <button
                  type="button"
                  onClick={() => setPaperText(sampleText)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  disabled={isProcessing}
                >
                  Load Sample Paper
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || !paperText.trim()}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all duration-200 ${
                isProcessing || !paperText.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing with AI Agents...
                </span>
              ) : (
                '🚀 Generate Study Guide'
              )}
            </button>
          </form>
        </div>

        {/* Agent Progress Section */}
        {(isProcessing || results) && (
          <AgentProgress agents={agentProgress} isProcessing={isProcessing} />
        )}

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('summaries')}
                  className={`${
                    activeTab === 'summaries'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  📝 Summaries
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`${
                    activeTab === 'quiz'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  🎯 Quiz
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`${
                    activeTab === 'guide'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  📚 Study Guide
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'summaries' && (
                <SummaryDisplay summaries={results.summaries} />
              )}
              {activeTab === 'quiz' && (
                <QuizInterface quiz={results.quiz} />
              )}
              {activeTab === 'guide' && (
                <StudyGuideDisplay studyGuide={results.study_guide} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by Ollama (Llama 3.1 8B) • 4-Agent Sequential Workflow • Built with FastAPI & React
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

