import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { problemService } from '../../services/problemService';
import { Loader } from '../../components/common/Loader';
import {
  Code2,
  Save,
  ChevronLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const AdminProblemEditorPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [tags, setTags] = useState('Array, Hash Table');
  const [functionName, setFunctionName] = useState('');
  const [description, setDescription] = useState('');

  // Structured fields
  const [examples, setExamples] = useState([
    { input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]', explanation: '2 + 7 = 9' }
  ]);
  const [constraints, setConstraints] = useState(['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9']);
  const [sampleTestCases, setSampleTestCases] = useState([
    { input: '[2, 7, 11, 15], 9', output: '[0, 1]', explanation: 'Sample case 1' }
  ]);
  const [hiddenTestCases, setHiddenTestCases] = useState([
    { input: '[3, 3], 6', output: '[0, 1]' }
  ]);

  // Starter Code
  const [starterJs, setStarterJs] = useState(
    `function solution(args) {\n  // Write your code here\n  return [];\n}`
  );
  const [starterPy, setStarterPy] = useState(
    `def solution(args):\n    # Write your code here\n    return []\n`
  );

  // If editing, load problem
  useEffect(() => {
    if (!isEditing) return;

    const fetchProblemData = async () => {
      try {
        setLoading(true);
        // Admin problems fetch
        const res = await adminService.getProblems();
        if (res.success) {
          const match = res.problems.find((p) => p._id === id);
          if (match) {
            setTitle(match.title);
            setSlug(match.slug);
            setDifficulty(match.difficulty);
            setTags(match.tags?.join(', ') || '');
            setFunctionName(match.functionName);
            setDescription(match.description);
            if (match.examples?.length) setExamples(match.examples);
            if (match.constraints?.length) setConstraints(match.constraints);
            if (match.sampleTestCases?.length) setSampleTestCases(match.sampleTestCases);
            if (match.hiddenTestCases?.length) setHiddenTestCases(match.hiddenTestCases);
            if (match.starterCode?.javascript) setStarterJs(match.starterCode.javascript);
            if (match.starterCode?.python) setStarterPy(match.starterCode.python);
          }
        }
      } catch (err) {
        setError('Failed to load problem for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [id, isEditing]);

  // Dynamic handlers for examples
  const addExample = () => setExamples([...examples, { input: '', output: '', explanation: '' }]);
  const updateExample = (idx, field, val) => {
    const updated = [...examples];
    updated[idx][field] = val;
    setExamples(updated);
  };
  const removeExample = (idx) => setExamples(examples.filter((_, i) => i !== idx));

  // Dynamic handlers for constraints
  const addConstraint = () => setConstraints([...constraints, '']);
  const updateConstraint = (idx, val) => {
    const updated = [...constraints];
    updated[idx] = val;
    setConstraints(updated);
  };
  const removeConstraint = (idx) => setConstraints(constraints.filter((_, i) => i !== idx));

  // Dynamic handlers for sample test cases
  const addSampleTestCase = () =>
    setSampleTestCases([...sampleTestCases, { input: '', output: '', explanation: '' }]);
  const updateSampleTestCase = (idx, field, val) => {
    const updated = [...sampleTestCases];
    updated[idx][field] = val;
    setSampleTestCases(updated);
  };
  const removeSampleTestCase = (idx) =>
    setSampleTestCases(sampleTestCases.filter((_, i) => i !== idx));

  // Dynamic handlers for hidden test cases
  const addHiddenTestCase = () =>
    setHiddenTestCases([...hiddenTestCases, { input: '', output: '' }]);
  const updateHiddenTestCase = (idx, field, val) => {
    const updated = [...hiddenTestCases];
    updated[idx][field] = val;
    setHiddenTestCases(updated);
  };
  const removeHiddenTestCase = (idx) =>
    setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== idx));

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !functionName || !description) {
      setError('Title, function name, and description are required.');
      return;
    }

    if (hiddenTestCases.length === 0) {
      setError('You must provide at least one hidden test case.');
      return;
    }

    const payload = {
      title,
      slug: slug || undefined,
      difficulty,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      functionName: functionName.trim(),
      description,
      examples,
      constraints: constraints.filter(Boolean),
      sampleTestCases,
      hiddenTestCases,
      starterCode: {
        javascript: starterJs,
        python: starterPy
      }
    };

    try {
      setSaving(true);
      if (isEditing) {
        await adminService.updateProblem(id, payload);
        setSuccessMsg('Problem updated successfully!');
      } else {
        await adminService.createProblem(payload);
        setSuccessMsg('Problem created successfully!');
      }
      setTimeout(() => navigate('/admin/problems'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading problem editor..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232738]">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/problems"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1C2030]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {isEditing ? 'Edit Coding Problem' : 'Create New Coding Problem'}
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-900/30 transition-all hover:scale-105 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Problem</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Problem Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reverse Linked List"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                URL Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="auto-generated-from-title"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-gray-400 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Difficulty *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Function Name *
              </label>
              <input
                type="text"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value.trim())}
                placeholder="e.g. twoSum or reverseList"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Topic Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Array, Hash Table, Two Pointers"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Description (Markdown format) *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Detailed description of the problem, algorithmic requirements, and expected behavior..."
              className="w-full p-3.5 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              required
            />
          </div>
        </div>

        {/* Examples Card */}
        <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Formatted Examples
            </h3>
            <button
              type="button"
              onClick={addExample}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Example</span>
            </button>
          </div>

          {examples.map((ex, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#0F1118] border border-[#232738] space-y-2 relative"
            >
              <button
                type="button"
                onClick={() => removeExample(idx)}
                className="absolute top-3 right-3 text-gray-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-gray-400">Input String</label>
                  <input
                    type="text"
                    value={ex.input}
                    onChange={(e) => updateExample(idx, 'input', e.target.value)}
                    placeholder="nums = [2,7,11,15], target = 9"
                    className="w-full p-2 rounded-lg bg-[#141622] border border-[#232738] text-gray-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Output String</label>
                  <input
                    type="text"
                    value={ex.output}
                    onChange={(e) => updateExample(idx, 'output', e.target.value)}
                    placeholder="[0, 1]"
                    className="w-full p-2 rounded-lg bg-[#141622] border border-[#232738] text-emerald-400 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400">Explanation (Optional)</label>
                <input
                  type="text"
                  value={ex.explanation}
                  onChange={(e) => updateExample(idx, 'explanation', e.target.value)}
                  placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                  className="w-full p-2 rounded-lg bg-[#141622] border border-[#232738] text-gray-300 text-[11px]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sample & Hidden Test Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample Test Cases */}
          <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Sample Test Cases
                </h3>
                <p className="text-[10px] text-gray-500">Visible to students in console</p>
              </div>
              <button
                type="button"
                onClick={addSampleTestCase}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sample</span>
              </button>
            </div>

            {sampleTestCases.map((stc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#0F1118] border border-[#232738] space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeSampleTestCase(idx)}
                  className="absolute top-2.5 right-2.5 text-gray-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="text-xs space-y-1.5 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-gray-500 font-sans">Input arguments:</span>
                    <input
                      type="text"
                      value={stc.input}
                      onChange={(e) => updateSampleTestCase(idx, 'input', e.target.value)}
                      placeholder="[2, 7, 11, 15], 9"
                      className="w-full p-2 rounded-lg bg-[#141622] border border-[#232738] text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-sans">Expected output:</span>
                    <input
                      type="text"
                      value={stc.output}
                      onChange={(e) => updateSampleTestCase(idx, 'output', e.target.value)}
                      placeholder="[0, 1]"
                      className="w-full p-2 rounded-lg bg-[#141622] border border-[#232738] text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Hidden Test Cases
                </h3>
                <p className="text-[10px] text-gray-500">Evaluated on submission & battle</p>
              </div>
              <button
                type="button"
                onClick={addHiddenTestCase}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Hidden</span>
              </button>
            </div>

            {hiddenTestCases.map((htc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#0F1118] border border-[#232738] space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeHiddenTestCase(idx)}
                  className="absolute top-2.5 right-2.5 text-gray-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="text-xs space-y-1.5 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-gray-500 font-sans">Hidden input:</span>
                    <input
                      type="text"
                      value={htc.input}
                      onChange={(e) => updateHiddenTestCase(idx, 'input', e.target.value)}
                      placeholder="[3, 3], 6"
                      className="w-full p-2 rounded-lg bg-[#141622] border border-[#232738] text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-sans">Hidden expected:</span>
                    <input
                      type="text"
                      value={htc.output}
                      onChange={(e) => updateHiddenTestCase(idx, 'output', e.target.value)}
                      placeholder="[0, 1]"
                      className="w-full p-2 rounded-lg bg-[#141622] border border-[#232738] text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Starter Code Templates */}
        <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Starter Code Templates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                JavaScript Template
              </label>
              <textarea
                value={starterJs}
                onChange={(e) => setStarterJs(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl bg-[#0F1118] border border-[#232738] text-gray-200 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Python Template
              </label>
              <textarea
                value={starterPy}
                onChange={(e) => setStarterPy(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl bg-[#0F1118] border border-[#232738] text-gray-200 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/30 flex items-center space-x-2 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Save Changes' : 'Publish Problem'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

