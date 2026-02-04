import { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import type { Player } from './types';
import { useGameState } from './hooks/useGameState';

function App() {
  const [board, setBoard] = useState('---------');
  const [mode, setMode] = useState<'PvP' | 'PvAI'>('PvAI'); // Default to AI mode
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
      // Simple timeout for realism
      const timer = setTimeout(() => {
        let bestMove = -1;

        // Find best move based on score
        // data.moves is Record<string, MoveStats>
        // Check all available moves
        const availableMoves = Object.entries(data.moves);

        // If optimal play: choose max score (for O, we want to minimize if score was global, 
        // but let's check how we stored score in generator.
        // Generator: win='x' -> 10-depth. win='o' -> -10+depth.
        // If turn is 'o', 'o' is minimizing player in standard minimax if score is always from X perspective.
        // My generator: 
        //   isMaximizing = turn === 'x';
        //   return bestScore;
        // So the returned score for a state is ALWAYS relative to the maximizer of that subtree?
        // Wait, minimax function: 
        //   if winner='x' return 10. if winner='o' return -10.
        //   So Positive = X wins. Negative = O wins.
        // So O should minimize the score.

        // However, I stored `score` in `moves[i]` by calling `getMinimax(nextBoard, nextTurn)`.
        // `getMinimax` returns the value of the board state.
        // If nextBoard is advantageous for O, score should be negative.
        // So O should pick the move with the LOWEST score.

        let bestVal = Infinity; // O minimizes

        availableMoves.forEach(([idx, moveStat]) => {
          // We need the raw score. 
          // In generate-data: enhancedMoves[idx] = { ...childStats, score: score }
          // So moveStat.score is the minimax value of the RESULTING state.
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
          // Fallback if no score (shouldn't happen) or random if equal
          // Pick random from best moves?
          // Ideally we filter moves with score === bestVal
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Tic Tac Toe Probability</h1>

      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between mb-6">
          <div className="text-lg font-semibold">
            Mode:
            <select
              value={mode}
              onChange={(e) => handleModeChange(e.target.value as 'PvP' | 'PvAI')}
              className="ml-2 border border-gray-300 rounded p-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PvAI">Player vs AI</option>
              <option value="PvP">Player vs Player</option>
            </select>
          </div>
          <button
            onClick={resetGame}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition-colors"
          >
            Reset Game
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <Board board={board} data={data} onPlay={playMove} turn={turn} />
        </div>

        <div className="text-center h-8">
          {loading ? (
            <span className="text-gray-400">Loading probabilities...</span>
          ) : data?.isTerminal ? (
            <span className="text-xl font-bold">
              {data.winner === 'draw' ? "It's a Draw!" : `Player ${data.winner?.toUpperCase()} Wins!`}
            </span>
          ) : (
            <span className="text-gray-600">
              Current Turn: <span className="font-bold">{turn.toUpperCase()}</span>
            </span>
          )}
        </div>

        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>Hover over empty cells to see Win/Loss/Draw counts.</p>
          <p>Colors indicate outcome probability from current player's perspective.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
