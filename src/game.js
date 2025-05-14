/**
 * Mancala Game
 * A 1-player vs CPU implementation of the classic Mancala game
 */

class MancalaGame {
    constructor() {
        // Board setup: 6 pits per player, each with 4 stones
        // Player pits: 0-5, Player store: 6
        // CPU pits: 7-12, CPU store: 13
        this.board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
        this.currentPlayer = 'player'; // 'player' or 'cpu'
        this.gameOver = false;
        this.lastMove = null;
        
        // DOM elements
        this.statusMessage = document.getElementById('status-message');
        this.resetButton = document.getElementById('reset-button');
        this.rulesButton = document.getElementById('rules-button');
        this.playerStore = document.getElementById('player-store');
        this.cpuStore = document.getElementById('cpu-store');
        this.playerPits = Array.from(document.querySelectorAll('.player-pit'));
        this.cpuPits = Array.from(document.querySelectorAll('.cpu-pit'));
        
        // Modal elements
        this.welcomeModal = document.getElementById('welcome-modal');
        this.rulesModal = document.getElementById('rules-modal');
        this.closeButtons = document.querySelectorAll('.close-button');
        this.startGameButton = document.getElementById('start-game-button');
        this.closeModalButtons = document.querySelectorAll('.close-modal-button');
        
        // Debug elements
        this.debugLog = document.getElementById('debug-log');
        this.toggleDebugButton = document.getElementById('toggle-debug');
        this.debugConsole = document.querySelector('.debug-console');
        this.debugVisible = true;
        
        // Stone colors
        this.stoneColors = [
            '#f5deb3', // wheat
            '#deb887', // burlywood
            '#d2b48c', // tan
            '#bc8f8f', // rosybrown
            '#a9a9a9', // darkgray
            '#808080'  // gray
        ];
        
        // Initialize the game
        this.init();
    }
    
    init() {
        // Add event listeners
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.rulesButton.addEventListener('click', () => this.showRulesModal());
        
        // Add click events to player pits
        this.playerPits.forEach((pit, index) => {
            pit.addEventListener('click', () => this.makeMove(index));
        });
        
        // Modal event listeners
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.welcomeModal.style.display = 'none';
                this.rulesModal.style.display = 'none';
            });
        });
        
        this.closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.welcomeModal.style.display = 'none';
                this.rulesModal.style.display = 'none';
            });
        });
        
        this.startGameButton.addEventListener('click', () => {
            this.welcomeModal.style.display = 'none';
        });
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === this.welcomeModal) {
                this.welcomeModal.style.display = 'none';
            }
            if (event.target === this.rulesModal) {
                this.rulesModal.style.display = 'none';
            }
        });
        
        // Debug toggle
        this.toggleDebugButton.addEventListener('click', () => {
            if (this.debugVisible) {
                this.debugLog.style.display = 'none';
                this.toggleDebugButton.textContent = 'Show';
                this.debugVisible = false;
            } else {
                this.debugLog.style.display = 'block';
                this.toggleDebugButton.textContent = 'Hide';
                this.debugVisible = true;
            }
        });
        
        // Show welcome modal on first load
        this.showWelcomeModal();
        
        // Initial board state debug
        this.logDebug('Game initialized', this.getBoardStateString());
        
        // Initial render
        this.render();
    }
    
    logDebug(message, data = '') {
        const entry = document.createElement('div');
        entry.className = 'debug-entry';
        
        const timestamp = new Date().toLocaleTimeString();
        entry.innerHTML = `<span>[${timestamp}]</span> ${message}`;
        
        if (data) {
            entry.innerHTML += `<br><span>${data}</span>`;
        }
        
        // Add class for different types of logs
        if (message.includes('Player move')) {
            entry.classList.add('player-move');
        } else if (message.includes('CPU move')) {
            entry.classList.add('cpu-move');
        } else if (message.includes('WARNING') || message.includes('Error')) {
            entry.classList.add('debug-warning');
        }
        
        this.debugLog.appendChild(entry);
        this.debugLog.scrollTop = this.debugLog.scrollHeight;
    }
    
    getBoardStateString() {
        let boardState = 'Board state:\n';
        boardState += `CPU Store (13): ${this.board[13]}\n`;
        boardState += 'CPU Pits:    ';
        for (let i = 12; i >= 7; i--) {
            boardState += `${this.board[i]} `;
        }
        boardState += '\nPlayer Pits: ';
        for (let i = 0; i < 6; i++) {
            boardState += `${this.board[i]} `;
        }
        boardState += `\nPlayer Store (6): ${this.board[6]}`;
        return boardState;
    }
    
    showWelcomeModal() {
        this.welcomeModal.style.display = 'block';
    }
    
    showRulesModal() {
        this.rulesModal.style.display = 'block';
    }
    
    resetGame() {
        // Reset board state
        this.board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
        this.currentPlayer = 'player';
        this.gameOver = false;
        this.lastMove = null;
        
        // Update UI
        this.render();
        this.setStatusMessage('Your turn');
        
        // Log reset
        this.logDebug('Game reset', this.getBoardStateString());
    }
    
    makeMove(pitIndex) {
        // Check if game is over or if it's not player's turn
        if (this.gameOver || this.currentPlayer !== 'player') {
            return;
        }
        
        // Check if the selected pit is valid (belongs to player and has stones)
        if (pitIndex < 0 || pitIndex > 5 || this.board[pitIndex] === 0) {
            return;
        }
        
        // Log the move
        this.logDebug(`Player move: Pit ${pitIndex} (${this.board[pitIndex]} stones)`);
        
        // Execute the move
        const extraTurn = this.sowStones(pitIndex, 'player');
        this.lastMove = pitIndex;
        
        // Log board state after move
        this.logDebug('After player move:', this.getBoardStateString());
        
        // Check if the game is over after player's move
        if (this.checkGameOver()) {
            this.endGame();
            return;
        }
        
        // Render the updated board
        this.render();
        
        // Check if player gets an extra turn
        if (extraTurn) {
            this.setStatusMessage('You get another turn!');
            this.logDebug('Player gets another turn');
        } else {
            // Switch to CPU's turn
            this.currentPlayer = 'cpu';
            this.setStatusMessage('CPU is thinking...');
            
            // CPU takes its turn after a short delay
            setTimeout(() => this.cpuTurn(), 1000);
        }
    }
    
    sowStones(pitIndex, player) {
        const stones = this.board[pitIndex];
        this.board[pitIndex] = 0;
        
        let currentPit = pitIndex;
        let extraTurn = false;
        let distributionPath = [];
        
        // Track distribution for debugging
        distributionPath.push(pitIndex);
        
        // Distribute stones
        for (let i = 0; i < stones; i++) {
            currentPit = (currentPit + 1) % 14;
            
            // Skip opponent's store
            if ((player === 'player' && currentPit === 13) || 
                (player === 'cpu' && currentPit === 6)) {
                currentPit = (currentPit + 1) % 14;
            }
            
            this.board[currentPit]++;
            distributionPath.push(currentPit);
            
            // Check if last stone lands in player's store
            if (i === stones - 1) {
                if ((player === 'player' && currentPit === 6) || 
                    (player === 'cpu' && currentPit === 13)) {
                    extraTurn = true;
                    this.logDebug(`${player} gets extra turn - last stone in store`);
                }
                
                // Check for capture: last stone lands in empty pit on player's side
                if (this.board[currentPit] === 1) {
                    if (player === 'player' && currentPit >= 0 && currentPit <= 5) {
                        const oppositePit = 12 - currentPit;
                        if (this.board[oppositePit] > 0) {
                            // Capture stones
                            this.logDebug(`Player captures ${this.board[oppositePit]} stones from pit ${oppositePit}`);
                            this.board[6] += this.board[oppositePit] + 1;
                            this.board[oppositePit] = 0;
                            this.board[currentPit] = 0;
                        }
                    } else if (player === 'cpu' && currentPit >= 7 && currentPit <= 12) {
                        const oppositePit = 12 - currentPit;
                        if (this.board[oppositePit] > 0) {
                            // Capture stones
                            this.logDebug(`CPU captures ${this.board[oppositePit]} stones from pit ${oppositePit}`);
                            this.board[13] += this.board[oppositePit] + 1;
                            this.board[oppositePit] = 0;
                            this.board[currentPit] = 0;
                        }
                    }
                }
            }
        }
        
        this.logDebug(`Stone distribution path: ${distributionPath.join(' → ')}`);
        return extraTurn;
    }
    
    cpuTurn() {
        if (this.gameOver) return;
        
        // Choose a move based on simple heuristic
        const pitIndex = this.chooseCpuMove();
        
        if (pitIndex !== null) {
            // Log the CPU move
            this.logDebug(`CPU move: Pit ${pitIndex} (${this.board[pitIndex]} stones)`);
            
            // Execute the move
            const extraTurn = this.sowStones(pitIndex, 'cpu');
            
            // Log board state after move
            this.logDebug('After CPU move:', this.getBoardStateString());
            
            // Check if the game is over after CPU's move
            if (this.checkGameOver()) {
                this.endGame();
                return;
            }
            
            // Render the updated board
            this.render();
            
            // Check if CPU gets an extra turn
            if (extraTurn) {
                this.setStatusMessage('CPU gets another turn');
                this.logDebug('CPU gets another turn');
                setTimeout(() => this.cpuTurn(), 1000);
            } else {
                // Switch back to player's turn
                this.currentPlayer = 'player';
                this.setStatusMessage('Your turn');
            }
        } else {
            // No valid move for CPU
            this.logDebug('WARNING: No valid move for CPU');
            this.endGame();
        }
    }
    
    chooseCpuMove() {
        // Strategy priority:
        // 1. If can land in own store (extra turn), choose that move
        // 2. If can capture opponent's stones, choose that move
        // 3. Otherwise, choose pit with most stones
        
        let bestPit = null;
        let bestValue = -1;
        let reason = "";
        
        // Debug log all possible CPU moves
        this.logDebug('CPU analyzing moves:');
        
        // Check all CPU pits (7-12)
        for (let i = 7; i <= 12; i++) {
            // Skip empty pits
            if (this.board[i] === 0) {
                this.logDebug(`- Pit ${i}: EMPTY`);
                continue;
            }
            
            // Calculate where the last stone will land
            const stones = this.board[i];
            
            // Simulate the distribution
            let lastPit = this.simulateMove(i);
            
            // Check if this move leads to an extra turn
            if (lastPit === 13) {
                this.logDebug(`- Pit ${i}: CHOSEN - Will land in store (extra turn)`);
                return i; // Found a move that gives extra turn
            }
            
            // Check if this move leads to a capture
            if (lastPit >= 7 && lastPit <= 12 && 
                this.simulateBoardState[lastPit] === 1 && // last stone made it exactly 1
                this.board[12 - lastPit] > 0) { // there are stones to capture
                this.logDebug(`- Pit ${i}: CHOSEN - Will capture ${this.board[12 - lastPit]} stones from pit ${12 - lastPit}`);
                return i; // Found a move that gives capture
            }
            
            // Otherwise, consider this pit based on number of stones
            this.logDebug(`- Pit ${i}: ${stones} stones, last stone lands in pit ${lastPit}`);
            if (this.board[i] > bestValue) {
                bestValue = this.board[i];
                bestPit = i;
                reason = "most stones";
            }
        }
        
        if (bestPit !== null) {
            this.logDebug(`- Pit ${bestPit} chosen (${reason})`);
        }
        
        return bestPit;
    }
    
    simulateMove(pitIndex) {
        // Create a copy of the board for simulation
        this.simulateBoardState = [...this.board];
        
        const stones = this.simulateBoardState[pitIndex];
        this.simulateBoardState[pitIndex] = 0;
        
        let currentPit = pitIndex;
        
        // Distribute stones
        for (let i = 0; i < stones; i++) {
            currentPit = (currentPit + 1) % 14;
            
            // Skip opponent's store (player's store)
            if (currentPit === 6) {
                currentPit = 7;
            }
            
            this.simulateBoardState[currentPit]++;
        }
        
        return currentPit;
    }
    
    checkGameOver() {
        // Check if all pits on either side are empty
        const playerSideEmpty = this.board.slice(0, 6).every(stones => stones === 0);
        const cpuSideEmpty = this.board.slice(7, 13).every(stones => stones === 0);
        
        if (playerSideEmpty || cpuSideEmpty) {
            this.logDebug(`Game over detected: ${playerSideEmpty ? 'Player' : 'CPU'} side is empty`);
            return true;
        }
        
        return false;
    }
    
    endGame() {
        // Log the end game state before moving stones
        this.logDebug('End game state before final collection:', this.getBoardStateString());
        
        // Move all remaining stones to the respective stores
        let playerRemaining = 0;
        for (let i = 0; i < 6; i++) {
            playerRemaining += this.board[i];
            this.board[6] += this.board[i];
            this.board[i] = 0;
        }
        
        let cpuRemaining = 0;
        for (let i = 7; i < 13; i++) {
            cpuRemaining += this.board[i];
            this.board[13] += this.board[i];
            this.board[i] = 0;
        }
        
        this.logDebug(`Final collection: Player +${playerRemaining}, CPU +${cpuRemaining}`);
        
        this.gameOver = true;
        this.render();
        
        // Determine winner
        const playerScore = this.board[6];
        const cpuScore = this.board[13];
        
        if (playerScore > cpuScore) {
            this.setStatusMessage(`Game over! You win! 🎉 (${playerScore}-${cpuScore})`);
            this.logDebug(`Player wins ${playerScore}-${cpuScore}`);
        } else if (playerScore < cpuScore) {
            this.setStatusMessage(`Game over! CPU wins! 😔 (${cpuScore}-${playerScore})`);
            this.logDebug(`CPU wins ${cpuScore}-${playerScore}`);
        } else {
            this.setStatusMessage(`Game over! It's a tie! 🤝 (${playerScore}-${cpuScore})`);
            this.logDebug(`Tie game ${playerScore}-${cpuScore}`);
        }
    }
    
    render() {
        // Clear all stones first
        document.querySelectorAll('.stone').forEach(stone => stone.remove());
        
        // Update player pits
        for (let i = 0; i < 6; i++) {
            const pit = this.playerPits[i];
            const count = this.board[i];
            pit.querySelector('.stones-count').textContent = count;
            
            // Add visual stones
            this.renderStones(pit, count);
            
            // Enable/disable pits based on game state
            if (this.currentPlayer === 'player' && count > 0 && !this.gameOver) {
                pit.classList.remove('disabled');
            } else {
                pit.classList.add('disabled');
            }
        }
        
        // Update CPU pits
        for (let i = 0; i < 6; i++) {
            const pit = this.cpuPits[i];
            const count = this.board[12 - i];
            pit.querySelector('.stones-count').textContent = count;
            pit.classList.add('disabled'); // CPU pits are always disabled for player
            
            // Add visual stones
            this.renderStones(pit, count);
        }
        
        // Update stores
        this.playerStore.querySelector('.store-count').textContent = this.board[6];
        this.cpuStore.querySelector('.store-count').textContent = this.board[13];
        
        // Add visual stones to stores
        this.renderStones(this.playerStore, this.board[6], true);
        this.renderStones(this.cpuStore, this.board[13], true);
    }
    
    renderStones(container, count, isStore = false) {
        // Don't render too many stones visually
        const maxVisualStones = isStore ? 30 : 15;
        const visibleCount = Math.min(count, maxVisualStones);
        
        for (let i = 0; i < visibleCount; i++) {
            const stone = document.createElement('div');
            stone.className = 'stone';
            
            // Random position within the container
            const containerWidth = container.clientWidth - 15;
            const containerHeight = container.clientHeight - 15;
            
            let left, top;
            
            if (isStore) {
                // For stores, distribute more evenly
                const rows = Math.ceil(Math.sqrt(visibleCount));
                const cols = Math.ceil(visibleCount / rows);
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                const cellWidth = containerWidth / cols;
                const cellHeight = containerHeight / rows;
                
                left = col * cellWidth + Math.random() * 10 - 5;
                top = row * cellHeight + Math.random() * 10 - 5;
            } else {
                // For pits, more random distribution
                left = Math.random() * containerWidth;
                top = Math.random() * containerHeight;
            }
            
            // Ensure stones stay within bounds
            left = Math.max(5, Math.min(containerWidth - 5, left));
            top = Math.max(5, Math.min(containerHeight - 5, top));
            
            stone.style.left = left + 'px';
            stone.style.top = top + 'px';
            
            // Random color from our palette
            const colorIndex = Math.floor(Math.random() * this.stoneColors.length);
            stone.style.backgroundColor = this.stoneColors[colorIndex];
            
            // Random rotation for natural look
            const rotation = Math.random() * 360;
            stone.style.transform = `rotate(${rotation}deg)`;
            
            container.appendChild(stone);
        }
    }
    
    setStatusMessage(message) {
        this.statusMessage.textContent = message;
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MancalaGame();
}); 