import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { battleService } from '../../services/battleService';
import { problemService } from '../../services/problemService';
import { CodeEditor } from '../../components/editor/CodeEditor';
import { TestCasePanel } from '../../components/editor/TestCasePanel';
import { BattleTimer } from '../../components/battle/BattleTimer';
import { OpponentProgressCard } from '../../components/battle/OpponentProgressCard';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { Loader } from '../../components/common/Loader';
import confetti from 'canvas-confetti';
import {
  Swords,
  Users,
  Copy,
  Check,
  Play,
  Send,
  Crown,
  Trophy,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

export const ActiveBattlePage = () => {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  // Battle state
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Ready states
  const [isReady, setIsReady] = useState(false);

  // Active match state
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [opponentProgress, setOpponentProgress] = useState({});

  // Code editor state
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);

  // Result state
  const [battleResult, setBattleResult] = useState(null);

  const normalizedCode = roomCode?.toUpperCase();

  // 1. Initial HTTP fetch of room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await battleService.getBattleRoom(normalizedCode);
        if (res.success && res.battle) {
          setBattle(res.battle);
          setRemainingSeconds(res.battle.duration || 600);

          if (res.battle.problem) {
            setCode(res.battle.problem.starterCode?.[language] || '');
          }

          if (res.battle.status === 'completed' || res.battle.status === 'draw') {
            setBattleResult({
              winnerId: res.battle.winner?._id,
              winnerUsername: res.battle.winner?.username,
              battle: res.battle,
              reason: res.battle.resultSummary?.reason
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to connect to battle room.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [normalizedCode]);

  // 2. Socket.IO battle room connection & real-time event listeners
  useEffect(() => {
    if (!socket || !isConnected || !normalizedCode) return;

    // Join room on socket namespace
    socket.emit('battle:join', { roomCode: normalizedCode }, (response) => {
      if (response && !response.success) {
        setError(response.message);
      } else if (response && response.battle) {
        setBattle(response.battle);
        if (response.battle.problem && !code) {
          setCode(response.battle.problem.starterCode?.[language] || '');
        }
      }
    });

    // Event: Room state updated (e.g. opponent joined)
    socket.on('battle:state_update', ({ battle: updatedBattle }) => {
      setBattle(updatedBattle);
      if (updatedBattle.problem && !code) {
        setCode(updatedBattle.problem.starterCode?.[language] || '');
      }
    });

    // Event: Ready status updated
    socket.on('battle:ready_status', ({ creatorReady, opponentReady }) => {
      setBattle((prev) => (prev ? { ...prev, creatorReady, opponentReady } : prev));
    });

    // Event: Battle started
    socket.on('battle:started', ({ problem, duration, startTime, endTime }) => {
      setBattle((prev) => ({
        ...prev,
        status: 'in_progress',
        problem,
        duration,
        startTime,
        endTime
      }));
      setRemainingSeconds(duration);
      if (problem?.starterCode?.[language]) {
        setCode(problem.starterCode[language]);
      }
    });

    // Event: Synchronized timer ticks from server
    socket.on('battle:timer_tick', ({ remainingSeconds: s }) => {
      setRemainingSeconds(s);
    });

    // Event: Opponent live progress
    socket.on('battle:opponent_progress', (data) => {
      setOpponentProgress(data);
    });

    // Event: Battle ended
    socket.on('battle:ended', (result) => {
      setBattleResult(result);
      setBattle((prev) => ({
        ...prev,
        status: result.winnerId ? 'completed' : 'draw',
        winner: result.battle?.winner
      }));

      // If current user is the winner, celebrate!
      if (result.winnerId && result.winnerId.toString() === user._id.toString()) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    });

    // Event: Rematch ready
    socket.on('battle:rematch_ready', ({ battle: newBattle }) => {
      setBattle(newBattle);
      setBattleResult(null);
      setRunResults(null);
      setIsReady(false);
      setOpponentProgress({});
      setRemainingSeconds(newBattle.duration || 600);
      if (newBattle.problem?.starterCode?.[language]) {
        setCode(newBattle.problem.starterCode[language]);
      }
    });

    return () => {
      socket.off('battle:state_update');
      socket.off('battle:ready_status');
      socket.off('battle:started');
      socket.off('battle:timer_tick');
      socket.off('battle:opponent_progress');
      socket.off('battle:ended');
      socket.off('battle:rematch_ready');
    };
  }, [socket, isConnected, normalizedCode, user]);

  // Copy shareable link
  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/battle/${normalizedCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Toggle Ready
  const handleToggleReady = () => {
    const nextState = !isReady;
    setIsReady(nextState);
    socket?.emit('battle:ready', { roomCode: normalizedCode, ready: nextState });
  };

  // Creator starts battle
  const handleStartBattle = () => {
    socket?.emit('battle:start', { roomCode: normalizedCode });
  };

  // Run Sample Tests
  const handleRunSampleTests = async () => {
    if (!battle?.problem) return;
    try {
      setIsRunning(true);
      // Emit testing status to opponent
      socket?.emit('battle:progress', {
        roomCode: normalizedCode,
        status: 'testing'
      });

      const res = await problemService.runCode(battle.problem.slug, {
        code,
        language,
        customInput
      });

      if (res.success) {
        setRunResults(res.result);
        // Report partial progress
        socket?.emit('battle:progress', {
          roomCode: normalizedCode,
          status: 'coding',
          testCasesPassed: res.result.testCasesPassed,
          totalTestCases: res.result.totalTestCases
        });
      }
    } catch (err) {
      console.error('Run code error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Final Code for Battle Evaluation
  const handleSubmitBattle = () => {
    if (!code || isSubmitting) return;
    setIsSubmitting(true);

    socket?.emit(
      'battle:submit',
      {
        roomCode: normalizedCode,
        code,
        language
      },
      (res) => {
        setIsSubmitting(false);
        if (res && res.success) {
          setRunResults(res.executionResult);
        } else if (res && !res.success) {
          setError(res.message);
        }
      }
    );
  };

  // Rematch button
  const handleRematch = () => {
    socket?.emit('battle:rematch', { roomCode: normalizedCode });
  };

  if (loading) {
    return <Loader message="Connecting to battle room..." fullScreen />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Battle Error</h2>
        <p className="text-xs text-gray-400">{error}</p>
        <Link
          to="/battle/create"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          <span>Create New Battle</span>
        </Link>
      </div>
    );
  }

  const isCreator = battle?.creator?._id?.toString() === user._id.toString();
  const isOpponent = battle?.opponent && battle.opponent._id?.toString() === user._id.toString();
  const opponentUser = isCreator ? battle?.opponent : battle?.creator;

  // -------------------------------------------------------------
  // VIEW 1: BATTLE RESULT (COMPLETED OR DRAW)
  // -------------------------------------------------------------
  if (battle?.status === 'completed' || battle?.status === 'draw' || battleResult) {
    const isWinner = battleResult?.winnerId?.toString() === user._id.toString();
    const isDraw = !battleResult?.winnerId;

    return (
      <div className="max-w-2xl mx-auto py-8 space-y-8 animate-fade-in text-center">
        {/* Banner */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#181B28] to-[#12141D] border border-[#232738] shadow-2xl space-y-6 overflow-hidden">
          <div
            className={`absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-30 ${
              isWinner ? 'bg-emerald-500' : isDraw ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />

          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-tr from-purple-700 to-indigo-500 shadow-xl shadow-purple-950/40">
            {isWinner ? (
              <Crown className="w-9 h-9 text-amber-300" />
            ) : isDraw ? (
              <Swords className="w-8 h-8 text-white" />
            ) : (
              <Trophy className="w-8 h-8 text-gray-300" />
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {isWinner ? 'Victory!' : isDraw ? 'Battle Draw!' : 'Defeat'}
            </h2>
            <p className="text-xs text-gray-400">
              {isWinner
                ? 'Congratulations! You solved all test cases first and won the battle.'
                : isDraw
                ? 'Time expired with equal test cases passed. Both players earn partial points.'
                : 'Your opponent completed the challenge faster. Keep practicing!'}
            </p>
          </div>

          {/* Both Players Result Comparison */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Creator */}
            <div
              className={`p-4 rounded-2xl border ${
                battleResult?.winnerId?.toString() === battle?.creator?._id?.toString()
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-[#0F1118] border-[#232738]'
              }`}
            >
              <img
                src={battle?.creator?.avatar}
                alt={battle?.creator?.username}
                className="w-10 h-10 rounded-xl mx-auto mb-2 border border-[#232738]"
              />
              <p className="text-xs font-bold text-white truncate">{battle?.creator?.name}</p>
              <p className="text-[10px] text-gray-500">@{battle?.creator?.username}</p>
              <span className="inline-block mt-2 text-xs font-bold text-purple-400">
                {battleResult?.winnerId?.toString() === battle?.creator?._id?.toString()
                  ? '+100 ELO'
                  : isDraw
                  ? '+25 ELO'
                  : '-25 ELO'}
              </span>
            </div>

            {/* Opponent */}
            <div
              className={`p-4 rounded-2xl border ${
                battleResult?.winnerId?.toString() === battle?.opponent?._id?.toString()
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-[#0F1118] border-[#232738]'
              }`}
            >
              <img
                src={battle?.opponent?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=opp`}
                alt={battle?.opponent?.username}
                className="w-10 h-10 rounded-xl mx-auto mb-2 border border-[#232738]"
              />
              <p className="text-xs font-bold text-white truncate">
                {battle?.opponent?.name || 'Opponent'}
              </p>
              <p className="text-[10px] text-gray-500">@{battle?.opponent?.username}</p>
              <span className="inline-block mt-2 text-xs font-bold text-purple-400">
                {battleResult?.winnerId?.toString() === battle?.opponent?._id?.toString()
                  ? '+100 ELO'
                  : isDraw
                  ? '+25 ELO'
                  : '-25 ELO'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRematch}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-purple-900/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch</span>
            </button>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1C2030] hover:bg-[#232738] border border-[#2A2E42] text-gray-200 font-semibold text-xs transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: WAITING LOBBY (BEFORE MATCH STARTS)
  // -------------------------------------------------------------
  if (battle?.status === 'waiting') {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Swords className="w-3.5 h-3.5 text-purple-400" />
            <span>1v1 Battle Lobby</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Match Preparation</h1>
          <p className="text-xs text-gray-400">
            Share the invite link with your friend. When both players are ready, the match begins!
          </p>
        </div>

        {/* Room Code & Share Card */}
        <div className="p-5 rounded-2xl bg-[#141622] border border-[#232738] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Battle Room Code</span>
            <div className="text-2xl font-mono font-black text-purple-300 tracking-widest">
              {normalizedCode}
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1C2030] hover:bg-[#232738] border border-[#2A2E42] text-xs font-semibold text-white flex items-center justify-center space-x-2 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-purple-400" />
                <span>Copy Shareable URL</span>
              </>
            )}
          </button>
        </div>

        {/* Match Settings Info */}
        <div className="grid grid-cols-2 gap-4 text-xs font-medium">
          <div className="p-3.5 rounded-xl bg-[#0F1118] border border-[#232738] flex items-center justify-between">
            <span className="text-gray-400">Difficulty:</span>
            <DifficultyBadge difficulty={battle.difficulty} />
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F1118] border border-[#232738] flex items-center justify-between">
            <span className="text-gray-400">Match Duration:</span>
            <span className="text-white font-mono">{Math.floor(battle.duration / 60)} Minutes</span>
          </div>
        </div>

        {/* Both Participants Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creator Player Card */}
          <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-4 text-center relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
              Room Host
            </span>
            <img
              src={battle.creator.avatar}
              alt={battle.creator.name}
              className="w-20 h-20 rounded-2xl mx-auto bg-[#0F1118] border border-[#232738] object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-white">{battle.creator.name}</h3>
              <p className="text-xs text-gray-500">@{battle.creator.username}</p>
              <p className="text-xs text-purple-400 font-semibold mt-1">
                {battle.creator.rating} ELO Rating
              </p>
            </div>

            <div className="pt-2">
              {battle.creatorReady ? (
                <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Ready for Battle
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Waiting to Ready
                </span>
              )}
            </div>
          </div>

          {/* Opponent Player Card */}
          <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] space-y-4 text-center relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
              Challenger
            </span>

            {battle.opponent ? (
              <>
                <img
                  src={battle.opponent.avatar}
                  alt={battle.opponent.name}
                  className="w-20 h-20 rounded-2xl mx-auto bg-[#0F1118] border border-[#232738] object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{battle.opponent.name}</h3>
                  <p className="text-xs text-gray-500">@{battle.opponent.username}</p>
                  <p className="text-xs text-indigo-400 font-semibold mt-1">
                    {battle.opponent.rating} ELO Rating
                  </p>
                </div>

                <div className="pt-2">
                  {battle.opponentReady ? (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Ready for Battle
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5 mr-1.5" /> Waiting to Ready
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="py-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl mx-auto bg-[#0F1118] border-2 border-dashed border-[#232738] flex items-center justify-center text-gray-600">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-semibold text-gray-400">Waiting for Opponent...</h4>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  Send your friend the room URL or code above to enter this match lobby.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ready & Start Action Bar */}
        <div className="p-6 rounded-2xl bg-[#141622] border border-[#232738] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleToggleReady}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isReady
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-[#1C2030] hover:bg-[#232738] text-gray-200 border border-[#2A2E42]'
            }`}
          >
            {isReady ? '✓ You Are Ready' : 'Click When Ready'}
          </button>

          {isCreator ? (
            <button
              onClick={handleStartBattle}
              disabled={!battle.opponent}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              <span>Start 1v1 Battle Now</span>
            </button>
          ) : (
            <p className="text-xs text-gray-400">
              Waiting for the host ({battle.creator.name}) to launch the battle...
            </p>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: ACTIVE 1V1 BATTLE ARENA (IN PROGRESS)
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-[1700px] mx-auto space-y-3 animate-fade-in">
      {/* Active Battle Arena Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#232738] gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center space-x-2">
              <span>{battle.problem?.title || 'Competitive Problem'}</span>
              <DifficultyBadge difficulty={battle.difficulty} />
            </h1>
            <p className="text-[11px] text-gray-400 font-mono">
              ROOM #{normalizedCode} • 1v1 Live Match
            </p>
          </div>
        </div>

        {/* Timer & Buttons */}
        <div className="flex items-center space-x-3">
          <BattleTimer remainingSeconds={remainingSeconds} />

          <button
            onClick={handleRunSampleTests}
            disabled={isRunning || isSubmitting}
            className="px-3.5 py-1.5 rounded-xl bg-[#1C2030] hover:bg-[#232738] border border-[#2A2E42] text-xs font-semibold text-gray-200 flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
            )}
            <span>Run Tests</span>
          </button>

          <button
            onClick={handleSubmitBattle}
            disabled={isRunning || isSubmitting}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center space-x-1.5 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Main Split Arena */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Column: Opponent Progress + Problem Statement */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-3 min-h-0 overflow-hidden">
          {/* Opponent Real-time Live Progress Bar Card */}
          <div className="shrink-0">
            <OpponentProgressCard opponent={opponentUser} progress={opponentProgress} />
          </div>

          {/* Problem Statement Card */}
          <div className="flex-1 p-5 rounded-2xl bg-[#141622] border border-[#232738] overflow-y-auto space-y-5 text-xs text-gray-300">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Problem Statement</span>
              </h3>
              <div className="whitespace-pre-line text-gray-300 leading-relaxed font-sans">
                {battle.problem?.description}
              </div>
            </div>

            {/* Examples */}
            {battle.problem?.examples?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Examples
                </h4>
                {battle.problem.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0F1018] border border-[#232738] font-mono text-[11px] space-y-1"
                  >
                    <p className="text-gray-400">
                      <span className="text-gray-500">Input: </span>
                      {ex.input}
                    </p>
                    <p className="text-emerald-400">
                      <span className="text-gray-500">Output: </span>
                      {ex.output}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {battle.problem?.constraints?.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Constraints
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-400 font-mono text-[11px]">
                  {battle.problem.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor + Test Results Drawer */}
        <div className="lg:col-span-7 flex flex-col h-full space-y-3 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-[320px]">
            <CodeEditor
              code={code}
              onChange={(newCode) => setCode(newCode || '')}
              language={language}
              onLanguageChange={(l) => {
                setLanguage(l);
                if (battle.problem?.starterCode?.[l]) {
                  setCode(battle.problem.starterCode[l]);
                }
              }}
              onResetStarter={() => {
                if (battle.problem?.starterCode?.[language]) {
                  setCode(battle.problem.starterCode[language]);
                }
              }}
              height="100%"
            />
          </div>

          <div className="h-60 shrink-0">
            <TestCasePanel
              sampleTestCases={battle.problem?.sampleTestCases || []}
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              runResults={runResults}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

