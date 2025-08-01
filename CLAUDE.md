# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Testing
- `npm run pretest` - Cleans dist/, runs ESLint, and builds with Babel (lib/ → dist/)
- `npm test` - Runs Istanbul coverage on Jasmine unit tests
- `npm run posttest` - Post-test cleanup script

### Linting
- ESLint is configured and runs on `test/**/*.js` and `lib/*.js`
- Use `eslint test/**/*.js lib/*.js` directly for linting

## Project Architecture

This is a Node.js interface for the Frotz Z-machine interpreter, allowing JavaScript applications to play Infocom text adventure games.

### Code Structure
- **Source**: `lib/` contains ES6 source code
- **Distribution**: `dist/` contains Babel-transpiled ES5 code for compatibility
- **Entry Point**: `index.js` → `dist/index.js`
- **Main Class**: `DFrotzInterface` in `lib/index.js`

### Key Components

**DFrotzInterface Class** (`lib/index.js`):
- Wraps the dfrotz (dumb frotz) executable
- Manages game state through save/restore operations
- Handles command execution and output filtering
- Uses Bluebird promises for async operations

**Core Flow**:
1. Check for existing save file
2. Initialize dfrotz process with game image
3. Restore save if exists, otherwise start new game
4. Execute user command
5. Save game state and quit

**Dependencies**:
- `bluebird` for promise handling
- `dfrotz` binary (included in `frotz/dfrotz`)
- Game data files in `frotz/data/` (Zork 1-3 included)

### File Organization
- `frotz/dfrotz` - The dumb frotz executable
- `frotz/data/zork*/` - Game data and save directories
- `lib/errors.js` - Custom error classes
- `test/` - Jasmine test suites (unit and integration)

### Build Process
The project uses Babel to transpile ES6 (`lib/`) to ES5 (`dist/`) for Node.js compatibility. The build process is integrated into the test workflow.