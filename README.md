# Mancala Game

A browser-based implementation of the classic Mancala board game where you can play against a CPU opponent.

## Game Overview

Mancala is one of the oldest known board games, with evidence of mancala-like games dating back to ancient Egypt. This implementation follows standard Mancala rules with six pits per player and a store (Mancala) at each end.

## Features

- Beautiful UI with visual representation of the game board, pits, stones, and scores
- CPU opponent with a strategic AI that prioritizes moves based on basic heuristics
- Game rule enforcement (sowing, capturing, extra turns)
- Sound effects for moving stones between pits
- End-game detection and winner announcement
- Responsive design that works on different screen sizes

## How to Run

1. Clone or download this repository
2. Open the `index.html` file in your web browser
3. No additional dependencies or installation required!

## How to Play

### Basic Rules

1. The game begins with 4 stones in each of the 12 small pits.
2. On your turn, select one of your six pits (bottom row) to pick up all stones from that pit.
3. Moving counter-clockwise, deposit one stone in each pit, including your store (right end) but skipping your opponent's store.
4. Special rules:
   - If your last stone lands in your store, you get another turn.
   - If your last stone lands in an empty pit on your side, you capture all stones from the opposite pit and your own stone, placing them in your store.
5. The game ends when all six pits on either side are empty.
6. The player with the most stones in their store wins.

### Controls

- Click on any of your pits (bottom row) that contains stones to make a move.
- The status message will indicate whose turn it is and game status.
- Click the "Sound On/Off" button to toggle game sound effects.
- Click the "Restart Game" button to reset the game at any time.

## Development

This game is built with vanilla JavaScript, HTML, and CSS. No frameworks or libraries are used, making it lightweight and easy to understand.

### Sound Effects

The game includes stone dropping sound effects when moving pieces. If you want to customize the sound:
- Check the `assets/sounds` directory
- Follow the instructions in `assets/sounds/README.md` to create or replace the sound effect

## License

This project is open source and available for educational and personal use.

Enjoy the game! 