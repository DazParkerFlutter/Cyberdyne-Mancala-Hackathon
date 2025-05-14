/**
 * Tests for end game scenarios in Mancala
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

describe('Mancala End Game', () => {
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
  });
  
  describe('endGame', () => {
    test('should move all remaining stones to respective stores', () => {
      // Setup board with some stones
      game.board = [2, 3, 0, 1, 0, 4, 10, 5, 0, 3, 2, 0, 1, 15];
      
      // End the game
      game.endGame();
      
      // All player pits should be empty
      expect(game.board.slice(0, 6).every(stones => stones === 0)).toBe(true);
      
      // All CPU pits should be empty
      expect(game.board.slice(7, 13).every(stones => stones === 0)).toBe(true);
      
      // Player store should have original 10 + 10 more stones
      expect(game.board[6]).toBe(20);
      
      // CPU store should have original 15 + 11 more stones
      expect(game.board[13]).toBe(26);
    });
    
    test('should set gameOver to true', () => {
      game.gameOver = false;
      game.endGame();
      expect(game.gameOver).toBe(true);
    });
    
    test('should show player win message when player has more stones', () => {
      // Setup so player has more stones
      game.board = [0, 0, 0, 0, 0, 0, 25, 0, 0, 0, 0, 0, 0, 20];
      
      game.endGame();
      
      expect(game.setStatusMessage).toHaveBeenCalledWith(
        expect.stringMatching(/You win/)
      );
    });
    
    test('should show CPU win message when CPU has more stones', () => {
      // Setup so CPU has more stones
      game.board = [0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 25];
      
      game.endGame();
      
      expect(game.setStatusMessage).toHaveBeenCalledWith(
        expect.stringMatching(/CPU wins/)
      );
    });
    
    test('should show tie message when scores are equal', () => {
      // Setup for a tie
      game.board = [0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 24];
      
      game.endGame();
      
      expect(game.setStatusMessage).toHaveBeenCalledWith(
        expect.stringMatching(/tie/)
      );
    });
  });
  
  describe('checkGameOver integration', () => {
    test('should end game when player side is empty', () => {
      // Spy on endGame
      const endGameSpy = jest.spyOn(game, 'endGame');
      
      // Manually set up game state where player side is empty
      game.board = [0, 0, 0, 0, 0, 0, 20, 1, 1, 1, 1, 1, 1, 20];
      
      // Process a move that would check for game over
      game.processMoveAfterAnimation(7, 'cpu');
      
      // Expect endGame to have been called
      expect(endGameSpy).toHaveBeenCalled();
    });
    
    test('should end game when CPU side is empty', () => {
      // Spy on endGame
      const endGameSpy = jest.spyOn(game, 'endGame');
      
      // Manually set up game state where CPU side is empty
      game.board = [1, 1, 1, 1, 1, 1, 20, 0, 0, 0, 0, 0, 0, 20];
      
      // Process a move that would check for game over
      game.processMoveAfterAnimation(0, 'player');
      
      // Expect endGame to have been called
      expect(endGameSpy).toHaveBeenCalled();
    });
  });
}); 