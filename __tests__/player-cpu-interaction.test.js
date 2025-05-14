/**
 * Tests for player and CPU interactions in Mancala
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

describe('Mancala Player and CPU Interaction', () => {
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
    
    // Mock the setStatusMessage method
    game.setStatusMessage = jest.fn();
    
    // Spy on CPU turn
    jest.spyOn(game, 'cpuTurn');
    
    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
  });
  
  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
  });
  
  describe('processMoveAfterAnimation', () => {
    test('should switch turn to CPU after player move without extra turn', () => {
      // Set up a board where player won't get an extra turn
      game.board = [3, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Process a player move
      game.processMoveAfterAnimation(0, 'player');
      
      // Should set current player to CPU
      expect(game.currentPlayer).toBe('cpu');
      
      // Should call CPU turn
      expect(game.cpuTurn).toHaveBeenCalled();
    });
    
    test('should keep turn for player after landing in store', () => {
      // Set up a board where player will get an extra turn (6 stones lands in store)
      game.board = [6, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
      
      // Process a player move
      game.processMoveAfterAnimation(0, 'player');
      
      // Should keep current player as player
      expect(game.currentPlayer).toBe('player');
      
      // Should not call CPU turn
      expect(game.cpuTurn).not.toHaveBeenCalled();
      
      // Should display appropriate message
      expect(game.setStatusMessage).toHaveBeenCalledWith(expect.stringMatching(/another turn/));
    });
    
    test('should keep turn for CPU after landing in store', () => {
      // Set up a board where CPU will get an extra turn
      game.board = [4, 4, 4, 4, 4, 4, 0, 6, 4, 4, 4, 4, 4, 0];
      game.currentPlayer = 'cpu';
      
      // Process a CPU move that will land in its store
      game.processMoveAfterAnimation(7, 'cpu');
      
      // Should keep current player as CPU
      expect(game.currentPlayer).toBe('cpu');
      
      // Should call CPU turn again
      expect(game.cpuTurn).toHaveBeenCalled();
      
      // Should display appropriate message
      expect(game.setStatusMessage).toHaveBeenCalledWith(expect.stringMatching(/CPU gets another turn/));
    });
  });
  
  describe('CPU AI', () => {
    test('should prefer moves that result in extra turn', () => {
      // Set up a board where the CPU can get an extra turn by choosing pit 12
      game.board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 1, 0];
      
      // Call CPU's choose move function
      const chosenPit = game.chooseCpuMove();
      
      // CPU should choose pit 12
      expect(chosenPit).toBe(12);
    });
    
    test('should prefer moves that result in captures', () => {
      // Set up a board where the CPU can capture by choosing pit 8
      // Last stone will land in empty pit 10 with opposite player pit 2 having stones
      game.board = [4, 4, 5, 4, 4, 4, 0, 4, 2, 4, 0, 4, 4, 0];
      
      // Call CPU's choose move function
      const chosenPit = game.chooseCpuMove();
      
      // CPU should choose pit 8
      expect(chosenPit).toBe(8);
    });
    
    test('should choose pit with most stones if no special moves available', () => {
      // Set up a board with no captures or extra turns possible
      // Pit 10 has the most stones
      game.board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 8, 2, 3, 0];
      
      // Call CPU's choose move function
      const chosenPit = game.chooseCpuMove();
      
      // CPU should choose pit 10 (most stones)
      expect(chosenPit).toBe(10);
    });
    
    test('should return null when no valid moves available', () => {
      // Set up a board with no valid moves for CPU
      game.board = [4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 20];
      
      // Call CPU's choose move function
      const chosenPit = game.chooseCpuMove();
      
      // No valid move should return null
      expect(chosenPit).toBe(null);
    });
  });
  
  describe('UI interaction', () => {
    test('should have correct status message on player turn', () => {
      game.currentPlayer = 'player';
      game.resetGame();
      expect(game.setStatusMessage).toHaveBeenCalledWith('Your turn');
    });
    
    test('should have correct status message on CPU turn', () => {
      game.currentPlayer = 'player';
      
      // Simulate a player move that would switch to CPU turn
      game.processMoveAfterAnimation(0, 'player');
      
      expect(game.setStatusMessage).toHaveBeenCalledWith(expect.stringMatching(/CPU is thinking/));
    });
  });
}); 