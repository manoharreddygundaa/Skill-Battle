import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Terminal, AlertCircle } from 'lucide-react';

export const TestCasePanel = ({
  sampleTestCases = [],
  customInput,
  onCustomInputChange,
  runResults,
  isRunning = false
}) => {
  const [activeTab, setActiveTab] = useState('testcases');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  // Switch to results tab automatically when new runResults arrive
  React.useEffect(() => {
    if (runResults) {
      setActiveTab('results');
    }
  }, [runResults]);

  const currentTestCase = sampleTestCases[selectedCaseIdx] || sampleTestCases[0];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#141622] border border-[#232738] overflow-hidden">
      {/* Top Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#171A26] border-b border-[#232738]">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('testcases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'testcases'
                ? 'bg-[#232738] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1C2030]'
            }`}
          >
            Test Cases
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'results'
                ? 'bg-[#232738] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1C2030]'
            }`}
          >
            <span>Run Results</span>
            {runResults && (
              <span
                className={`w-2 h-2 rounded-full ${
                  runResults.passed ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'custom'
                ? 'bg-[#232738] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1C2030]'
            }`}
          >
            Custom Input
          </button>
        </div>

        {runResults && (
          <div className="flex items-center space-x-2 text-xs">
            <span
              className={`font-semibold px-2 py-0.5 rounded-md ${
                runResults.status === 'Accepted'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {runResults.status}
            </span>
            <span className="text-gray-400 text-xs flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>{runResults.executionTime}ms</span>
            </span>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* TAB 1: Sample Test Cases */}
        {activeTab === 'testcases' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {sampleTestCases.map((tc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCaseIdx === idx
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                      : 'bg-[#1C2030] text-gray-400 hover:text-white'
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {currentTestCase && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <p className="text-gray-400 font-sans text-xs mb-1">Input:</p>
                  <pre className="p-3 rounded-xl bg-[#0F1017] border border-[#232738] text-gray-200 overflow-x-auto">
                    {currentTestCase.input}
                  </pre>
                </div>
                <div>
                  <p className="text-gray-400 font-sans text-xs mb-1">Expected Output:</p>
                  <pre className="p-3 rounded-xl bg-[#0F1017] border border-[#232738] text-emerald-400 overflow-x-auto">
                    {currentTestCase.output}
                  </pre>
                </div>
                {currentTestCase.explanation && (
                  <div>
                    <p className="text-gray-400 font-sans text-xs mb-1">Explanation:</p>
                    <p className="text-gray-400 font-sans text-xs bg-[#1A1D2B]/40 p-2.5 rounded-lg border border-[#232738]/50">
                      {currentTestCase.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Run Results */}
        {activeTab === 'results' && (
          <div>
            {isRunning ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-gray-400">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Executing sample test cases...</span>
              </div>
            ) : runResults ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {runResults.results?.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCaseIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
                        selectedCaseIdx === idx
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                          : 'bg-[#1C2030] text-gray-400 hover:text-white'
                      }`}
                    >
                      {r.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>Case {idx + 1}</span>
                    </button>
                  ))}
                </div>

                {runResults.results?.[selectedCaseIdx] && (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <p className="text-gray-400 font-sans text-xs mb-1">Input:</p>
                      <pre className="p-3 rounded-xl bg-[#0F1017] border border-[#232738] text-gray-200 overflow-x-auto">
                        {runResults.results[selectedCaseIdx].input}
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-400 font-sans text-xs mb-1">Expected Output:</p>
                        <pre className="p-3 rounded-xl bg-[#0F1017] border border-[#232738] text-emerald-400 overflow-x-auto">
                          {runResults.results[selectedCaseIdx].expectedOutput}
                        </pre>
                      </div>
                      <div>
                        <p className="text-gray-400 font-sans text-xs mb-1">Your Output:</p>
                        <pre
                          className={`p-3 rounded-xl bg-[#0F1017] border overflow-x-auto ${
                            runResults.results[selectedCaseIdx].passed
                              ? 'border-emerald-500/30 text-emerald-400'
                              : 'border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {runResults.results[selectedCaseIdx].actualOutput ?? 'null'}
                        </pre>
                      </div>
                    </div>

                    {runResults.results[selectedCaseIdx].error && (
                      <div>
                        <p className="text-rose-400 font-sans text-xs mb-1 flex items-center">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          Runtime Error / Message:
                        </p>
                        <pre className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 overflow-x-auto">
                          {runResults.results[selectedCaseIdx].error}
                        </pre>
                      </div>
                    )}

                    {runResults.results[selectedCaseIdx].stdout && (
                      <div>
                        <p className="text-gray-400 font-sans text-xs mb-1 flex items-center">
                          <Terminal className="w-3.5 h-3.5 mr-1" />
                          Standard Output (console.log):
                        </p>
                        <pre className="p-3 rounded-xl bg-[#0F1017] border border-[#232738] text-gray-300 overflow-x-auto">
                          {runResults.results[selectedCaseIdx].stdout}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                Click <span className="text-purple-400 font-semibold">"Run Code"</span> above to test your code against sample inputs.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Custom Input */}
        {activeTab === 'custom' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              Provide comma-separated argument parameters to pass to your function:
            </p>
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="e.g. [2, 7, 11, 15], 9"
              rows={4}
              className="w-full font-mono text-xs p-3 rounded-xl bg-[#0F1017] border border-[#232738] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

