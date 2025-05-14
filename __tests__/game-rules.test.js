/**
 * Tests specifically for Mancala game rules
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

describe('Mancala Game Rules', () => {
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
  });
  
  describe('Player Capture Rule', () => {
    test('should capture when last stone lands in empty pit on player side with stones in opposite pit', () => {
      // Setup: pit 3 is empty, opposite CPU pit 9 has stones
      game.board = [4, 4, 1, 0, 4, 4, 0, 4, 4, 5, 4, 4, 4, 0];
      
      // Move from pit 2 (which has 1 stone) to pit 3 (which is empty)
      game.sowStones(2, 'player');
      
      // Expected: stones from pit 9 (5) + the capturing stone (1) = 6 should be added to player store
      expect(game.board[6]).toBe(6);
      // Both pit 3 and opposite pit 9 should now be empty
      expect(game.board[3]).toBe(0);
      expect(game.board[9]).toBe(0);
    });
    
    test('should not capture when last stone lands in non-empty pit', () => {
      // Setup: pit 3 already has a stone, opposite CPU pit 9 has stones
      game.board = [4, 4, 1, 1, 4, 4, 0, 4, 4, 5, 4, 4, 4, 0];
      
      // Move from pit 2 (which has 1 stone) to pit 3 (which already has a stone)
      game.sowStones(2, 'player');
      
      // Expected: no capture occurs, just normal stone distribution
      expect(game.board[6]).toBe(0); // Player store should still be empty
      expect(game.board[3]).toBe(2); // Pit 3 should now have 2 stones (1 original + 1 added)
      expect(game.board[9]).toBe(5); // Opposite pit 9 should remain unchanged
    });
    
    test('should not capture when opposite pit is empty', () => {
      // Setup: pit 3 is empty, but opposite CPU pit 9 is also empty
      game.board = [4, 4, 1, 0, 4, 4, 0, 4, 4, 0, 4, 4, 4, 0];
      
      // Move from pit 2 (which has 1 stone) to pit 3 (which is empty)
      game.sowStones(2, 'player');
      
      // Expected: no capture occurs because opposite pit is empty
      expect(game.board[6]).toBe(0); // Player store should still be empty
      expect(game.board[3]).toBe(1); // Pit 3 should now have 1 stone
      expect(game.board[9]).toBe(0); // Opposite pit 9 should remain empty
    });
  });
  
  describe('CPU Capture Rule', () => {
    test('should capture when last stone lands in empty pit on CPU side with stones in opposite pit', () => {
      // Setup: CPU pit 9 is empty, opposite player pit 3 has stones
      game.board = [4, 4, 4, 5, 4, 4, 0, 4, 4, 0, 1, 4, 4, 0];
      
      // Move from CPU pit 10 (which has 1 stone) to pit 9 (which is empty)
      game.sowStones(10, 'cpu');
      
      // Expected: stones from pit 3 (5) + the capturing stone (1) = 6 should be added to CPU store
      expect(game.board[13]).toBe(6);
      // Both pit 9 and opposite pit 3 should now be empty
      expect(game.board[9]).toBe(0);
      expect(game.board[3]).toBe(0);
    });
  });
  
  describe('Extra Turn Rule', () => {
    test('should give player extra turn when last stone lands in player store', () => {
      // Setup: Pit 0 has 6 stones, which will land in player's store
      game.board = [6, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Move from pit 0
      const extraTurn = game.sowStones(0, 'player');
      
      // Player should get an extra turn
      expect(extraTurn).toBe(true);
    });
    
    test('should give CPU extra turn when last stone lands in CPU store', () => {
      // Setup: CPU pit 7 has 6 stones, which will land in CPU's store
      game.board = [4, 4, 4, 4, 4, 4, 0, 6, 4, 4, 4, 4, 4, 0];
      
      // Move from CPU pit 7
      const extraTurn = game.sowStones(7, 'cpu');
      
      // CPU should get an extra turn
      expect(extraTurn).toBe(true);
    });
    
    test('should not give extra turn when last stone lands in regular pit', () => {
      // Setup: Pit 0 has 3 stones, which will land in pit 3
      game.board = [3, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Move from pit 0
      const extraTurn = game.sowStones(0, 'player');
      
      // Player should not get an extra turn
      expect(extraTurn).toBe(false);
    });
  });
  
  describe('Skipping Opponent Store', () => {
    test('player should skip CPU store during sowing', () => {
      // Setup: Player pit 5 has enough stones to go around the board
      game.board = [4, 4, 4, 4, 4, 14, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Move from pit 5 (which has 14 stones)
      game.sowStones(5, 'player');
      
      // Check distribution - CPU store should be skipped
      expect(game.board[13]).toBe(0); // CPU store remains empty
      
      // Distribution should continue on player's side
      expect(game.board[0]).toBe(5); // One stone added to pit 0
    });
    
    test('CPU should skip player store during sowing', () => {
      // Setup: CPU pit 7 has enough stones to go around the board
      game.board = [4, 4, 4, 4, 4, 4, 0, 14, 4, 4, 4, 4, 4, 0];
      
      // Move from CPU pit 7 (which has 14 stones)
      game.sowStones(7, 'cpu');
      
      // Check distribution - player store should be skipped
      expect(game.board[6]).toBe(0); // Player store remains empty
      
      // Distribution should continue on CPU's side
      expect(game.board[7]).toBe(1); // One stone added back to pit 7
    });
  });
  
  describe('simulateMovePath', () => {
    test('should correctly calculate path for player move', () => {
      // Setup a board where player moves from pit 0 with 3 stones
      game.board = [3, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Get the path from pit 0
      const path = game.simulateMovePath(0, 'player');
      
      // Expected path: stones land in pits 1, 2, 3
      expect(path).toEqual([1, 2, 3]);
    });
    
    test('should correctly skip opponent store in path', () => {
      // Setup a board where player moves from pit 5 with enough stones to reach CPU store
      game.board = [4, 4, 4, 4, 4, 8, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Get the path from pit 5
      const path = game.simulateMovePath(5, 'player');
      
      // Verify the path skips the CPU store (index 13)
      expect(path).not.toContain(13);
      
      // Path should go: 6 (player store), 12, 11, 10, 9, 8, 7, 0
      expect(path).toEqual([6, 12, 11, 10, 9, 8, 7, 0]);
    });
  });
}); 