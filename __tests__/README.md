# Mancala Game Tests

This directory contains automated tests for the Mancala game. The tests are written using Jest and JSDOM to simulate a browser environment.

## Test Files

- `game.test.js` - Basic game functionality tests
- `endgame.test.js` - Tests for end-game scenarios
- `player-cpu-interaction.test.js` - Tests for player and CPU turns and interactions
- `game-rules.test.js` - Tests for Mancala-specific game rules like capturing and extra turns

## Running the Tests

To run the tests, you need to have Node.js and npm installed. Then:

1. Install the dependencies:
   ```
   npm install
   ```

2. Run the tests:
   ```
   npm test
   ```

3. Run tests with coverage:
   ```
   npm test -- --coverage
   ```

4. Run a specific test file:
   ```
   npm test -- __tests__/game.test.js
   ```

## Test Coverage

The tests cover the main functionality of the game including:

- Game initialization
- Player moves and validation
- CPU AI and strategy
- Game rules (capturing, extra turns, skipping opponent's store)
- End game conditions and score calculation

## Adding More Tests

To add more tests:

1. Create a new test file in the `__tests__` directory
2. Follow the pattern in existing test files
3. Make sure to set up the mock DOM elements in each test file

## Troubleshooting

If you encounter issues with the tests:

- Check that all DOM elements needed by the game are properly mocked
- Make sure the test environment correctly simulates browser APIs
- Verify that animations and timeouts are properly bypassed for testing 