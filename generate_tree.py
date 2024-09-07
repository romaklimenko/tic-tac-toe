# pylint: disable=missing-module-docstring disable=missing-function-docstring

import json
from typing import Dict, List


def create_board() -> List[str]:
    return [' ' for _ in range(9)]


def make_move(board: List[str], position: int, player: str) -> List[str]:
    new_board = board.copy()
    new_board[position] = player
    return new_board


def get_winner(board: List[str]) -> str:
    winning_combinations = [
        (0, 1, 2), (3, 4, 5), (6, 7, 8),  # Rows
        (0, 3, 6), (1, 4, 7), (2, 5, 8),  # Columns
        (0, 4, 8), (2, 4, 6)  # Diagonals
    ]
    for combo in winning_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] != ' ':
            return board[combo[0]]
    return ''


def is_board_full(board: List[str]) -> bool:
    return ' ' not in board


def get_empty_positions(board: List[str]) -> List[int]:
    return [i for i, cell in enumerate(board) if cell == ' ']


def generate_tree(board: List[str], player: str) -> Dict:
    winner = get_winner(board)
    if winner:
        return {
            'board': board,
            'winner': winner,
            'children': [],
            'stats': {
                'X_wins': 1 if winner == 'X' else 0, 'O_wins': 1 if winner == 'O' else 0, 'draws': 0
            }
        }

    if is_board_full(board):
        return {
            'board': board,
            'winner': '',
            'children': [],
            'stats': {'X_wins': 0, 'O_wins': 0, 'draws': 1}
        }

    node = {'board': board, 'winner': '', 'children': [],
            'stats': {'X_wins': 0, 'O_wins': 0, 'draws': 0}}

    for position in get_empty_positions(board):
        new_board = make_move(board, position, player)
        child = generate_tree(new_board, 'O' if player == 'X' else 'X')
        node['children'].append(child)
        node['stats']['X_wins'] += child['stats']['X_wins']
        node['stats']['O_wins'] += child['stats']['O_wins']
        node['stats']['draws'] += child['stats']['draws']

    return node


def generate_tic_tac_toe_tree() -> Dict:
    return generate_tree(create_board(), 'X')


def save_json(data: Dict, filename: str, minimize: bool = False):
    with open(filename, 'w', encoding='utf-8') as f:
        if minimize:
            json.dump(data, f, separators=(',', ':'))
        else:
            json.dump(data, f, indent=2)


# Generate the tree
tree = generate_tic_tac_toe_tree()

# Save formatted JSON
save_json(tree, 'tic-tac-toe.json')

# Save minimized JSON
save_json(tree, 'tic-tac-toe.min.json', minimize=True)

print("Tic-tac-toe tree generated and saved to JSON files.")
