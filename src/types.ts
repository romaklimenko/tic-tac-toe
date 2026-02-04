export type Player = 'x' | 'o';
export type CellValue = Player | '-';
export type BoardString = string;

export interface Stats {
    x: number;
    o: number;
    draw: number;
    isTerminal: boolean;
    winner: Player | 'draw' | null;
}

export interface MoveStats extends Stats {
    score?: number;
}

export interface GameData extends Stats {
    board: BoardString;
    turn: Player;
    moves: Record<string, MoveStats>;
}
