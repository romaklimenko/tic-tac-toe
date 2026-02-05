import { Cell } from './Cell';
import type { GameData, Player } from '../types';

interface BoardProps {
    board: string;
    data: GameData | null;
    onPlay: (index: number) => void;
    turn: Player;
}

export function Board({ board, data, onPlay, turn }: BoardProps) {
    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-white/10 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 w-full max-w-[min(100%,calc(100vh-20rem))] aspect-square">
            {board.split('').map((cell, index) => (
                <Cell
                    key={index}
                    index={index}
                    value={cell}
                    stats={data?.moves?.[index]}
                    turn={turn}
                    onClick={() => onPlay(index)}
                />
            ))}
        </div>
    );
}
