import type { MoveStats, Player } from '../types';

interface CellProps {
    index: number;
    value: string;
    stats?: MoveStats;
    onClick: () => void;
    turn: Player;
}

export function Cell({ value, stats, onClick, turn }: CellProps) {
    const isFilled = value !== '-';

    // Calculate stats
    let bgColor = 'bg-white/50'; // Default semi-transparent white
    // Removed unused opacity variable

    if (!isFilled && stats) {
        const total = stats.x + stats.o + stats.draw;
        if (total > 0) {
            const winCount = turn === 'x' ? stats.x : stats.o;
            const loseCount = turn === 'x' ? stats.o : stats.x;

            const winRate = winCount / total;
            const loseRate = loseCount / total;
            const drawRate = stats.draw / total;

            const score = winRate - loseRate; // Range -1 to 1

            // Higher opacity for stronger certainty
            const certainty = Math.max(winRate, loseRate, drawRate);
            const applyOpacity = 0.4 + (certainty * 0.5); // base opacity + scaled

            if (score > 0.1) {
                // Greenish (Winning)
                bgColor = `rgba(34, 197, 94, ${applyOpacity})`; // green-500
            } else if (score < -0.1) {
                // Reddish (Losing)
                bgColor = `rgba(239, 68, 68, ${applyOpacity})`; // red-500
            } else {
                // Yellowish (Draw/Uncertain)
                bgColor = `rgba(234, 179, 8, ${applyOpacity})`; // yellow-500
            }
        }
    }

    return (
        <button
            className={`
        w-full aspect-square
        border-2 border-white/20
        text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold
        flex items-center justify-center
        transition-all duration-300 relative group
        rounded-xl shadow-sm backdrop-blur-sm z-10 hover:z-20
        ${isFilled
                    ? 'cursor-default bg-white/80'
                    : 'cursor-pointer hover:scale-[1.02] active:scale-95'
                }
      `}
            style={{ backgroundColor: !isFilled && stats ? bgColor : undefined }}
            onClick={onClick}
            disabled={isFilled}
        >
            {isFilled && (
                <span className={`
            drop-shadow-sm
            ${value === 'x' ? 'text-indigo-600' : 'text-rose-500'}
            animate-bounce-in
        `}>
                    {value.toUpperCase()}
                </span>
            )}

            {!isFilled && stats && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-2 opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-200 w-[200px]">
                    <div className="bg-gray-900/90 text-white text-xs sm:text-sm p-3 rounded-lg shadow-xl text-center backdrop-blur-md border border-gray-700">
                        <div className="font-semibold mb-1">Outcomes</div>
                        <div className="flex gap-3 justify-center">
                            <span className="text-green-400">W: {stats[turn]}</span>
                            <span className="text-red-400">L: {stats[turn === 'x' ? 'o' : 'x']}</span>
                            <span className="text-yellow-400">D: {stats.draw}</span>
                        </div>
                    </div>
                </div>
            )}
        </button>
    );
}
