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
        <div className="grid grid-cols-3 gap-1 bg-gray-300 p-1 rounded-lg">
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
