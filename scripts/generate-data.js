import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public/data');
// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Memoization cache: boardString -> stats
const cache = new Map();
// Cache for optimal move (minimax value) - optional, but user asked for optimal AI
const minimaxCache = new Map();

function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6]             // diags
    ];

    for (const [a, b, c] of lines) {
        if (board[a] !== '-' && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (!board.includes('-')) return 'draw';
    return null;
}

function getStats(board, turn) {
    if (cache.has(board)) return cache.get(board);

    const winner = checkWinner(board);

    if (winner === 'x') {
        const res = { x: 1, o: 0, draw: 0, isTerminal: true, winner: 'x' };
        saveState(board, turn, res, {});
        cache.set(board, res);
        return res;
    }
    if (winner === 'o') {
        const res = { x: 0, o: 1, draw: 0, isTerminal: true, winner: 'o' };
        saveState(board, turn, res, {});
        cache.set(board, res);
        return res;
    }
    if (winner === 'draw') {
        const res = { x: 0, o: 0, draw: 1, isTerminal: true, winner: 'draw' };
        saveState(board, turn, res, {});
        cache.set(board, res);
        return res;
    }

    const nextTurn = turn === 'x' ? 'o' : 'x';
    const moves = {};
    let total = { x: 0, o: 0, draw: 0, isTerminal: false, winner: null };

    for (let i = 0; i < 9; i++) {
        if (board[i] === '-') {
            // Create next board
            const nextBoard = board.substring(0, i) + turn + board.substring(i + 1);
            const childStats = getStats(nextBoard, nextTurn);

            // Accumulate counts (path counting)
            total.x += childStats.x;
            total.o += childStats.o;
            total.draw += childStats.draw;

            // Store move stats
            moves[i] = childStats;
        }
    }

    saveState(board, turn, total, moves);
    cache.set(board, total);
    return total;
}

function minimax(board, turn, depth) {
    const winner = checkWinner(board);
    if (winner === 'x') return { score: 10 - depth };
    if (winner === 'o') return { score: depth - 10 };
    if (winner === 'draw') return { score: 0 };

    // Simple minimax for optimality check (redundant if we have counts? No, counts != optimality)
    // Counts give "probability if playing randomly". Optimality is different.
    // The user wants: "AI should play optimally".
    // So we should ALSO include optimal move info or score in the JSON?
    // Or we can deduce it. 
    // Let's just store the minimax score in the JSON too for AI lookup.
}

// Enhanced save with MiniMax scores? 
// The user request: "The AI should play optimally, meaning it should always make the move that maximizes its probability of winning."
// Minimizing loss if p(win)=0.
// Let's integrate basic minimax score into the data.
// Score: +10 for X win, -10 for O win, 0 for draw. Adjusted by depth to prefer faster wins.

function getMinimax(board, turn, alpha = -Infinity, beta = Infinity, depth = 0) {
    const cacheKey = board; // Minimax might depend on depth? No, pure value.
    // Actually depth matters for preference.
    // Let's just do a simple search for each node since state space is small.

    const winner = checkWinner(board);
    if (winner === 'x') return 10 - depth;
    if (winner === 'o') return -10 + depth;
    if (winner === 'draw') return 0;

    const isMaximizing = turn === 'x';
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '-') {
            const nextBoard = board.substring(0, i) + turn + board.substring(i + 1);
            const score = getMinimax(nextBoard, turn === 'x' ? 'o' : 'x', alpha, beta, depth + 1);

            if (isMaximizing) {
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, score);
            } else {
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, score);
            }
            if (beta <= alpha) break;
        }
    }
    return bestScore;
}


function saveState(board, turn, stats, moves) {
    // Add minimax score for AI
    // We compute 'bestMove' or just scores for all moves.
    // To play optimally, we need the score of each move.
    // So let's add `minimaxScore` to each move in `moves`.

    const enhancedMoves = {};
    for (const idx in moves) {
        const moveIndex = parseInt(idx);
        const nextBoard = board.substring(0, moveIndex) + turn + board.substring(moveIndex + 1);
        const score = getMinimax(nextBoard, turn === 'x' ? 'o' : 'x');
        enhancedMoves[idx] = {
            ...moves[idx],
            score: score
        };
    }

    const data = {
        board,
        turn,
        ...stats,
        moves: enhancedMoves
    };

    fs.writeFileSync(path.join(OUT_DIR, `${board}.json`), JSON.stringify(data));
}


console.log('Generating game states...');
const startBoard = '---------';
getStats(startBoard, 'x');
console.log('Done. Generated ' + cache.size + ' states.');
