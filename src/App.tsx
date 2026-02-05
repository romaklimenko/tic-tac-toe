import { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import type { Player } from './types';
import { useGameState } from './hooks/useGameState';

function App() {
  const [board, setBoard] = useState('---------');
  const [mode, setMode] = useState<'PvP' | 'PvAI'>('PvAI');
  const [turn, setTurn] = useState<Player>('x');
  const { data, loading } = useGameState(board);

  // Reset Game
  const resetGame = () => {
    setBoard('---------');
    setTurn('x');
  };

  const handleModeChange = (newMode: 'PvP' | 'PvAI') => {
    setMode(newMode);
    resetGame();
  };

  const playMove = useCallback((index: number) => {
    if (board[index] !== '-' || (data && data.isTerminal)) return;

    const newBoard = board.substring(0, index) + turn + board.substring(index + 1);
    setBoard(newBoard);
    setTurn(turn === 'x' ? 'o' : 'x');
  }, [board, turn, data]);

  // AI Logic
  useEffect(() => {
    if (mode === 'PvAI' && turn === 'o' && data && !data.isTerminal && !loading) {
      const timer = setTimeout(() => {
        let bestMove = -1;
        const availableMoves = Object.entries(data.moves);
        let bestVal = Infinity; // O minimizes

        availableMoves.forEach(([idx, moveStat]) => {
          if (typeof moveStat.score === 'number') {
            if (moveStat.score < bestVal) {
              bestVal = moveStat.score;
              bestMove = parseInt(idx);
            }
          }
        });

        if (bestMove !== -1) {
          playMove(bestMove);
        } else {
          const bestMoves = availableMoves
            .filter(([, s]) => s.score === bestVal)
            .map(([i]) => parseInt(i));

          if (bestMoves.length > 0) {
            const randomBest = bestMoves[Math.floor(Math.random() * bestMoves.length)];
            playMove(randomBest);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mode, turn, data, loading, playMove]);

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 md:p-8 font-sans text-white overflow-hidden">
      <div className="w-full h-full flex flex-col items-center gap-2 max-w-2xl">

        {/* Game Container */}
        <div className="bg-white/5 p-3 sm:p-4 md:p-6 rounded-2xl shadow-xl backdrop-blur-xl border border-white/10 w-full flex flex-col items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-h-0">

          {/* Controls */}
          <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-2 pb-2 flex-shrink-0">
            <div className="flex items-center gap-3 bg-black/20 p-1.5 rounded-xl">
              <button
                onClick={() => handleModeChange('PvAI')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${mode === 'PvAI' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Vs AI
              </button>
              <button
                onClick={() => handleModeChange('PvP')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${mode === 'PvP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                PvP
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400 font-mono bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                TURN: <span className={turn === 'x' ? 'text-blue-400' : 'text-rose-400'}>{turn.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Board */}
          <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
            <Board board={board} data={data} onPlay={playMove} turn={turn} />

            {data?.isTerminal && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl animate-fade-in">
                <div className="bg-white text-gray-900 px-8 py-4 rounded-2xl shadow-2xl transform scale-110 flex flex-col items-center gap-2">
                  <span className="text-2xl font-bold">
                    {data.winner === 'draw' ? "It's a Draw!" : `Player ${data.winner?.toUpperCase()} Wins!`}
                  </span>
                  <button
                    onClick={resetGame}
                    className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer / Stats */}
          <div className="w-full text-center space-y-2 pt-2 sm:pt-3 md:pt-4 flex-shrink-0">
            <div className="text-sm text-gray-400">
              Hover over valid moves to see win probabilities
            </div>
            <div className="flex justify-center gap-6 text-xs font-mono uppercase tracking-widest text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500/50"></span> Win
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500/50"></span> Draw
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/50"></span> Lose
              </div>
            </div>
          </div>

        </div>

        {/* Reset (Bottom) */}
        {!data?.isTerminal && (
          <button
            onClick={resetGame}
            className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-white/5 px-4 py-2 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
