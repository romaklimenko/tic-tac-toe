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
    let bgColor = 'bg-white';
    let tooltip = '';
    let opacity = 0;

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
            opacity = 0.3 + (certainty * 0.5); // base opacity + scaled

            if (score > 0.1) {
                // Greenish (Winning)
                bgColor = `rgba(34, 197, 94, ${opacity})`; // green-500
            } else if (score < -0.1) {
                // Reddish (Losing)
                bgColor = `rgba(239, 68, 68, ${opacity})`; // red-500
            } else {
                // Yellowish (Draw/Uncertain)
                bgColor = `rgba(234, 179, 8, ${opacity})`; // yellow-500
            }

            tooltip = `Win: ${stats[turn]} | Lose: ${stats[turn === 'x' ? 'o' : 'x']} | Draw: ${stats.draw}`;
        }
    }

    return (
        <button
            className={`
        w-24 h-24 border-2 border-gray-200 text-4xl font-bold flex items-center justify-center
        transition-colors relative group
        ${isFilled ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100'}
      `}
            style={{ backgroundColor: !isFilled && stats ? bgColor : undefined }}
            onClick={onClick}
            disabled={isFilled}
            title={tooltip}
        >
            {isFilled && (
                <span className={value === 'x' ? 'text-blue-600' : 'text-red-600'}>
                    {value.toUpperCase()}
                </span>
            )}

            {!isFilled && stats && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <div className="bg-black/80 text-white text-xs p-1 rounded z-10 whitespace-nowrap">
                        {tooltip}
                    </div>
                </div>
            )}
        </button>
    );
}
