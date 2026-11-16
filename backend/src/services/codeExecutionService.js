import vm from 'vm';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

// Helper to find Python executable
const getPythonPath = () => {
  const possiblePaths = [
    process.env.PYTHON_PATH,
    'python',
    'python3'
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'python';
};

/**
 * Restricted tokens for JavaScript code to prevent sandbox escapes & arbitrary code execution
 */
const RESTRICTED_JS_PATTERNS = [
  /\bprocess\b/,
  /\brequire\s*\(/,
  /\bimport\s*\(/,
  /\bchild_process\b/,
  /\bfs\b/,
  /\bglobal\b/,
  /\bglobalThis\b/,
  /\bconstructor\b/,
  /\b__proto__\b/,
  /\bprototype\b/,
  /\bFunction\s*\(/,
  /\beval\s*\(/,
  /\bWebAssembly\b/
];

/**
 * Restricted tokens for Python code to prevent system access & unauthorized module execution
 */
const RESTRICTED_PYTHON_PATTERNS = [
  /\bimport\s+os\b/,
  /\bimport\s+sys\b/,
  /\bimport\s+subprocess\b/,
  /\bimport\s+shutil\b/,
  /\bimport\s+socket\b/,
  /\bimport\s+requests\b/,
  /\bimport\s+urllib\b/,
  /\bimport\s+pty\b/,
  /\bimport\s+ctypes\b/,
  /\bimport\s+signal\b/,
  /\bfrom\s+os\b/,
  /\bfrom\s+sys\b/,
  /\bfrom\s+subprocess\b/,
  /\b__import__\b/,
  /\bopen\s*\(/,
  /\beval\s*\(/,
  /\bexec\s*\(/,
  /\bbreakpoint\s*\(/,
  /\bcompile\s*\(/,
  /\bglobals\s*\(/,
  /\blocals\s*\(/,
  /\bgetattr\s*\(/,
  /\bsetattr\s*\(/,
  /\bdelattr\s*\(/
];

/**
 * Validate code against restricted tokens
 */
const validateCodeSecurity = (code, language) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Code must be a non-empty string');
  }

  // Maximum allowable code size (64 KB)
  if (code.length > 65536) {
    throw new Error('Submitted code exceeds maximum size limit (64 KB)');
  }

  if (language === 'javascript') {
    for (const pattern of RESTRICTED_JS_PATTERNS) {
      if (pattern.test(code)) {
        throw new Error(`Security Violation: Disallowed token detected (${pattern.source})`);
      }
    }
  } else if (language === 'python') {
    for (const pattern of RESTRICTED_PYTHON_PATTERNS) {
      if (pattern.test(code)) {
        throw new Error(`Security Violation: Disallowed module or builtin detected (${pattern.source})`);
      }
    }
  }
};

/**
 * Safely parses input string into arguments array without using eval or vm
 */
const parseArguments = (inputStr) => {
  if (!inputStr || typeof inputStr !== 'string') return [];
  const trimmed = inputStr.trim();

  try {
    // Attempt standard JSON array parse wrapped in brackets: e.g. "[2,7,11,15], 9" -> [[2,7,11,15], 9]
    return JSON.parse(`[${trimmed}]`);
  } catch (e) {
    // Fallback: If it's a single raw string or literal, parse safely
    try {
      return [JSON.parse(trimmed)];
    } catch {
      return [trimmed];
    }
  }
};

/**
 * Normalizes output value for comparison
 */
const normalizeOutput = (val) => {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed);
    } catch {
      return val.trim();
    }
  }
  return JSON.stringify(val);
};

/**
 * Deep equality comparison between actual and expected
 */
const isOutputEqual = (actual, expectedStr) => {
  if (expectedStr === undefined || expectedStr === null) return false;
  const trimmedExpected = String(expectedStr).trim();

  // 1. Direct string match
  if (String(actual) === trimmedExpected) return true;

  // 2. JSON normalized match
  const actualNormalized = normalizeOutput(actual);
  let expectedNormalized;
  try {
    expectedNormalized = normalizeOutput(JSON.parse(trimmedExpected));
  } catch {
    expectedNormalized = trimmedExpected;
  }

  if (actualNormalized === expectedNormalized) return true;

  // 3. For array equality where order might vary
  try {
    const actObj = typeof actual === 'string' ? JSON.parse(actual) : actual;
    const expObj = JSON.parse(trimmedExpected);
    if (Array.isArray(actObj) && Array.isArray(expObj)) {
      if (actObj.length !== expObj.length) return false;
      const actSorted = [...actObj].sort();
      const expSorted = [...expObj].sort();
      if (JSON.stringify(actSorted) === JSON.stringify(expSorted)) return true;
    }
  } catch {}

  return false;
};

/**
 * Execute JavaScript code locally using hardened Node VM
 */
const executeJavascriptLocal = async (code, functionName, testCases, timeoutMs = 2500) => {
  validateCodeSecurity(code, 'javascript');

  // Verify function name identifier is safe
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(functionName)) {
    throw new Error('Invalid function name identifier');
  }

  const results = [];
  let totalTime = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const logs = [];
    const startTime = Date.now();

    // Isolated sandbox with null prototype
    const sandbox = Object.create(null);
    sandbox.console = {
      log: (...args) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      error: (...args) => logs.push(args.map(a => String(a)).join(' ')),
      warn: (...args) => logs.push(args.map(a => String(a)).join(' '))
    };
    sandbox.Math = Math;
    sandbox.Number = Number;
    sandbox.String = String;
    sandbox.Array = Array;
    sandbox.Map = Map;
    sandbox.Set = Set;
    sandbox.Date = Date;
    sandbox.parseInt = parseInt;
    sandbox.parseFloat = parseFloat;
    sandbox.isNaN = isNaN;
    sandbox.isFinite = isFinite;

    vm.createContext(sandbox);

    try {
      const args = parseArguments(tc.input);
      sandbox.__args = args;

      const runnerScript = `
        "use strict";
        ${code}
        if (typeof ${functionName} !== 'function') {
          throw new Error('Function "${functionName}" is not defined or is not callable');
        }
        ${functionName}(...__args);
      `;

      const executionStartTime = performance.now();
      const actualResult = vm.runInContext(runnerScript, sandbox, {
        timeout: timeoutMs,
        displayErrors: false
      });
      const executionDuration = Math.round(performance.now() - executionStartTime);
      totalTime += executionDuration;

      const passed = isOutputEqual(actualResult, tc.output);

      results.push({
        testCaseNumber: i + 1,
        passed,
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: normalizeOutput(actualResult),
        executionTime: executionDuration,
        stdout: logs.slice(0, 50).join('\n'),
        error: null
      });
    } catch (err) {
      const executionDuration = Date.now() - startTime;
      totalTime += executionDuration;
      const isTimeout = err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || err.message?.includes('timed out');

      results.push({
        testCaseNumber: i + 1,
        passed: false,
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: null,
        executionTime: executionDuration,
        stdout: logs.slice(0, 50).join('\n'),
        error: isTimeout ? 'Time Limit Exceeded (> 2500ms)' : (err.message || 'Execution error')
      });
    }
  }

  return { results, totalTime };
};

/**
 * Execute Python code locally via child process with restricted builtins
 */
const executePythonLocal = async (code, functionName, testCases, timeoutMs = 3000) => {
  validateCodeSecurity(code, 'python');

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
    throw new Error('Invalid Python function identifier');
  }

  const pythonPath = getPythonPath();
  const results = [];
  let totalTime = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const startTime = Date.now();

    const args = parseArguments(tc.input);
    const argsJson = JSON.stringify(args);

    // Hardened Python Harness with strict sandbox and restricted builtins
    const pythonHarness = `
import sys
import json
import time

# Whitelist safe builtins to prevent system calls or filesystem access
__SAFE_BUILTINS = {
    'abs': abs, 'all': all, 'any': any, 'bin': bin, 'bool': bool,
    'bytearray': bytearray, 'bytes': bytes, 'chr': chr, 'dict': dict,
    'divmod': divmod, 'enumerate': enumerate, 'filter': filter,
    'float': float, 'format': format, 'frozenset': frozenset,
    'hash': hash, 'hex': hex, 'int': int, 'isinstance': isinstance,
    'issubclass': issubclass, 'iter': iter, 'len': len, 'list': list,
    'map': map, 'max': max, 'min': min, 'next': next, 'oct': oct,
    'ord': ord, 'pow': pow, 'print': print, 'range': range, 'repr': repr,
    'reversed': reversed, 'round': round, 'set': set, 'slice': slice,
    'sorted': sorted, 'str': str, 'sum': sum, 'tuple': tuple, 'type': type,
    'zip': zip, 'Exception': Exception, 'ValueError': ValueError,
    'TypeError': TypeError, 'IndexError': IndexError, 'KeyError': KeyError,
    'ZeroDivisionError': ZeroDivisionError, 'math': None
}

user_code = ${JSON.stringify(code)}
target_fn_name = ${JSON.stringify(functionName)}
args_json = ${JSON.stringify(argsJson)}

scope = {'__builtins__': __SAFE_BUILTINS}

try:
    exec(user_code, scope)
    fn = scope.get(target_fn_name)
    if not fn or not callable(fn):
        print("__SKILL_BATTLE_ERROR__: Function '" + target_fn_name + "' not defined or not callable")
        sys.exit(0)

    raw_args = json.loads(args_json)
    t0 = time.perf_counter()
    res = fn(*raw_args)
    t1 = time.perf_counter()

    duration_ms = round((t1 - t0) * 1000)
    print("__SKILL_BATTLE_TIME__:" + str(duration_ms))
    print("__SKILL_BATTLE_RESULT__:" + json.dumps(res))
except Exception as e:
    print("__SKILL_BATTLE_ERROR__:" + str(e), file=sys.stderr)
`;

    const runPromise = new Promise((resolve) => {
      const pyProcess = spawn(pythonPath, ['-c', pythonHarness]);
      let stdout = '';
      let stderr = '';
      let isTimedOut = false;

      const timer = setTimeout(() => {
        isTimedOut = true;
        pyProcess.kill();
      }, timeoutMs);

      pyProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pyProcess.on('close', (code) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;
        if (isTimedOut) {
          return resolve({
            passed: false,
            actual: null,
            time: duration,
            stdout,
            error: 'Time Limit Exceeded (> 3000ms)'
          });
        }

        let actual = null;
        let execTime = duration;
        let error = null;

        const timeMatch = stdout.match(/__SKILL_BATTLE_TIME__:(\d+)/);
        if (timeMatch) {
          execTime = parseInt(timeMatch[1], 10);
        }

        const resMatch = stdout.match(/__SKILL_BATTLE_RESULT__:(.+)/);
        if (resMatch) {
          try {
            actual = JSON.parse(resMatch[1].trim());
          } catch {
            actual = resMatch[1].trim();
          }
        }

        const errMatch = stdout.match(/__SKILL_BATTLE_ERROR__:(.+)/) || stderr.match(/__SKILL_BATTLE_ERROR__:(.+)/);
        if (errMatch) {
          error = errMatch[1].trim();
        } else if (code !== 0 && !resMatch) {
          error = stderr.trim() || `Process exited with code ${code}`;
        }

        const cleanStdout = stdout
          .replace(/__SKILL_BATTLE_TIME__:\d+\r?\n?/, '')
          .replace(/__SKILL_BATTLE_RESULT__:.+\r?\n?/, '')
          .replace(/__SKILL_BATTLE_ERROR__:.+\r?\n?/, '')
          .trim();

        const passed = !error && isOutputEqual(actual, tc.output);

        resolve({
          passed,
          actual: normalizeOutput(actual),
          time: execTime,
          stdout: cleanStdout,
          error: error || null
        });
      });

      pyProcess.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          passed: false,
          actual: null,
          time: Date.now() - startTime,
          stdout: '',
          error: `Execution engine error: ${err.message}`
        });
      });
    });

    const res = await runPromise;
    totalTime += res.time;

    results.push({
      testCaseNumber: i + 1,
      passed: res.passed,
      input: tc.input,
      expectedOutput: tc.output,
      actualOutput: res.actual,
      executionTime: res.time,
      stdout: res.stdout,
      error: res.error
    });
  }

  return { results, totalTime };
};

/**
 * Main execution service interface
 */
export const executeCode = async ({ code, language, functionName, testCases }) => {
  if (!testCases || testCases.length === 0) {
    throw new Error('No test cases provided for execution');
  }

  if (language === 'javascript') {
    const { results, totalTime } = await executeJavascriptLocal(code, functionName, testCases);
    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === testCases.length;

    let overallStatus = 'Accepted';
    if (!allPassed) {
      const hasTLE = results.some(r => r.error && r.error.includes('Time Limit'));
      const hasRuntimeError = results.some(r => r.error && !r.error.includes('Time Limit'));
      if (hasTLE) overallStatus = 'Time Limit Exceeded';
      else if (hasRuntimeError) overallStatus = 'Runtime Error';
      else overallStatus = 'Wrong Answer';
    }

    return {
      status: overallStatus,
      passed: allPassed,
      testCasesPassed: passedCount,
      totalTestCases: testCases.length,
      executionTime: totalTime,
      memory: Math.round(process.memoryUsage().heapUsed / 1024),
      results
    };
  }

  if (language === 'python') {
    const { results, totalTime } = await executePythonLocal(code, functionName, testCases);
    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === testCases.length;

    let overallStatus = 'Accepted';
    if (!allPassed) {
      const hasTLE = results.some(r => r.error && r.error.includes('Time Limit'));
      const hasRuntimeError = results.some(r => r.error && !r.error.includes('Time Limit'));
      if (hasTLE) overallStatus = 'Time Limit Exceeded';
      else if (hasRuntimeError) overallStatus = 'Runtime Error';
      else overallStatus = 'Wrong Answer';
    }

    return {
      status: overallStatus,
      passed: allPassed,
      testCasesPassed: passedCount,
      totalTestCases: testCases.length,
      executionTime: totalTime,
      memory: 24000,
      results
    };
  }

  throw new Error(`Unsupported programming language: ${language}`);
};
