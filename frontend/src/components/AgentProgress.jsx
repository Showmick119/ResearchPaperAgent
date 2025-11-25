import React from 'react';

/**
 * AgentProgress Component
 * Displays real-time progress of the 4-agent workflow
 * Shows loading spinners, checkmarks, and status messages
 */
function AgentProgress({ agents, isProcessing }) {
  const getProgressPercentage = () => {
    const completed = agents.filter(a => a.status === 'complete').length;
    return (completed / agents.length) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Agent Workflow Progress</h2>
          <span className="text-sm font-semibold text-blue-600">
            {Math.round(getProgressPercentage())}% Complete
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
              agent.status === 'complete'
                ? 'bg-green-50 border-green-500'
                : agent.status === 'processing'
                ? 'bg-blue-50 border-blue-500 animate-pulse'
                : agent.status === 'error'
                ? 'bg-red-50 border-red-500'
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            {/* Agent Number Badge */}
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
              {agent.id}
            </div>

            {/* Status Icon */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm ml-4">
                {agent.name}
              </h3>
              
              {agent.status === 'complete' && (
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              
              {agent.status === 'processing' && (
                <svg className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              
              {agent.status === 'error' && (
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              
              {agent.status === 'pending' && (
                <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex-shrink-0"></div>
              )}
            </div>

            {/* Status Message */}
            {agent.message && (
              <p className="text-xs text-gray-600 mt-2 ml-4">
                {agent.message}
              </p>
            )}

            {/* Status Label */}
            <div className="mt-3 ml-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                agent.status === 'complete'
                  ? 'bg-green-100 text-green-800'
                  : agent.status === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : agent.status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {agent.status === 'complete' && '✓ Complete'}
                {agent.status === 'processing' && '⚙️ Processing...'}
                {agent.status === 'error' && '✗ Error'}
                {agent.status === 'pending' && '⏳ Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sequential Flow Indicator */}
      {isProcessing && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-medium">
            Sequential Agent Workflow in Progress
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Each agent processes the output from the previous agent
          </p>
        </div>
      )}
    </div>
  );
}

export default AgentProgress;

