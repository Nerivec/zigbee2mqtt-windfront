# GitHub Copilot Instructions for Zigbee2MQTT WindFront

## Priority Guidelines

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect the exact versions of languages, frameworks, and libraries used in this project.
2. **Context Files**: Prioritize patterns and standards defined in the .github/instructions directory.
3. **Codebase Patterns**: When context files do not provide specific guidance, scan the codebase for established patterns.
4. **Architectural Consistency**: Maintain the monolithic frontend architecture with clear component boundaries.
5. **Code Quality**: Prioritize maintainability, performance, accessibility, and testability in all generated code.

## Technology Version Detection

Before generating code, scan the codebase to identify exact versions:

### Language Versions
- **Node.js**: >=22.12.0 (package.json engines)
- **TypeScript**: ^5.9.3 (package.json)
- **ECMAScript**: ESNext target and DOM libs (tsconfig.json)
- **JSX**: react-jsx (tsconfig.json)
- **Module System**: ESM only (package.json "type": "module")

### Framework Versions
- **React**: ^19.2.4
- **React DOM**: ^19.2.4
- **React Router**: ^7.13.0 (react-router package; hash routing is used)
- **Vite**: ^7.3.1
- **Tailwind CSS**: ^4.1.4
- **DaisyUI**: ^5.5.14
- **Storybook**: ^10.2.0

### Key Library Versions
- **Zustand**: ^5.0.10
- **i18next**: ^25.8.0
- **react-i18next**: ^16.5.3
- **@tanstack/react-table**: ^8.21.3
- **Biome**: ^2.3.13
- **Vitest**: ^4.0.18
- **@vitest/coverage-v8**: ^4.0.18
- **FontAwesome**: @fortawesome/fontawesome-svg-core ^7.1.0, @fortawesome/react-fontawesome ^3.1.1
- **store2**: ^2.14.4
- **lodash**: ^4.17.23
- **reagraph**: ^4.30.7
- **react-virtuoso**: ^4.18.1 and @virtuoso.dev/masonry ^1.4.0
- **react-select**: ^5.10.2
- **react-image**: ^4.1.0
- **jszip**: ^3.10.1
- **file-saver**: ^2.0.5
- **zigbee2mqtt**: github:Koenkk/zigbee2mqtt#dev-types

## Context Files

Reference these instruction files in .github/instructions (in priority order):

1. reactjs.instructions.md
2. daisyui.instructions.md
3. github-actions-ci-cd-best-practices.instructions.md

## Architecture and Structure

- Monolithic frontend with component boundaries by feature/page.
- Multi-instance support via sourceIdx indexing across state and WebSocket flows.
- Real-time updates via a centralized WebSocket manager.
- Hash-based routing with React Router v7.

## Codebase Patterns

### Project Structure

- src/components: Reusable React components organized by page and domain
- src/hooks: Custom hooks
- src/i18n/locales: Translation JSON files
- src/layout: Layout components
- src/pages: Route-level pages
- src/styles: Global styles
- src/websocket: WebSocket manager and handlers
- src/store.ts: Zustand store
- src/utils.ts: Shared utilities

### Naming Conventions

- Components: PascalCase (e.g., PermitJoinButton)
- Hooks: camelCase with use prefix (e.g., useTable)
- Utilities: camelCase (e.g., utils)
- Folders: kebab-case for page-specific folders (e.g., dashboard-page)
- API properties: snake_case to match Zigbee2MQTT
- Internal properties: camelCase

### Import Patterns

- **Always use .js extensions in TS/TSX imports** (moduleResolution: bundler, ESM).
- Import order is handled by Biome (external first, then internal; types inline with type keyword).
- **No barrel files or re-export-all** (Biome rules: noBarrelFile, noReExportAll).

### React Patterns

- Functional components with hooks are the default.
- Use React lazy + Suspense for page-level code splitting.
- Use memoization with memo, useMemo, and useCallback when it matches existing patterns.
- React Router uses HashRouter and the v7 API.

### State Management (Zustand)

- Global state is in src/store.ts with action methods.
- State is indexed by sourceIdx for multi-instance support.
- Use useShallow for selectors that return arrays/objects.

### WebSocket Communication

- WebSocket access goes through src/websocket/WebSocketManager.ts.
- Messages are indexed by sourceIdx for multi-instance support.

### Internationalization

- react-i18next is used with namespaces (e.g., navbar, common, device).
- Translation files live in src/i18n/locales and are JSON.

### Styling

- Tailwind CSS + DaisyUI only; avoid custom CSS unless required.
- Use DaisyUI component classes and Tailwind utilities.
- Truncation pattern: wrap long text in elements with truncate and ensure the parent has min-w-0.

### Local Storage

- store2 is used for persistent local storage.

## Code Quality Standards (Biome)

- Indentation: 4 spaces
- Line width: 150
- Line ending: LF
- Quote style: double
- Organize imports: on
- React hooks must include exhaustive dependencies
- Use self-closing elements when possible

## Testing

- Test runner: Vitest (jsdom)
- Tests live in test/
- Keep tests minimal and aligned with existing patterns

## Build and Runtime

- Vite dev server: npm start
- Production build: npm run build
- Type checking: npm run typecheck
- Lint/format: npm run check

## Documentation

- Keep comments minimal and self-documenting, matching existing files.
- Add JSDoc only when needed for complex utilities or public APIs.

## General Guidance

- Follow the most consistent pattern found in the codebase.
- Do not introduce new architectural layers or cross-module dependencies.
- Prefer existing utilities, hooks, and components over new abstractions.
- Maintain multi-instance support across the app (sourceIdx-aware logic).
