import React, { useState } from 'react';
// import logo from './logo.svg';
import './App.css';
// import './globals.css';

const BOARD_SIZE = 3;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
type Player = 'X' | 'O' | null;
const initialBoard: Player[] = Array(CELL_COUNT).fill(null);

function App() {
  const [board, setBoard] = useState<Player[]>(initialBoard);
  const [isXPlaying, setIsXPlaying] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [hasPlaced, setHasPlaced] = useState<boolean>(false);
  const [takeoverOptions, setTakeoverOptions] = useState<number[]>([]);
  const [hasAttacked, setHasAttacked] = useState<boolean>(false);

  const currentPlayer: Player = isXPlaying ? 'X' : 'O';
  const winner = calculateWinner(board);

  // handle click on the board
  const handleClick = (index: number) => {
    if (winner || board[index]) return;

    if (!hasAttacked) {
      if (hasPlaced) {
        return;
      }
      // Place initial token before attack
      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);
      setHasPlaced(true);
      return;
    }

    // After attack, allow multiple takeovers on destroyed spots
    if (takeoverOptions.includes(index)) {
      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      const remaining = takeoverOptions.filter(i => i !== index);
      setBoard(newBoard);
      setTakeoverOptions(remaining);
    }
  };

  const rotateBoard = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const endTurn = () => {
    setHasAttacked(false);
    setHasPlaced(false);
    setIsXPlaying(!isXPlaying);
    setTakeoverOptions([]);
  }

  const resetGame = () => {
    setBoard(initialBoard);
    setIsXPlaying(true);
    setRotation(0);
    setTakeoverOptions([]);
    setHasAttacked(false);
    setHasPlaced(false);
  };

  const getAttackOffset = (rotation: number): number => {
    switch (rotation) {
      case 0: return BOARD_SIZE;       // Down
      case 90: return 1;              // Left
      case 180: return -BOARD_SIZE;    // Up
      case 270: return -1;              // Right
      default: return BOARD_SIZE;
    }
  };

  const isValidAttackTarget = (i: number, target: number, rotation: number): boolean => {
    if (target < 0 || target >= CELL_COUNT) return false;
    if (rotation === 90 && i % BOARD_SIZE === 0 - 1) return false;
    if (rotation === 270 && i % BOARD_SIZE === BOARD_SIZE) return false;
    return true;
  };

  const attack = () => {
    if (winner || hasAttacked) return;

    const offset = getAttackOffset(rotation);
    const newBoard = [...board];
    const destroyed: number[] = [];

    for (let i = 0; i < board.length; i++) {
      if (board[i] === currentPlayer) {
        const target = i + offset;
        if (
          isValidAttackTarget(i, target, rotation) &&
          newBoard[target] &&
          newBoard[target] !== currentPlayer
        ) {
          newBoard[target] = null;
          destroyed.push(target);
        }
      }
    }

    setBoard(newBoard);
    setHasAttacked(true);
    setTakeoverOptions(destroyed);
  };

  return (
    <div className="App">
      <h1>Tic-Hect-4</h1>
      <h3>By Leonardo</h3>
      <h2>Turn: {currentPlayer}</h2>
      <p className="instructions">
        <div className="instruction">{hasPlaced ? '1. ✅ Place your token on the board' : '1. Place your token on the board'}</div>
        <div className="instruction">{'2. Rotate the board at any time'}</div>
        <div className="instruction">{hasAttacked ? '3. ✅ Attack enemy token(s) below your tokens' : '3. (Optional) Attack enemy token(s) below your tokens'}</div>
        <div className="instruction">{'4. (Optional) Click on destroyed token spaces to take them over'}</div>
        <div className="instruction">{'5. End your turn to allow the other player to play'}</div>
      </p>
      <div className="controls">
        <button onClick={rotateBoard}>Rotate Board</button>
        <button onClick={attack} disabled={!!winner || hasAttacked || !hasPlaced}>
          Attack
        </button>
        <button onClick={endTurn} disabled={!!winner || !hasPlaced}>
          End Turn
        </button>
        <button onClick={resetGame}>Reset Game</button>
      </div>

      <div
        className="board"
        style={{
          transform: `rotate(${rotation}deg)`,
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 100px)`
        }}
      >
        {board.map((value, index) => (
          <div
            key={index}
            className={`cell ${takeoverOptions.includes(index) ? 'highlight' : ''}`}
            onClick={() => handleClick(index)}
          >
            {value}
          </div>
        ))}
      </div>

      {winner && <h2>Winner: {winner}</h2>}
      {!winner && board.every(Boolean) && <h2>It's a draw!</h2>}
    </div>
  );
}

export default App;




function calculateWinner(squares: Player[]) {
  const size = 3;
  const visited = new Set<number>();

  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
  ];

  const getIndex = (r: number, c: number) => r * size + c;

  const dfs = (r: number, c: number, player: Player): number => {
    const stack: [number, number][] = [[r, c]];
    let count = 0;

    while (stack.length > 0) {
      const [row, col] = stack.pop()!;
      const idx = getIndex(row, col);
      if (
        row < 0 || row >= size ||
        col < 0 || col >= size ||
        visited.has(idx) ||
        squares[idx] !== player
      ) continue;

      visited.add(idx);
      count++;

      for (const [dr, dc] of directions) {
        stack.push([row + dr, col + dc]);
      }
    }

    return count;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      const player: Player = squares[idx];
      if (player && !visited.has(idx)) {
        if (dfs(r, c, player) >= 4) return player;
      }
    }
  }

  return null;
}