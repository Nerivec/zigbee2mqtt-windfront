# Zigbee2MQTT WindFront

Zigbee2MQTT WindFront is a React/TypeScript frontend web application for [Zigbee2MQTT](https://github.com/Koenkk/zigbee2mqtt) using Vite, Tailwind CSS, and DaisyUI. The application provides a modern interface for managing Zigbee devices, viewing network topology, and configuring settings.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

- **Bootstrap, build, and test the repository:**
  - `npm ci` -- installs dependencies in 37-54 seconds. NEVER CANCEL. Set timeout to 10+ minutes.
  - `rm -rf src/coverage` -- remove any existing coverage files that interfere with TypeScript
  - `npm run typecheck` -- runs TypeScript checking in 8 seconds. NEVER CANCEL. Set timeout to 10+ minutes.
  - `npm run build` -- builds for production in 15-16 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
  - `npm run check:ci` -- runs Biome linting in under 1 second. NEVER CANCEL. Set timeout to 10+ minutes.
  - `npm run test:cov` -- runs tests with coverage in 2 seconds. NEVER CANCEL. Set timeout to 30+ minutes.

- **Run the web application:**
  - ALWAYS run the bootstrapping steps first.
  - **Development with mock data:** `npm start` then open http://localhost:5173/
  - **Development with real Zigbee2MQTT:** `Z2M_API_URI="ws://192.168.1.200:8080" npm start`
  - **Production preview:** `npm run preview` (requires build first)

- **Development tools:**
  - **Storybook:** `npm run storybook` -- starts on http://localhost:6006/ (CANNOT run simultaneously with dev server due to port conflict on mock WebSocket server 8579)
  - **Build Storybook:** `npm run build-storybook`

## Node.js Version Requirements

- **Supported:** Node.js 22.12.0+

## Coding Standards

- Use TypeScript ESM conventions.
- Defer to existing code and biome rules (`biome.json`) to identify proper styling.
- Follow semver conventions
- Prefix commits and pull requests appropriately:
  - for bug fixes, use `fix: ...`
  - for new features, use `feat: ...`
  - for chores (general repository maintenance, workflow updates, etc.), use `chore: ...`
- Breaking changes that do not affect the usability and design of the user interface are fine
  - e.g. changes to the build process, internal code changes that do not affect user-facing features, i18n changes...
  - preserving backwards-compatibility in that case is NOT desired
- Breaking changes that affect the usability and design of the user interface should be avoided unless a major benefit comes from it, and if so, must be carefully noted
- Always optimize for performance
- Try to minimize dependencies

## Validation

- **ALWAYS manually validate any changes** by running the application and testing key user scenarios:
  1. **Device Management:** Navigate to devices page, view device list, test device controls
  2. **Dashboard:** Test interactive device cards with lights, sensors, switches
  3. **Network Visualization:** Load network map in both data and map views
  4. **Navigation:** Test all main navigation links work correctly
  5. **Real-time Updates:** Verify WebSocket connection shows live device data
  
- **NEVER CANCEL BUILDS OR LONG-RUNNING COMMANDS** - All commands are fast (under 1 minute) but use generous timeouts
- **Always run validation steps** after making changes to ensure functionality remains intact

## Build Pipeline & CI Requirements

- **Before committing, ALWAYS run the complete CI pipeline locally:**
  1. `npm run typecheck` -- TypeScript validation
  2. `npm run build` -- production build verification  
  3. `npm run check:ci` -- Biome linting (does not auto-fix)
  4. `npm run test:cov` -- test suite with coverage

- **Auto-fix formatting issues:** `npm run check` -- applies Biome formatting and linting fixes

## Common Tasks

The following are key commands and their expected execution times:

### Package Management
```bash
npm ci                 # Clean install (54 seconds) 
npm install            # Regular install
```

### Development
```bash
npm start              # Start dev server with mock data (port 5173)
npm run storybook      # Start Storybook (port 6006) - conflicts with dev server
npm run preview        # Preview production build
```

### Building & Testing  
```bash
npm run build                  # Production build (16 seconds) - NEVER CANCEL, timeout 60+ min
npm run typecheck              # TypeScript checking (8 seconds) - NEVER CANCEL
npm run test                   # Run tests quickly
npm run test:cov               # Run tests with coverage (2 seconds) - NEVER CANCEL, timeout 30+ min
node ./scripts/check-i18n.mjs  # Ensure i18n locale files are not mismatching with EN baseline - NEVER CANCEL, timeout 10+ min
```

### Code Quality
```bash
npm run check          # Auto-fix formatting & linting with Biome
npm run check:ci       # Check without fixes (CI mode) - under 1 second
```

### Repository Structure
```
/
├── .github/           # GitHub workflows and templates
├── .storybook/        # Storybook configuration
├── mocks/             # Mock WebSocket server and data for development
├── screenshots/       # Application screenshots for documentation
├── scripts/           # Build and utility scripts
├── src/               # Application source code
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Internationalization files
│   ├── pages/         # Page components
│   ├── stories/       # Storybook stories
│   └── styles/        # CSS and styling
├── test/              # Test files
├── biome.json         # Biome configuration (linting/formatting)
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.mts    # Vite build configuration
```

### Key Configuration Files
- **biome.json** -- Biome linting and formatting rules (replaces ESLint/Prettier)
- **vite.config.mts** -- Vite build configuration with mock server setup
- **tsconfig.json** -- TypeScript compiler options
- **package.json** -- All npm scripts and dependencies

### Port Usage
- **5173** -- Development server (Vite)
- **6006** -- Storybook
- **8579** -- Mock WebSocket server (conflicts between dev server and Storybook)

### Mock Development Environment
- Mock data in `/mocks/` folder creates fake Zigbee2MQTT server
- WebSocket server automatically starts with dev server and Storybook
- Provides realistic device data for development without real hardware

### Environment Variables
- **Z2M_API_URI** -- WebSocket URL for real Zigbee2MQTT instance (e.g., "ws://192.168.1.200:8080")
- **VITE_Z2M_API_URLS** -- Comma-separated API URLs for multi-source support
- **VITE_Z2M_API_NAMES** -- Comma-separated names for API sources

### Browser Support & Features
- Modern React 19 with TypeScript
- Responsive design with Tailwind CSS + DaisyUI
- WebSocket real-time communication
- 35+ theme options via DaisyUI
- Internationalization support
- Network visualization with interactive maps
- Device control interfaces for lights, sensors, switches

### Troubleshooting
- **TypeScript errors on coverage files:** Run `rm -rf src/coverage` before `npm run typecheck`
- **Port conflicts:** Stop dev server before starting Storybook (both use mock WebSocket port 8579)
- **Build failures:** Always run `npm run check` to fix formatting issues first
- **WebSocket errors:** Check Z2M_API_URI environment variable for correct Zigbee2MQTT address

### Testing Philosophy
- Minimal test suite focused on critical functionality
- Visual regression testing via Storybook
- Manual validation strongly emphasized for UI changes
- Real-time WebSocket functionality requires manual testing

### Performance Notes
- Build output includes manual chunk splitting for optimal loading
- Brotli compression enabled for production builds
- Large chunks (>500KB) expected due to network visualization libraries and i18n
- Build warnings about chunk size are normal and expected