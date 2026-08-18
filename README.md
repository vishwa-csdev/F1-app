# F1-app

An F1 enthusiast web dashboard that provides quick stats: driver standings, constructor standings, race center, and simple detail pages for drivers and teams. Built with React and Vite.

## Features
- Driver and constructor standings
- Race center with recent race results
- Detail pages for drivers and teams
- Simple, client-side data hooks and API layer in `src/hooks.js` and `src/api.js`

## Stack
- Languages: JavaScript, CSS, HTML
- Framework: React (Vite)
- Notable files: `src/`, `public/`, `package.json`, `vite.config.js`

## Quick start

Prerequisites: Node.js 16+ and npm (or yarn/pnpm).

Install dependencies:

```
npm install
```

Start development server:

```
npm run dev
```

Open http://localhost:5173 in your browser (Vite default).

Build for production:

```
npm run build
```

Preview the production build locally:

```
npm run preview
```

Lint (oxlint):

```
npm run lint
```

Notes
- Use `npm ci` in CI environments to install from `package-lock.json`:
  ```
  npm ci
  ```
- If you use yarn or pnpm the equivalent commands are `yarn` / `yarn dev` or `pnpm install` / `pnpm dev`.
- There are no required environment variables listed in `package.json`. If the app needs external API keys or base URLs, check `src/api.js` and add any required env var instructions to this README.

## Project layout
```
src/
  App.jsx            Main app shell and routing
  main.jsx           App entry
  api.js             Data fetching / API helpers
  hooks.js           Lightweight data hooks
  pages/             Home, Race, Drivers, Teams and detail pages
  components/        Charts, TabBar, UI components
public/              Static assets (icons, favicon)
package.json         Project scripts and dependencies
vite.config.js       Vite configuration
```

## Contributing
Issues and pull requests are welcome. Keep changes focused and include a short description of any data or UI changes.

## Legal / disclaimer
This is an independent, open-source hobby project and is not affiliated with or endorsed by Formula 1 or any related trademark holders.
