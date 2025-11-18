# AGENTS.md

## Project Overview

Zigbee2MQTT WindFront is a modern frontend UI for [Zigbee2MQTT](https://github.com/Koenkk/zigbee2mqtt), built with React 19, TypeScript, Vite, Tailwind CSS, and DaisyUI. The application provides a real-time interface for managing Zigbee devices through WebSocket communication, supporting multiple Zigbee2MQTT instances simultaneously.

**Key Technologies:**
- React 19 with TypeScript (ESNext)
- Vite 7 (build tool & dev server)
- Tailwind CSS 4 + DaisyUI 5 (styling)
- Zustand (state management)
- i18next (internationalization - 25+ languages)
- Biome (linting & formatting)
- Vitest (testing)
- WebSocket for real-time communication

**Architecture:**
- Monolithic frontend with component-based architecture
- Multi-instance support via `sourceIdx` indexing
- Real-time WebSocket communication with Zigbee2MQTT backend
- Mock server for development (auto-starts on `npm start`)

## Setup Commands

### Initial Setup

```bash
# Install dependencies (requires Node.js >=22.12.0)
npm ci

# Or if package-lock.json doesn't exist
npm install
```

### Environment Setup

The project uses environment variables for configuration:

```bash
# Development with mock data (default)
npm start

# Development with real Zigbee2MQTT instance
Z2M_API_URI="ws://192.168.1.200:8080" npm start

# Development with multiple instances
VITE_Z2M_API_URLS="localhost:8080/api,192.168.1.100:8080/api" \
VITE_Z2M_API_NAMES="Main,Secondary" \
npm start
```

**Available Environment Variables:**
- `Z2M_API_URI` - Single Zigbee2MQTT WebSocket URL (dev only)
- `VITE_Z2M_API_URLS` - Comma-separated list of API URLs
- `VITE_Z2M_API_NAMES` - Comma-separated list of instance names
- `VITE_USE_PROXY` - Enable proxy mode (true/false)

## Development Workflow

### Start Development Server

```bash
# Start with mock WebSocket server on port 5173
npm start

# Access at http://localhost:5173/
```

The mock server automatically starts when running `npm start` and provides fake Zigbee2MQTT data from the `mocks/` directory for testing without a real backend.

### Hot Reload

Vite provides instant hot module replacement (HMR). Changes to React components, styles, and TypeScript files reload automatically.

### File Structure

```
src/
├── components/          # Reusable React components
│   ├── dashboard-page/  # Page-specific components
│   ├── device-page/
│   ├── group-page/
│   ├── network-page/
│   ├── settings-page/
│   ├── editors/         # Form editors
│   ├── features/        # Zigbee feature components
│   ├── form-fields/     # Form field components
│   ├── table/           # Table components
│   └── value-decorators/
├── hooks/               # Custom React hooks
├── i18n/locales/        # Translation JSON files
├── layout/              # Layout components
├── pages/               # Top-level page components
├── websocket/           # WebSocket manager
├── store.ts             # Zustand global state
├── types.ts             # TypeScript type definitions
└── utils.ts             # Utility functions
```

### Key Patterns

- **Components**: PascalCase files (e.g., `Button.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTable.ts`)
- **Imports**: Always use `.js` extensions (TypeScript requirement)
- **State**: Zustand store with multi-source indexing via `sourceIdx`
- **Styling**: DaisyUI components + Tailwind utilities

## Testing Instructions

### Run All Tests

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run test:cov
```

Coverage reports are generated in the `coverage/` directory with both text and HTML output.

**Testing Philosophy:**
- Focus on smoke tests and critical functionality
- Visual regression via Storybook
- Manual validation for UI changes
- Real-time features require manual testing with actual Zigbee2MQTT instance

**Test Framework:**
- Vitest with jsdom environment
- Tests located in `test/` directory
- Minimal but functional test suite

### Type Checking

```bash
npm run typecheck
```

Runs TypeScript compiler in validation mode without emitting files. All code must pass type checking before merging.

## Code Style Guidelines

### Formatting and Linting

**Primary Tool:** Biome (replaces ESLint + Prettier)

```bash
# Check and auto-fix all issues
npm run check

# Check only (CI mode, no auto-fix)
npm run check:ci
```

**Biome Configuration:**
- Indent: 4 spaces
- Line width: 150 characters
- Quote style: Double quotes
- Line ending: LF
- Auto-organize imports

### Key Linting Rules

- **Naming conventions**: Mix of snake_case (API), camelCase (general), PascalCase (components), CONSTANT_CASE (constants)
- **No unused imports**: Auto-removed (error level)
- **No unused variables**: Warning level
- **Exhaustive dependencies**: React hooks must have complete dependency arrays (error)
- **Self-closing elements**: Required for components without children (error)
- **No inferrable types**: Don't specify obvious types (error)

### Import Patterns

Always use `.js` extensions in TypeScript imports:

```typescript
import Button from "./Button.js";
import { sendMessage } from "../websocket/WebSocketManager.js";
import type { Device } from "../types.js";
```

Import order (auto-organized by Biome):
1. External libraries
2. Internal modules
3. Types (inline with `type` keyword)

### Component Patterns

Use `memo`, `useCallback`, and `useMemo` for performance:

```typescript
import { memo, useCallback, useMemo } from "react";

const MyComponent = memo(() => {
    const data = useMemo(() => expensiveComputation(), [deps]);
    const handler = useCallback(() => { /* ... */ }, [deps]);
    
    return <div>{/* ... */}</div>;
});

export default MyComponent;
```

### Styling Conventions

Use DaisyUI components and Tailwind utilities:

```typescript
// DaisyUI button classes
<button className="btn btn-primary btn-outline">

// Flexbox utilities
<div className="flex flex-row gap-2 items-center">

// Truncation for overflow prevention
<span className="truncate">Long text</span>
<div className="min-w-0">  // Enable shrinking
```

### Multi-Instance Support

Always consider multi-source scenarios. State is indexed by `sourceIdx`:

```typescript
for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
    const devices = useAppStore((state) => state.devices[sourceIdx]);
    // ... work with source-specific data
}
```

## Build and Deployment

### Build for Production

```bash
# Clean and build
npm run clean
npm run build

# Or use prepack script (runs both)
npm run prepack
```

**Build Output:**
- Output directory: `dist/`
- Includes source maps
- Brotli compression enabled
- Manual code splitting for critical paths

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing before deployment.

### Docker Build

```bash
# Build Docker image
docker build -t zigbee2mqtt-windfront .

# Run container
docker run -p 80:80 \
  -e Z2M_API_URLS="localhost:8080/api" \
  -e Z2M_API_NAMES="Main" \
  zigbee2mqtt-windfront
```

**Docker Compose:**

```bash
docker-compose up -d
```

See `docker-compose.yml` for configuration example with multiple instances.

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Code Quality Checks:**
   - `npm run check:ci` - Biome linting/formatting
   - `npm run typecheck` - TypeScript validation (shortcut for `tsc --noEmit`)
   
2. **Build:**
   - `npm run build` - Production build
   
3. **Testing:**
   - `npm run test:cov` - Tests with coverage

4. **Docker Image:**
   - Built on main branch (`edge` tag)
   - Built on version tags (semantic versioning)
   - Multi-platform: amd64, arm64, arm/v6, arm/v7, riscv64, 386

**All checks must pass before merging PRs.**

## Storybook

### Run Storybook

```bash
# Start Storybook dev server on port 6006
npm run storybook

# Build static Storybook
npm run build-storybook
```

Storybook is used for component development and visual regression testing. Stories are located in `src/stories/`.

## Translation (i18n)

### Adding/Updating Translations

Translation files are located in `src/i18n/locales/` as JSON files.

**Supported Languages:** 25+ including en, es, de, fr, it, ja, ko, zh, ru, etc.

**Process:**
1. Use `en.json` as the reference (contains all keys)
2. Copy structure to your target language file
3. Translate only the values, keep keys unchanged

```json
// en.json
{
    "common": {
        "action": "Action"
    }
}

// es.json
{
    "common": {
        "action": "Acción"
    }
}
```

**Validation:**

```bash
# Check i18n files for issues
# (runs automatically in CI via .github/workflows/i18n.yml)
```

Translation files can be edited directly on GitHub. The workflow validates translations automatically.

## Pull Request Guidelines

### Before Submitting

Run all checks locally:

```bash
# 1. Format and lint
npm run check

# 2. Type check
npm run typecheck

# 3. Build
npm run build

# 4. Test
npm run test:cov
```

All must pass before creating a PR.

### PR Requirements

- **Title format**: Clear, descriptive title (no strict format required)
- **Required checks**: All CI checks must pass
  - Biome linting/formatting (`npm run check:ci`)
  - TypeScript type checking (`npm run typecheck`)
  - Production build (`npm run build`)
  - Test suite (`npm run test:cov`)
- **Code style**: Must follow Biome configuration
- **Tests**: Update or add tests for new features/changes
- **Translations**: Include translation updates if adding UI text

### Commit Conventions

Follow semantic commit messages:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Repository maintenance
- `docs:` - Documentation updates

### Review Process

- PRs are reviewed by maintainers
- Address all review comments
- Keep PRs focused on single features/fixes
- Rebase on main if needed to resolve conflicts

## Debugging and Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm start -- --port 3000
```

**WebSocket connection fails:**
- Verify `Z2M_API_URI` is correct
- Check Zigbee2MQTT is running and accessible
- Ensure WebSocket port is not blocked by firewall
- Try mock mode first: `npm start` (no env vars)

**Build fails:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

**Type errors:**
```bash
# Rebuild TypeScript declarations
npm run typecheck

# Check node version (must be >=22.12.0)
node --version
```

### Development Tips

- **Fast component development**: Use Storybook (`npm run storybook`)
- **Mock data editing**: Modify files in `mocks/` directory
- **State inspection**: Use React DevTools and Zustand DevTools
- **Network debugging**: Browser DevTools → Network → WS tab
- **Multi-instance testing**: Set multiple URLs in `VITE_Z2M_API_URLS`

### Performance Considerations

- Use `memo`, `useCallback`, `useMemo` appropriately
- Zustand: Use `useShallow` for array/object selectors
- Components are memoized to prevent unnecessary re-renders
- Large lists use virtualization (react-virtuoso)

## Additional Context

### Project-Specific Instructions

**Instruction Files:** Check `.github/instructions/` for detailed guides:
- `reactjs.instructions.md` - React development standards
- `daisyui.instructions.md` - DaisyUI component usage
- `github-actions-ci-cd-best-practices.instructions.md` - CI/CD guidelines

**Copilot Instructions:** See `.github/copilot/copilot-instructions.md` for comprehensive coding guidelines and patterns.

### Architecture Notes

- **State Management**: Zustand store with multi-source indexing
- **Real-time Updates**: WebSocket manager handles connections, batching, and reconnection
- **Type Safety**: Full TypeScript coverage with strict null checks
- **Responsive Design**: Mobile-first with DaisyUI responsive utilities
- **Accessibility**: DaisyUI provides WCAG-compliant components

### Security Considerations

- Token-based authentication stored in localStorage
- WebSocket authentication via `AUTH_TOKEN_KEY`
- CORS handling through proxy configuration
- Input validation before WebSocket message sending

### Version Requirements

- **Node.js**: >=22.12.0 (strict requirement)
- **Package Manager**: npm (use `npm ci` for CI/CD)
- **Module System**: ESM only

### Useful Commands Summary

```bash
# Development
npm start                 # Dev server with mocks
npm run storybook         # Component development

# Quality checks
npm run check             # Auto-fix linting/formatting
npm run typecheck         # Type validation
npm run test              # Run tests
npm run test:cov          # Tests with coverage

# Build
npm run build             # Production build
npm run preview           # Preview production build

# Maintenance
npm ci                    # Clean install
npm run clean             # Remove dist/
```

---

For more information, see:
- [README.md](./README.md) - User-facing documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [Wiki](https://github.com/Nerivec/zigbee2mqtt-windfront/wiki) - Detailed documentation
