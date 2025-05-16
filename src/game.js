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
        this.animationInProgress = false;
        
        // Add a simple seeded random number generator for consistent stone placement
        this.randomSeed = 12345;
        this.seededRandom = () => {
            this.randomSeed = (this.randomSeed * 9301 + 49297) % 233280;
            return this.randomSeed / 233280;
        };
        
        // Animation settings
        this.animationSpeed = 600; // milliseconds per step (increased from 300)
        this.cpuThinkingTime = 1500; // milliseconds for CPU "thinking"
        
        // Sound effects
        this.stoneDropSound = new Audio('assets/sounds/stone-drop.mp3');
        this.stoneDropSound.volume = 0.5; // Set volume to 50%
        this.soundEnabled = true; // For toggling sound on/off
        
        // Preload the sound effect
        this.stoneDropSound.load();
        this.stoneDropSound.oncanplaythrough = () => {
            this.logDebug('Stone drop sound loaded and ready to play');
        };
        this.stoneDropSound.onerror = (e) => {
            this.logDebug('WARNING: Error loading stone drop sound', e);
            this.soundEnabled = false; // Disable sound if there's an error
        };
        
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
        
        // Make sure debug console is visible by default
        this.debugLog.style.display = 'block';
        this.debugConsole.style.display = 'block';
        this.toggleDebugButton.textContent = 'Hide';
        
        // Updated colorful stone colors to exactly match the image
        this.stoneColors = [
            '#ffff00', // yellow
            '#87ceeb', // light blue
            '#ff8c00', // orange
            '#9932cc', // purple
            '#32cd32', // green
            '#ffffff'  // white
        ];
        
        // Add a map to store stone positions and colors
        this.stonePositionsMap = new Map();
        
        // Initialize the game
        this.init();
    }
    
    init() {
        // Add event listeners
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.rulesButton.addEventListener('click', () => this.showRulesModal());
        
        // Add sound toggle functionality
        this.soundToggleButton = document.getElementById('sound-toggle-button');
        this.soundToggleButton.addEventListener('click', () => this.toggleSound());
        
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
        // Stop any animations in progress
        this.animationInProgress = false;
        
        // Reset board state
        this.board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
        this.currentPlayer = 'player';
        this.gameOver = false;
        this.lastMove = null;
        
        // Clear stone positions map to get new random positions for the new game
        this.stonePositionsMap = new Map();
        
        // Update UI
        this.render();
        this.setStatusMessage('Your turn');
        
        // Log reset
        this.logDebug('Game reset', this.getBoardStateString());
    }
    
    makeMove(pitIndex) {
        // Check if game is over, animation in progress, or if it's not player's turn
        if (this.gameOver || this.currentPlayer !== 'player' || this.animationInProgress) {
            return;
        }
        
        // Check if the selected pit is valid (belongs to player and has stones)
        if (pitIndex < 0 || pitIndex > 5 || this.board[pitIndex] === 0) {
            return;
        }
        
        // Log the move
        this.logDebug(`Player move: Pit ${pitIndex} (${this.board[pitIndex]} stones)`);
        
        // Animate the move
        this.animateMove(pitIndex, 'player');
    }
    
    // Process the player's move after animation
    processMoveAfterAnimation(pitIndex, player) {
        // Execute the move on the actual board state
        const extraTurn = this.sowStones(pitIndex, player);
        this.lastMove = pitIndex;
        
        // Log board state after move
        this.logDebug(`After ${player} move:`, this.getBoardStateString());
        
        // Check if the game is over
        if (this.checkGameOver()) {
            this.endGame();
            return;
        }
        
        // Render the updated board to show actual state
        this.render();
        
        // Check if player gets an extra turn
        if (extraTurn) {
            if (player === 'player') {
                this.setStatusMessage('You get another turn!');
                this.logDebug('Player gets another turn');
            } else {
                this.setStatusMessage('CPU gets another turn');
                this.logDebug('CPU gets another turn');
                setTimeout(() => this.cpuTurn(), this.cpuThinkingTime);
            }
        } else {
            // Switch turns
            if (player === 'player') {
                this.currentPlayer = 'cpu';
                this.setStatusMessage('CPU is thinking...');
                setTimeout(() => this.cpuTurn(), this.cpuThinkingTime);
            } else {
                this.currentPlayer = 'player';
                this.setStatusMessage('Your turn');
            }
        }
    }
    
    animateMove(pitIndex, player) {
        // Mark animation as in progress
        this.animationInProgress = true;
        
        // Get the stones to distribute
        const stones = this.board[pitIndex];
        if (stones === 0) {
            this.animationInProgress = false;
            return;
        }
        
        // Create a copy of the board state before making changes
        const originalBoard = [...this.board];
        
        // Remove stones from the starting pit in UI only (actual board state is changed in sowStones)
        this.board[pitIndex] = 0;
        
        // Get the container element
        let sourceContainer;
        if (player === 'player') {
            sourceContainer = this.playerPits[pitIndex];
        } else {
            sourceContainer = this.cpuPits[12 - pitIndex];
        }
        
        // Render to show empty pit
        this.render();
        
        // Create visual stones for animation
        const animatedStones = [];
        for (let i = 0; i < stones; i++) {
            const stone = document.createElement('div');
            stone.className = 'stone animated-stone';
            
            // Get consistent color from our position map if available
            let containerID = null;
            if (player === 'player') {
                containerID = 'player-' + pitIndex;
            } else {
                containerID = 'cpu-' + (12 - pitIndex);
            }
            
            // Use consistent colors from our map if possible
            let colorToUse;
            if (this.stonePositionsMap.has(containerID) && i < this.stonePositionsMap.get(containerID).length) {
                colorToUse = this.stonePositionsMap.get(containerID)[i].color;
            } else {
                // Fallback to random color
                const colorIndex = Math.floor(Math.random() * this.stoneColors.length);
                colorToUse = this.stoneColors[colorIndex];
            }
            
            stone.style.backgroundColor = colorToUse;
            
            // Initial position in source pit
            const containerRect = sourceContainer.getBoundingClientRect();
            const left = Math.random() * (containerRect.width - 15);
            const top = Math.random() * (containerRect.height - 15);
            
            stone.style.left = `${left}px`;
            stone.style.top = `${top}px`;
            
            sourceContainer.appendChild(stone);
            animatedStones.push(stone);
        }
        
        // Restore the board state for simulation
        this.board = [...originalBoard];
        
        // Simulate the move to determine the path without changing the actual board
        const movePath = this.simulateMovePath(pitIndex, player);
        
        // Animate the distribution of stones
        this.animateDistribution(pitIndex, player, animatedStones, 0, movePath);
    }
    
    simulateMovePath(pitIndex, player) {
        // Create a path of pits that stones will move through
        const stones = this.board[pitIndex];
        const path = [];
        let currentPit = pitIndex;
        
        // Properly handle counter-clockwise movement based on the visual board layout
        // Player pits: 0,1,2,3,4,5 (bottom row, left to right)
        // Player store: 6 (rightmost)
        // CPU pits: 7,8,9,10,11,12 (top row, right to left)
        // CPU store: 13 (leftmost)
        
        for (let i = 0; i < stones; i++) {
            // Determine next pit in counter-clockwise order
            if (currentPit === 5) {
                // From rightmost player pit to player store
                currentPit = 6;
            } else if (currentPit === 6) {
                // From player store to rightmost CPU pit
                currentPit = 12;
            } else if (currentPit === 7) {
                // From leftmost CPU pit to CPU store
                currentPit = 13;
            } else if (currentPit === 13) {
                // From CPU store to leftmost player pit
                currentPit = 0;
            } else if (currentPit >= 0 && currentPit < 5) {
                // Moving right along player's row
                currentPit++;
            } else if (currentPit > 7 && currentPit <= 12) {
                // Moving left along CPU's row
                currentPit--;
            }
            
            // Skip opponent's store
            if (player === 'player' && currentPit === 13) {
                // Player skips CPU's store
                currentPit = 0;
            } else if (player === 'cpu' && currentPit === 6) {
                // CPU skips player's store
                currentPit = 12;
            }
            
            path.push(currentPit);
        }
        
        return path;
    }
    
    animateDistribution(pitIndex, player, stones, currentStone, movePath) {
        if (currentStone >= stones.length || !this.animationInProgress) {
            // Animation completed or cancelled
            this.removeAnimatedStones();
            // Now we actually make the move after the animation
            this.processMoveAfterAnimation(pitIndex, player);
            return;
        }
        
        // Get the target pit from the pre-calculated path
        const targetPit = movePath[currentStone];
        
        // Get the stone to animate
        const stone = stones[currentStone];
        
        // Get target container
        let targetContainer;
        if (targetPit === 6) {
            targetContainer = this.playerStore;
        } else if (targetPit === 13) {
            targetContainer = this.cpuStore;
        } else if (targetPit >= 0 && targetPit <= 5) {
            targetContainer = this.playerPits[targetPit];
        } else {
            targetContainer = this.cpuPits[12 - targetPit];
        }
        
        // Get the position and dimensions
        const targetRect = targetContainer.getBoundingClientRect();
        const sourceRect = stone.parentElement.getBoundingClientRect();
        
        // Calculate new position
        const centerX = targetRect.left + targetRect.width / 2 - sourceRect.left;
        const centerY = targetRect.top + targetRect.height / 2 - sourceRect.top;
        
        // Add randomness to final position
        const finalX = centerX + (Math.random() * 30 - 15);
        const finalY = centerY + (Math.random() * 30 - 15);
        
        // Animate the stone
        stone.style.transition = `transform ${this.animationSpeed}ms ease-in-out`;
        stone.style.transform = `translate(${finalX}px, ${finalY}px)`;
        
        // Visual feedback - DO NOT update the actual stone count
        // This will just show movement in the UI
        targetContainer.classList.add('active');
        setTimeout(() => {
            targetContainer.classList.remove('active');
        }, this.animationSpeed);
        
        // Move the stone to the target container after animation
        setTimeout(() => {
            if (!this.animationInProgress) return;
            
            try {
                targetContainer.appendChild(stone);
                stone.style.transform = 'none';
                stone.style.transition = 'none';
                
                // Play stone drop sound
                this.playSound(this.stoneDropSound);
                
                // Get the target container ID
                const targetContainerID = targetContainer.id || 
                    (targetContainer.classList.contains('player-pit') ? 'player-' + this.playerPits.indexOf(targetContainer) : 
                     targetContainer.classList.contains('cpu-pit') ? 'cpu-' + this.cpuPits.indexOf(targetContainer) : 'unknown');
                
                // Use consistent position and rotation if available for this stone index in target container
                if (this.stonePositionsMap.has(targetContainerID) && currentStone < this.stonePositionsMap.get(targetContainerID).length) {
                    const stoneData = this.stonePositionsMap.get(targetContainerID)[currentStone];
                    stone.style.left = stoneData.left + 'px';
                    stone.style.top = stoneData.top + 'px';
                    stone.style.transform = `rotate(${stoneData.rotation}deg)`;
                } else {
                    // Fallback to random positioning
                    const containerWidth = targetContainer.clientWidth - 15;
                    const containerHeight = targetContainer.clientHeight - 15;
                    const left = Math.random() * containerWidth;
                    const top = Math.random() * containerHeight;
                    
                    stone.style.left = `${left}px`;
                    stone.style.top = `${top}px`;
                }
                
                // Continue to next stone
                setTimeout(() => {
                    this.animateDistribution(pitIndex, player, stones, currentStone + 1, movePath);
                }, 50);
            } catch (e) {
                console.error("Animation error:", e);
                // Gracefully handle error by stopping animation
                this.removeAnimatedStones();
                this.processMoveAfterAnimation(pitIndex, player);
            }
        }, this.animationSpeed);
    }
    
    removeAnimatedStones() {
        document.querySelectorAll('.animated-stone').forEach(stone => {
            stone.remove();
        });
        this.animationInProgress = false;
    }
    
    sowStones(pitIndex, player) {
        const stones = this.board[pitIndex];
        this.board[pitIndex] = 0;
        
        let currentPit = pitIndex;
        let lastPit = null;
        let extraTurn = false;
        
        // Properly handle counter-clockwise movement based on the visual board layout
        // Player pits: 0,1,2,3,4,5 (bottom row, left to right)
        // Player store: 6 (rightmost)
        // CPU pits: 7,8,9,10,11,12 (top row, right to left)
        // CPU store: 13 (leftmost)
        
        for (let i = 0; i < stones; i++) {
            // Determine next pit in counter-clockwise order
            if (currentPit === 5) {
                // From rightmost player pit to player store
                currentPit = 6;
            } else if (currentPit === 6) {
                // From player store to rightmost CPU pit
                currentPit = 12;
            } else if (currentPit === 7) {
                // From leftmost CPU pit to CPU store
                currentPit = 13;
            } else if (currentPit === 13) {
                // From CPU store to leftmost player pit
                currentPit = 0;
            } else if (currentPit >= 0 && currentPit < 5) {
                // Moving right along player's row
                currentPit++;
            } else if (currentPit > 7 && currentPit <= 12) {
                // Moving left along CPU's row
                currentPit--;
            }
            
            // Skip opponent's store
            if (player === 'player' && currentPit === 13) {
                // Player skips CPU's store
                currentPit = 0;
            } else if (player === 'cpu' && currentPit === 6) {
                // CPU skips player's store
                currentPit = 12;
            }
            
            // Add stone to the current pit
            this.board[currentPit]++;
            lastPit = currentPit;
        }
        
        // Check if last stone landed in player's own store
        if ((player === 'player' && lastPit === 6) || (player === 'cpu' && lastPit === 13)) {
            extraTurn = true;
            this.logDebug(`${player} gets extra turn for landing in store`);
        }
        
        // Check for capture
        if (!extraTurn) {
            // Player capture condition: last stone lands in an empty pit on player's side
            if (player === 'player' && lastPit >= 0 && lastPit <= 5 && this.board[lastPit] === 1) {
                // Calculate opposite pit - for player, the opposite pit is 7 more than the player's pit
                const oppositePit = lastPit + 7;
                this.logDebug(`Player CAPTURE check: last pit ${lastPit} has 1 stone, opposite pit ${oppositePit} has ${this.board[oppositePit]} stones`);
                
                if (this.board[oppositePit] > 0) {
                    // Capture opposite stones and the capturing stone
                    const capturedStones = this.board[oppositePit] + 1;
                    this.board[6] += capturedStones;
                    this.board[oppositePit] = 0;
                    this.board[lastPit] = 0;
                    this.logDebug(`Player CAPTURE: ${capturedStones} stones moved to store`);
                }
            }
            // CPU capture condition: last stone lands in an empty pit on CPU's side
            else if (player === 'cpu' && lastPit >= 7 && lastPit <= 12 && this.board[lastPit] === 1) {
                // Calculate opposite pit - for CPU, the opposite pit is 7 less than the CPU's pit
                const oppositePit = lastPit - 7;
                this.logDebug(`CPU CAPTURE check: last pit ${lastPit} has 1 stone, opposite pit ${oppositePit} has ${this.board[oppositePit]} stones`);
                
                if (this.board[oppositePit] > 0) {
                    // Capture opposite stones and the capturing stone
                    const capturedStones = this.board[oppositePit] + 1;
                    this.board[13] += capturedStones;
                    this.board[oppositePit] = 0;
                    this.board[lastPit] = 0;
                    this.logDebug(`CPU CAPTURE: ${capturedStones} stones moved to store`);
                }
            }
        }
        
        return extraTurn;
    }
    
    simulateMove(pitIndex, player = 'cpu') {
        // Create a copy of the board for simulation
        this.simulateBoardState = [...this.board];
        
        const stones = this.simulateBoardState[pitIndex];
        this.simulateBoardState[pitIndex] = 0;
        
        let currentPit = pitIndex;
        let lastPit = null;
        
        // Properly handle counter-clockwise movement based on the visual board layout
        // Player pits: 0,1,2,3,4,5 (bottom row, left to right)
        // Player store: 6 (rightmost)
        // CPU pits: 7,8,9,10,11,12 (top row, right to left)
        // CPU store: 13 (leftmost)
        
        for (let i = 0; i < stones; i++) {
            // Determine next pit in counter-clockwise order
            if (currentPit === 5) {
                // From rightmost player pit to player store
                currentPit = 6;
            } else if (currentPit === 6) {
                // From player store to rightmost CPU pit
                currentPit = 12;
            } else if (currentPit === 7) {
                // From leftmost CPU pit to CPU store
                currentPit = 13;
            } else if (currentPit === 13) {
                // From CPU store to leftmost player pit
                currentPit = 0;
            } else if (currentPit >= 0 && currentPit < 5) {
                // Moving right along player's row
                currentPit++;
            } else if (currentPit > 7 && currentPit <= 12) {
                // Moving left along CPU's row
                currentPit--;
            }
            
            // Skip opponent's store
            if (player === 'player' && currentPit === 13) {
                // Player skips CPU's store
                currentPit = 0;
            } else if (player === 'cpu' && currentPit === 6) {
                // CPU skips player's store
                currentPit = 12;
            }
            
            // Add stone to the current pit
            this.simulateBoardState[currentPit]++;
            lastPit = currentPit;
        }
        
        // Simulate capture rule
        if (player === 'player') {
            // Player capture condition
            if (lastPit >= 0 && lastPit <= 5 && this.simulateBoardState[lastPit] === 1) {
                // Calculate opposite pit - for player, the opposite pit is 7 more than the player's pit
                const oppositePit = lastPit + 7;
                if (this.simulateBoardState[oppositePit] > 0) {
                    // Simulate capture in the board state
                    this.simulateBoardState[6] += this.simulateBoardState[oppositePit] + 1;
                    this.simulateBoardState[oppositePit] = 0;
                    this.simulateBoardState[lastPit] = 0;
                }
            }
        } else {
            // CPU capture condition
            if (lastPit >= 7 && lastPit <= 12 && this.simulateBoardState[lastPit] === 1) {
                // Calculate opposite pit - for CPU, the opposite pit is 7 less than the CPU's pit
                const oppositePit = lastPit - 7;
                if (this.simulateBoardState[oppositePit] > 0) {
                    // Simulate capture in the board state
                    this.simulateBoardState[13] += this.simulateBoardState[oppositePit] + 1;
                    this.simulateBoardState[oppositePit] = 0;
                    this.simulateBoardState[lastPit] = 0;
                }
            }
        }
        
        return lastPit;
    }
    
    cpuTurn() {
        if (this.gameOver || this.animationInProgress) return;
        
        // Choose a move based on simple heuristic
        const pitIndex = this.chooseCpuMove();
        
        if (pitIndex !== null) {
            // Log the CPU move
            this.logDebug(`CPU move: Pit ${pitIndex} (${this.board[pitIndex]} stones)`);
            
            // Animate the CPU move
            this.animateMove(pitIndex, 'cpu');
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
            
            // Log the simulated board state
            let simBoardStr = 'Simulated board: [';
            for (let j = 0; j < this.simulateBoardState.length; j++) {
                simBoardStr += this.simulateBoardState[j];
                if (j < this.simulateBoardState.length - 1) simBoardStr += ',';
            }
            simBoardStr += ']';
            this.logDebug(`- Pit ${i} simulation: last pit ${lastPit}, ${simBoardStr}`);
            
            // Check if this move leads to an extra turn
            if (lastPit === 13) {
                this.logDebug(`- Pit ${i}: CHOSEN - Will land in store (extra turn)`);
                return i; // Found a move that gives extra turn
            }
            
            // Check if this move leads to a capture
            // The capture is now simulated within simulateMove, so we only need to check
            // if the simulated board's CPU store has more stones than the original board
            if (this.simulateBoardState[13] > this.board[13]) {
                const capturedStones = this.simulateBoardState[13] - this.board[13];
                this.logDebug(`- Pit ${i}: CHOSEN - Will capture ${capturedStones} stones`);
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
        // Clear all stones first (except animated ones)
        document.querySelectorAll('.stone:not(.animated-stone)').forEach(stone => stone.remove());
        
        // Update player pits
        for (let i = 0; i < 6; i++) {
            const pit = this.playerPits[i];
            const count = this.board[i];
            
            // Set data-count attribute for CSS to display
            pit.setAttribute('data-count', count);
            pit.querySelector('.stones-count').textContent = count;
            
            // Add visual stones
            this.renderStones(pit, count);
            
            // Enable/disable pits based on game state
            if (this.currentPlayer === 'player' && count > 0 && !this.gameOver && !this.animationInProgress) {
                pit.classList.remove('disabled');
            } else {
                pit.classList.add('disabled');
            }
        }
        
        // Update CPU pits
        for (let i = 0; i < 6; i++) {
            const pit = this.cpuPits[i];
            const count = this.board[12 - i];
            
            // Set data-count attribute for CSS to display
            pit.setAttribute('data-count', count);
            pit.querySelector('.stones-count').textContent = count;
            pit.classList.add('disabled'); // CPU pits are always disabled for player
            
            // Add visual stones
            this.renderStones(pit, count);
        }
        
        // Update stores
        this.playerStore.querySelector('.store-count').textContent = this.board[6];
        this.cpuStore.querySelector('.store-count').textContent = this.board[13];
        
        // Update the store counts displayed by the ::after pseudo-element
        this.playerStore.setAttribute('data-count', this.board[6]);
        this.cpuStore.setAttribute('data-count', this.board[13]);
        
        // Add visual stones to stores
        this.renderStones(this.playerStore, this.board[6], true);
        this.renderStones(this.cpuStore, this.board[13], true);
    }
    
    renderStones(container, count, isStore = false) {
        // Skip rendering if there are animated stones in progress
        if (container.querySelector('.animated-stone')) {
            return;
        }
        
        // Don't render too many stones visually
        const maxVisualStones = isStore ? 6 : 4;
        const visibleCount = Math.min(count, maxVisualStones);
        
        // Create unique ID for this container
        const containerID = container.id || 
                          (container.classList.contains('player-pit') ? 'player-' + this.playerPits.indexOf(container) : 
                           container.classList.contains('cpu-pit') ? 'cpu-' + this.cpuPits.indexOf(container) : 'unknown');
        
        // Initialize positions for this container if not already done
        if (!this.stonePositionsMap.has(containerID)) {
            this.stonePositionsMap.set(containerID, []);
            
            // Reset the seed based on container ID to ensure same container always gets same positions
            this.randomSeed = containerID.split('').reduce((acc, char) => acc + char.charCodeAt(0), 12345);
            
            // Pre-generate stone positions and colors for the maximum number of stones
            for (let i = 0; i < maxVisualStones; i++) {
                const containerWidth = container.clientWidth - 25;
                const containerHeight = container.clientHeight - 25;
                
                let left, top;
                
                if (isStore) {
                    // For stores, cluster them more in the center
                    const centerX = containerWidth / 2;
                    const centerY = containerHeight / 2;
                    
                    // Create a more clustered arrangement
                    const angle = this.seededRandom() * Math.PI * 2;
                    const distance = this.seededRandom() * 25;
                    
                    left = centerX + Math.cos(angle) * distance;
                    top = centerY + Math.sin(angle) * distance;
                } else {
                    // For pits, create a tighter cluster in the center
                    const centerX = containerWidth / 2;
                    const centerY = containerHeight / 2;
                    
                    // Random angle and shorter distance to keep them closer to center
                    const angle = this.seededRandom() * Math.PI * 2;
                    const distance = this.seededRandom() * 15;
                    
                    left = centerX + Math.cos(angle) * distance;
                    top = centerY + Math.sin(angle) * distance;
                }
                
                // Ensure stones stay within bounds
                left = Math.max(5, Math.min(containerWidth - 5, left));
                top = Math.max(5, Math.min(containerHeight - 5, top));
                
                // Random color from our palette
                const colorIndex = Math.floor(this.seededRandom() * this.stoneColors.length);
                const rotation = this.seededRandom() * 360;
                
                this.stonePositionsMap.get(containerID).push({
                    left: left,
                    top: top,
                    color: this.stoneColors[colorIndex],
                    rotation: rotation
                });
            }
        }
        
        // Use the saved positions and colors to render stones
        for (let i = 0; i < visibleCount; i++) {
            const stone = document.createElement('div');
            stone.className = 'stone';
            
            // Get the pre-generated position, color and rotation for this stone
            const stoneData = this.stonePositionsMap.get(containerID)[i];
            
            stone.style.left = stoneData.left + 'px';
            stone.style.top = stoneData.top + 'px';
            stone.style.backgroundColor = stoneData.color;
            stone.style.transform = `rotate(${stoneData.rotation}deg)`;
            
            container.appendChild(stone);
        }
    }
    
    setStatusMessage(message) {
        this.statusMessage.textContent = message;
    }
    
    playSound(sound) {
        if (this.soundEnabled) {
            // Clone the sound to allow overlapping sounds
            const soundClone = sound.cloneNode();
            soundClone.volume = sound.volume;
            soundClone.play().catch(error => {
                // Silently handle autoplay restrictions
                console.log("Sound playback prevented:", error);
            });
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            this.soundToggleButton.textContent = '🔊 Sound On';
            // Play a quick sound to confirm it's on
            this.playSound(this.stoneDropSound);
        } else {
            this.soundToggleButton.textContent = '🔇 Sound Off';
        }
        this.logDebug(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MancalaGame();
}); 