import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Copy, Check, Code } from 'lucide-react';

export const CodeEditor = ({
  code,
  onChange,
  language = 'javascript',
  onLanguageChange,
  onResetStarter,
  height = '500px',
  readOnly = false
}) => {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom dark charcoal theme for Monaco matching Skill Battle
    monaco.editor.defineTheme('skillBattleDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'A78BFA', fontStyle: 'bold' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'FBBF24' },
        { token: 'identifier', foreground: 'E5E7EB' },
        { token: 'function', foreground: '60A5FA' }
      ],
      colors: {
        'editor.background': '#13151F',
        'editor.foreground': '#E5E7EB',
        'editor.lineHighlightBackground': '#1A1D2B',
        'editorCursor.foreground': '#A78BFA',
        'editorWhitespace.foreground': '#25293C',
        'editorIndentGuide.background': '#1F2335',
        'editorIndentGuide.activeBackground': '#374151',
        'editor.selectionBackground': '#3B2D54',
        'editorLineNumber.foreground': '#4B5563',
        'editorLineNumber.activeForeground': '#9CA3AF'
      }
    });

    monaco.editor.setTheme('skillBattleDark');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-[#232738] bg-[#13151F] shadow-xl">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#171A26] border-b border-[#232738]">
        {/* Language Selector */}
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-purple-400" />
          {onLanguageChange ? (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={readOnly}
              className="bg-[#10121A] text-xs font-semibold text-gray-200 border border-[#2A2E42] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python (3.11)</option>
            </select>
          ) : (
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              {language}
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-2">
          {onResetStarter && !readOnly && (
            <button
              onClick={onResetStarter}
              title="Reset code to original starter template"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#232738] rounded-lg transition-colors text-xs flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy code to clipboard"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#232738] rounded-lg transition-colors text-xs flex items-center space-x-1"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full min-h-[300px]">
        <Editor
          height={height}
          language={language === 'python' ? 'python' : 'javascript'}
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            smoothScrolling: true
          }}
        />
      </div>
    </div>
  );
};

