# My Online Games 🎮

A collection of online multiplayer games built with React and Vite, including:
- **Golf Card Game** 🏌️‍♂️🃏 - A digital card game where the lowest score wins
- **Race Game** 🏁 - An exciting racing game

## 🎮 Game Rules

### Objective
The goal is to have the **lowest total score** after 9 holes (rounds). Each hole consists of players managing a 4x2 grid of cards, trying to minimize their point values.

### Setup
- 2-6 players (mix of human and computer players)
- Each player receives 8 cards arranged in a 4x2 grid (face-down)
- At the start of each hole, players flip 2 cards to see their values
- A draw pile and discard pile are available

### Gameplay
On your turn:
1. **Draw** a card from the draw pile OR **pick up** the top card from the discard pile
2. Either:
   - **Replace** one of your face-down cards with the drawn card, or
   - **Discard** the drawn card (if you picked from discard, you must replace a card)
3. If you discard, flip one face-down card to reveal it

### Scoring
- Cards are worth their face value (0-12 points)
- Special **Hole-In-One** cards are worth -5 points
- **Matching vertical pairs** (same column, same value): Both cards cancel out (0 points)
- **Column bonuses**:
  - 2 matching columns: -10 bonus
  - 3 matching columns: -15 bonus
  - 4 matching columns: -20 bonus
- Collecting all four -5 cards: Additional -10 bonus (total -30 for all four)

### Ending a Hole
When one player reveals all their cards, other players get one final turn. After all turns are complete, cards are scored and the next hole begins.

### Winning
The player with the **lowest total score** after 9 holes wins!

## 🚀 Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-online-games
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Automatically fix linting errors

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ActionBar.jsx    # Game control buttons
│   ├── Card.jsx         # Individual card with flip animation
│   ├── DrawDiscardArea.jsx  # Draw/discard pile interface
│   ├── ErrorBoundary.jsx    # Error handling wrapper
│   ├── PlayerBoard.jsx  # Player's card grid
│   ├── PlayerSetup.jsx  # Initial game configuration
│   └── Scorecard.jsx    # Score tracking table
├── hooks/
│   └── useGameState.js  # Main game logic and state management
├── utils/
│   └── score.js         # Scoring calculation utilities
├── test/
│   └── gameTestHelpers.js  # Shared test utilities
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
└── setupTests.js        # Test configuration
```

## 🧪 Testing

The project uses Vitest and React Testing Library for testing.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

Tests are co-located with their source files (e.g., `Card.jsx` has `Card.test.jsx` in the same directory).

## 📦 Building for Production

1. Build the application:
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

2. Preview the production build locally:
```bash
npm run preview
```

### Build Output
- Bundle size: ~234KB JS (73KB gzipped)
- Optimized CSS with Tailwind
- Fast load times for immediate gameplay

## 🚢 Deployment

The built application is a static site that can be deployed to any static hosting service:

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### GitHub Pages
1. Update `vite.config.js` with your repository name:
```js
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

2. Build and deploy:
```bash
npm run build
gh-pages -d dist
```

## 🎨 Features

- ✅ Persistent game state (auto-saves to localStorage)
- ✅ Computer AI opponents with configurable speed
- ✅ Smooth card flip animations
- ✅ Detailed score breakdowns
- ✅ 9-hole gameplay with running totals
- ✅ Responsive design
- ✅ Error boundary for graceful error handling
- ✅ PropTypes for runtime type checking
- ✅ Comprehensive test coverage

## 🛠️ Technology Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **PropTypes** - Runtime type checking
- **Framer Motion** - Animation library

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
