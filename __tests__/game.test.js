/**
 * Unit tests for MancalaGame
 */

// Mock DOM elements
document.body.innerHTML = `
<div id="status-message"></div>
<button id="reset-button"></button>
<button id="rules-button"></button>
<div id="player-store"></div>
<div id="cpu-store"></div>
<div id="welcome-modal"></div>
<div id="rules-modal"></div>
<button id="start-game-button"></button>
<div class="close-button"></div>
<div class="close-modal-button"></div>
<div id="debug-log"></div>
<button id="toggle-debug"></button>
`;

// Create player and CPU pits
for (let i = 0; i < 6; i++) {
  const playerPit = document.createElement('div');
  playerPit.className = 'player-pit';
  playerPit.id = `pit-${i}`;
  const stonesCount = document.createElement('div');
  stonesCount.className = 'stones-count';
  playerPit.appendChild(stonesCount);
  document.body.appendChild(playerPit);
  
  const cpuPit = document.createElement('div');
  cpuPit.className = 'cpu-pit';
  cpuPit.id = `pit-${12 - i}`;
  const cpuStonesCount = document.createElement('div');
  cpuStonesCount.className = 'stones-count';
  cpuPit.appendChild(cpuStonesCount);
  document.body.appendChild(cpuPit);
}

// Add store elements
const playerStoreCount = document.createElement('div');
playerStoreCount.className = 'store-count';
document.getElementById('player-store').appendChild(playerStoreCount);

const cpuStoreCount = document.createElement('div');
cpuStoreCount.className = 'store-count';
document.getElementById('cpu-store').appendChild(cpuStoreCount);

// Import the MancalaGame class
const originalCode = require('../src/game.js');

// Extract the class from the source file
const gameCode = originalCode.replace(
  /document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*new MancalaGame\(\);\s*\}\);/,
  ''
);
eval(gameCode);

describe('MancalaGame', () => {
  let game;
  
  beforeEach(() => {
    // Clear any existing DOM elements that might have been added
    document.querySelectorAll('.stone').forEach(el => el.remove());
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh instance for each test
    game = new MancalaGame();
    
    // Disable animations for testing
    game.animationSpeed = 0;
    game.cpuThinkingTime = 0;
    
    // Reset game to ensure clean state
    game.resetGame();
  });
  
  describe('Game initialization', () => {
    test('should initialize with correct board state', () => {
      // Initial board setup: 4 stones in each pit, 0 in stores
      const expectedInitialBoard = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      expect(game.board).toEqual(expectedInitialBoard);
    });
    
    test('should set player as starting player', () => {
      expect(game.currentPlayer).toBe('player');
    });
    
    test('game should not be over at start', () => {
      expect(game.gameOver).toBe(false);
    });
  });
  
  describe('checkGameOver', () => {
    test('should return false when game is not over', () => {
      // Default board state has stones in all pits
      expect(game.checkGameOver()).toBe(false);
    });
    
    test('should return true when player side is empty', () => {
      // Set all player pits to 0
      game.board = [0, 0, 0, 0, 0, 0, 10, 4, 4, 4, 4, 4, 4, 10];
      expect(game.checkGameOver()).toBe(true);
    });
    
    test('should return true when CPU side is empty', () => {
      // Set all CPU pits to 0
      game.board = [4, 4, 4, 4, 4, 4, 10, 0, 0, 0, 0, 0, 0, 10];
      expect(game.checkGameOver()).toBe(true);
    });
  });
  
  describe('sowStones', () => {
    test('should distribute stones correctly', () => {
      // Set up a specific board state
      game.board = [6, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Sow stones from pit 0 (6 stones)
      game.sowStones(0, 'player');
      
      // Expected board after sowing:
      // - Pit 0 should be empty
      // - Stones should be distributed to pits 1-5 and player store
      const expectedBoard = [0, 5, 5, 5, 5, 5, 1, 4, 4, 4, 4, 4, 4, 0];
      expect(game.board).toEqual(expectedBoard);
    });
    
    test('should skip opponent store when sowing', () => {
      // Set up a specific board state where stones would reach the opponent's store
      game.board = [13, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Sow stones from pit 0 (13 stones)
      game.sowStones(0, 'player');
      
      // Verify the CPU store (index 13) was skipped
      expect(game.board[13]).toBe(0);
    });
    
    test('should give extra turn when last stone lands in player\'s store', () => {
      // Set up a board state where the last stone lands in the player's store
      game.board = [6, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Sow stones from pit 0 (6 stones)
      const result = game.sowStones(0, 'player');
      
      // Should return true (extra turn)
      expect(result).toBe(true);
    });
    
    test('should not give extra turn when last stone doesn\'t land in player\'s store', () => {
      // Set up a board state where the last stone doesn't land in the player's store
      game.board = [3, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Sow stones from pit 0 (3 stones)
      const result = game.sowStones(0, 'player');
      
      // Should return false (no extra turn)
      expect(result).toBe(false);
    });
    
    test('should capture opponent stones when last stone lands in empty pit on player side', () => {
      // Setup board where player can make a capture
      // Player's pit 2 is empty, and opposite CPU pit has stones
      game.board = [4, 1, 0, 4, 4, 4, 0, 4, 4, 4, 5, 4, 4, 0];
      
      // Move from pit 1, which has 1 stone, landing in empty pit 2
      game.sowStones(1, 'player');
      
      // Expected result: stones from opposite pit (10) and the capturing stone should be in player's store
      expect(game.board[2]).toBe(0); // Landing pit should be empty after capture
      expect(game.board[10]).toBe(0); // Opposite pit should be empty after capture
      expect(game.board[6]).toBe(6); // Player's store should have 6 stones (5 captured + 1 capturing)
    });
  });
  
  describe('makeMove', () => {
    test('should not allow move when game is over', () => {
      // Set game as over
      game.gameOver = true;
      
      // Try to make a move
      game.makeMove(0);
      
      // Board should remain unchanged
      expect(game.board).toEqual([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
    });
    
    test('should not allow move when it\'s not player\'s turn', () => {
      // Set current player to CPU
      game.currentPlayer = 'cpu';
      
      // Try to make a move
      game.makeMove(0);
      
      // Board should remain unchanged
      expect(game.board).toEqual([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
    });
    
    test('should not allow move from empty pit', () => {
      // Set a pit to empty
      game.board[0] = 0;
      
      // Try to make a move from empty pit
      game.makeMove(0);
      
      // Board should remain unchanged
      expect(game.board).toEqual([0, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
    });
  });
}); 