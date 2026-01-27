# AGENTS.md

## Project Overview

Zigbee2MQTT WindFront is a React + TypeScript frontend for Zigbee2MQTT. It uses Vite for bundling, Tailwind CSS v4 with daisyUI v5 for styling, Zustand for global state, and react-router (hash routing) for navigation.

Key architecture notes:
- Monolithic frontend with feature/page component boundaries.
- Multi-instance support via `sourceIdx` across state and WebSocket flows.
- Real-time updates via a centralized WebSocket manager.
- i18n with `react-i18next` and JSON namespaces.

## Setup Commands

- Install dependencies: `npm install`
- Node.js: >= 22.12.0 (required)

Optional dev environment variables:
- `VITE_Z2M_API_URLS` and `VITE_Z2M_API_NAMES` for multi-instance setups.

## Development Workflow

- Start dev server: `npm start`
- Start dev server with sample envs: `npm run start:envs`
- Preview production build: `npm run preview`

Vite dev server is rooted at `src/` and proxies `/api` to a Zigbee2MQTT WebSocket endpoint (`Z2M_API_URI` or `ws://localhost:8579`).

## Testing Instructions

- Run all tests: `npm test`
- Run tests with coverage: `npm run test:cov`

Testing details:
- Runner: Vitest (jsdom)
- Tests location: `test/`
- Coverage output: `coverage/` (HTML + text)

## Code Style and Conventions

- TypeScript strict mode (ESNext target, ESM only).
- Use functional React components and hooks.
- Use 4-space indentation, LF line endings.
- Use Biome for formatting and linting:
  - `npm run check` (fix + format)
  - `npm run check:ci` (CI mode)
- Always use `.js` extensions in TS/TSX imports (ESM + bundler resolution).
- No barrel files or re-export-all.

Styling rules:
- Use Tailwind CSS + daisyUI classes; avoid custom CSS unless necessary.
- Prefer daisyUI component classes and semantic colors.
- Truncation pattern: `truncate` on text, and ensure parent has `min-w-0`.

Naming conventions:
- Components: PascalCase
- Hooks: `use` prefix (camelCase)
- Utilities: camelCase
- Feature folders: kebab-case
- API properties: snake_case

## Project Structure

- `src/components/`: reusable components by domain/page
- `src/pages/`: route-level pages
- `src/layout/`: layout components
- `src/hooks/`: custom hooks
- `src/websocket/`: WebSocket manager + handlers
- `src/store.ts`: Zustand global state
- `src/i18n/locales/`: translation JSON files
- `src/utils.ts`: shared utilities

## Build and Deployment

- Production build: `npm run build`
- Clean build output: `npm run clean`
- Type checking: `npm run typecheck`

Output:
- Build artifacts are generated into `dist/`.

## Storybook

- Start Storybook: `npm run storybook`
- Build Storybook: `npm run build-storybook`

## Pull Request Guidelines

- Keep changes aligned with existing component boundaries and `sourceIdx` patterns.
- Update or add tests in `test/` for behavior changes.
- Run `npm run check` and `npm test` before opening a PR.

## Debugging and Troubleshooting

- If API calls fail in dev, verify `Z2M_API_URI` or the dev proxy target (`ws://localhost:8579`).
- For multi-instance UI issues, confirm `sourceIdx` is preserved through state, WebSocket handlers, and selectors.

## Security and Secrets

- Do not hardcode secrets. Use environment variables and GitHub Secrets for CI/CD.
- Avoid logging sensitive data to the console.
