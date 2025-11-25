import React, { useState } from 'react';
import AgentProgress from './components/AgentProgress';
import SummaryDisplay from './components/SummaryDisplay';
import QuizInterface from './components/QuizInterface';
import StudyGuideDisplay from './components/StudyGuideDisplay';

function App() {
  const [paperText, setPaperText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('pdf'); // 'pdf' or 'text'
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        setError('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input based on mode
    if (uploadMode === 'pdf') {
      if (!selectedFile) {
        setError('Please select a PDF file to upload');
        return;
      }
    } else {
      if (!paperText.trim()) {
        setError('Please paste research paper text');
        return;
      }
      if (paperText.length < 100) {
        setError('Paper text is too short. Please provide a complete research paper.');
        return;
      }
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
      let response;
      
      if (uploadMode === 'pdf') {
        // Upload PDF file
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        response = await fetch('http://localhost:8000/api/process-paper-pdf', {
          method: 'POST',
          body: formData
        });
      } else {
        // Send text
        response = await fetch('http://localhost:8000/api/process-paper', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paper_text: paperText })
        });
      }

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

This study examines the effects of machine learning algorithms on predictive accuracy in healthcare diagnostics. We compared three different approaches: traditional statistical methods (logistic regression), random forest classifiers, and deep convolutional neural networks (CNN). A dataset of 5,000 patients across 10 medical centers was analyzed. Our results indicate that deep learning models achieved 94% accuracy (95% CI: 92.1-95.8%) in diagnosing cardiovascular diseases, with precision of 92% and recall of 91%, significantly outperforming random forest (87% accuracy) and logistic regression (79% accuracy, p<0.001). The CNN model also demonstrated 48-hour earlier detection capability compared to traditional methods, with an AUC-ROC of 0.96.

Introduction

Healthcare diagnostics have traditionally relied on statistical analysis, biomarker assessment, and expert clinical judgment. The annual mortality rate from cardiovascular disease (CVD) exceeds 17.9 million globally, with delayed diagnosis contributing to 30-40% of preventable deaths. However, with the advent of artificial intelligence and machine learning, new possibilities have emerged for improving diagnostic accuracy and speed. Recent studies have shown promise with neural networks in medical imaging (achieving 85-90% accuracy), but their application to comprehensive patient data including electronic health records, biomarkers, and demographic factors remains underexplored. This research investigates how modern ML algorithms, specifically deep learning architectures, can enhance early detection of cardiovascular diseases by analyzing multimodal patient data, potentially saving thousands of lives annually through earlier intervention.

Methods

We conducted a retrospective cohort study analyzing data from 5,000 patients (mean age 58.3 ± 12.4 years, 52% male) across 10 tertiary care medical centers between January 2018 and December 2022. Patients were included if they had complete electronic health records with at least 12 months of follow-up. Data collected included demographics, vital signs (blood pressure, heart rate), laboratory values (lipid panel, glucose, troponin levels), ECG readings, and family history. Three ML models were developed and compared: (1) logistic regression as baseline using 15 predictor variables, (2) random forest classifier with 100 trees and max depth of 10, and (3) a convolutional neural network with 5 layers (input layer, 3 hidden layers with 128, 64, and 32 neurons respectively, and output layer with softmax activation). The dataset was split 70/30 for training/testing. Each model was evaluated using stratified 5-fold cross-validation to ensure robust performance estimates. Performance metrics included accuracy, precision, recall, F1 score, and area under the ROC curve (AUC-ROC). Statistical significance was assessed using McNemar's test for paired proportions. All analyses were performed in Python 3.9 using scikit-learn 1.0 and TensorFlow 2.8.

Results

The deep learning CNN model achieved the highest performance with 94% accuracy (95% CI: 92.1-95.8%), compared to 87% for random forest (95% CI: 84.9-89.1%) and 79% for logistic regression (95% CI: 76.5-81.5%). The improvement of CNN over logistic regression was statistically significant (p<0.001, McNemar's test). Precision and recall for the CNN were 92% and 91% respectively, yielding an F1 score of 0.915. The AUC-ROC for CNN was 0.96, compared to 0.89 for random forest and 0.81 for logistic regression. Analysis of false positives showed CNN had a 6% false positive rate versus 11% for random forest and 18% for logistic regression. False negative rates were 9%, 13%, and 21% respectively. When examining temporal detection capability, the CNN model identified high-risk patients an average of 48 hours (95% CI: 42-54 hours) earlier than traditional diagnostic protocols. Feature importance analysis revealed that troponin levels, ECG ST-segment changes, and blood pressure variability were the top three predictive features in the CNN model. Model performance was consistent across different patient subgroups (age, gender, comorbidities) with accuracy ranging from 91-96%. Cross-validation results showed minimal overfitting (training accuracy 95% vs. test accuracy 94%).

Conclusion

This study provides strong evidence for integrating deep learning into clinical diagnostic workflows for cardiovascular disease detection. The CNN model's 94% accuracy rate and 48-hour earlier detection capability could transform cardiovascular care and potentially reduce mortality by enabling timely interventions. The model's superior performance over traditional methods (logistic regression) and ensemble methods (random forest) demonstrates the value of deep learning in capturing complex, nonlinear relationships in patient data. The high AUC-ROC (0.96) indicates excellent discriminative ability. However, several limitations should be noted: the study was retrospective, limiting causal inference; the model was trained on data from tertiary care centers which may not generalize to primary care settings; and model interpretability remains challenging, which may hinder clinical adoption. Future work should focus on: (1) prospective validation studies across diverse healthcare settings, (2) developing explainable AI techniques to improve model interpretability for clinicians, (3) multi-institutional external validation, and (4) cost-effectiveness analysis comparing AI-assisted versus traditional diagnostic pathways. Integration of real-time patient monitoring data and expansion to other cardiovascular conditions are also promising directions.`;

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
            {/* Toggle between PDF and Text Input */}
            <div className="mb-6 flex space-x-4 border-b border-gray-200 pb-4">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('pdf');
                  setError(null);
                }}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  uploadMode === 'pdf'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📄 Upload PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('text');
                  setError(null);
                }}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  uploadMode === 'text'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📝 Paste Text
              </button>
            </div>

            {/* PDF Upload Mode */}
            {uploadMode === 'pdf' && (
              <div className="mb-4">
                <label htmlFor="pdf-upload" className="block text-lg font-semibold text-gray-900 mb-2">
                  📄 Upload Research Paper (PDF)
                </label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors duration-200">
                  <div className="space-y-2 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="pdf-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a PDF file</span>
                        <input
                          id="pdf-upload"
                          name="pdf-upload"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          disabled={isProcessing}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF files only</p>
                  </div>
                </div>
                {selectedFile && (
                  <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-900">{selectedFile.name}</span>
                      <span className="text-xs text-blue-600">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Text Input Mode */}
            {uploadMode === 'text' && (
              <div className="mb-4">
                <label htmlFor="paper-text" className="block text-lg font-semibold text-gray-900 mb-2">
                  📝 Paste Research Paper Text
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
            )}

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
              disabled={isProcessing || (uploadMode === 'pdf' ? !selectedFile : !paperText.trim())}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all duration-200 ${
                isProcessing || (uploadMode === 'pdf' ? !selectedFile : !paperText.trim())
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

