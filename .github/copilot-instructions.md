# GitHub Copilot Instructions for Zigbee2MQTT WindFront

## Priority Guidelines

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect the exact versions of languages, frameworks, and libraries used in this project
2. **Context Files**: Prioritize patterns and standards defined in the `.github/instructions/` directory
3. **Codebase Patterns**: When context files don't provide specific guidance, scan the codebase for established patterns
4. **Architectural Consistency**: Maintain the monolithic frontend architecture with clear component boundaries
5. **Code Quality**: Prioritize maintainability, performance, accessibility, and testability in all generated code

## Technology Version Detection

Before generating code, scan the codebase to identify exact versions:

### Language Versions
- **Node.js**: `>=22.12.0` (strict requirement from `package.json` engines)
- **TypeScript**: `^5.9.3` with ESNext target and module resolution set to `bundler`
- **ECMAScript**: ESNext with DOM APIs
- **JSX**: React 19 JSX transform (`react-jsx`)

### Framework Versions
- **React**: `^19.1.1` - Use React 19 features including the new JSX transform
- **React DOM**: `^19.1.9`
- **React Router**: `^7.9.3` - Use the latest router patterns
- **Vite**: `^7.1.7` - Build tool and dev server
- **TypeScript**: `^5.9.3`

### Key Library Versions
- **Zustand**: `^5.0.8` - State management (with shallow selectors)
- **i18next**: `^25.5.2` - Internationalization
- **react-i18next**: `^16.0.0`
- **Tailwind CSS**: `^4.1.4` - Utility-first CSS framework
- **DaisyUI**: `^5.1.26` - Component library built on Tailwind
- **Biome**: `^2.2.4` - Linting and formatting (replaces ESLint/Prettier)
- **Vitest**: `^3.1.2` - Testing framework
- **@tanstack/react-table**: `^8.21.3` - Table management
- **FontAwesome**: `^7.0.1` - Icons
- **store2**: `^2.14.4` - LocalStorage wrapper
- **lodash**: `^4.17.21` - Utilities
- **reagraph**: `^4.30.5` - Network visualization

## Context Files

Reference these instruction files in `.github/instructions/` (in priority order):

1. **reactjs.instructions.md**: ReactJS development standards and best practices
2. **daisyui.instructions.md**: DaisyUI component usage guide
3. **github-actions-ci-cd-best-practices.instructions.md**: CI/CD pipeline standards

## Codebase Patterns

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── dashboard-page/  # Dashboard-specific components
│   ├── device-page/     # Device page components
│   ├── group-page/      # Group page components
│   ├── network-page/    # Network visualization components
│   ├── settings-page/   # Settings components
│   ├── editors/         # Form editors
│   ├── features/        # Zigbee feature components
│   ├── form-fields/     # Form field components
│   ├── json-schema/     # JSON schema form components
│   ├── modal/           # Modal dialogs
│   ├── pickers/         # Value pickers
│   ├── table/           # Table components
│   └── value-decorators/# Value display decorators
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization
│   └── locales/         # Translation files
├── images/              # Static images
├── layout/              # Layout components (AppLayout, NavBar)
├── pages/               # Page-level components
├── stories/             # Storybook stories
├── styles/              # Global styles
├── websocket/           # WebSocket management
├── consts.ts            # Constants
├── envs.ts              # Environment variables
├── store.ts             # Zustand store
├── types.ts             # TypeScript types
└── utils.ts             # Utility functions
```

### Naming Conventions

#### Files and Folders
- **Components**: PascalCase (e.g., `PermitJoinButton.tsx`, `DeviceCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useColumnCount.ts`, `useTable.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`, `envs.ts`)
- **Types**: camelCase (e.g., `types.ts`)
- **Constants**: camelCase (e.g., `consts.ts`)
- **Folders**: kebab-case for page-specific folders (e.g., `dashboard-page/`, `device-page/`)

#### Code Elements
- **Functions**: camelCase (e.g., `sendMessage`, `getLastSeenEpoch`)
- **Components**: PascalCase (e.g., `Button`, `PermitJoinButton`)
- **Constants**: UPPER_SNAKE_CASE or camelCase based on usage (e.g., `API_URLS`, `PERMIT_JOIN_TIME_KEY`)
- **Interfaces/Types**: PascalCase (e.g., `Device`, `AppState`, `WebSocketMetrics`)
- **Properties**: snake_case for API data, camelCase for internal (follows zigbee2mqtt API conventions)

### Import Patterns

**Always use `.js` extensions in imports** (TypeScript convention with `moduleResolution: bundler`):

```typescript
import Button from "./Button.js";
import { sendMessage } from "../websocket/WebSocketManager.js";
import { useAppStore } from "../store.js";
```

**Import organization** (follow Biome's organize imports):
1. External libraries (React, third-party)
2. Internal modules (relative imports)
3. Types (can be mixed with values)

```typescript
import { faAngleDown, faTowerBroadcast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type CSSProperties, type JSX, memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { useShallow } from "zustand/react/shallow";
import { PERMIT_JOIN_TIME_KEY } from "../localStoreConsts.js";
import { API_URLS, useAppStore } from "../store.js";
import type { Device } from "../types.js";
```

### Component Patterns

#### Functional Components with memo

Use `memo` for most components to prevent unnecessary re-renders:

```typescript
const PermitJoinButton = memo(() => {
    const { t } = useTranslation("navbar");
    // ... component logic
    return (
        <div className="indicator w-full mb-4">
            {/* ... JSX */}
        </div>
    );
});

export default PermitJoinButton;
```

#### Performance Optimization

Use React hooks for memoization:
- `useMemo` for expensive computations
- `useCallback` for function references passed as props
- `memo` for component memoization
- `useShallow` from Zustand for shallow store selectors

```typescript
const data = useMemo(() => {
    const elements: DashboardTableData[] = [];
    // ... expensive computation
    return elements;
}, [devices, deviceStates, bridgeInfo]);

const removeDevice = useCallback(async (sourceIdx: number, id: string, force: boolean, block: boolean): Promise<void> => {
    await sendMessage(sourceIdx, "bridge/request/device/remove", { id, force, block });
}, []);

const permitJoin = useAppStore(useShallow((state) => state.bridgeInfo[permitClickedSourceIdx].permit_join));
```

#### Generic Components

Use TypeScript generics for reusable components:

```typescript
interface ButtonProps<T> extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
    item?: T;
    onClick?(entity: T): Promise<void> | void;
}

export default function Button<T>(props: ButtonProps<T>): JSX.Element {
    const { children, item, onClick, title, className, ...rest } = props;
    return (
        <button
            type="button"
            className={`${className} ${title ? "tooltip" : ""}`}
            data-tip={title}
            {...rest}
            onClick={async () => await onClick?.(item as T)}
        >
            {children}
        </button>
    );
}
```

### State Management

#### Zustand Store

Use Zustand for global state with clear action methods:

```typescript
export interface AppState {
    devices: Record<number, Device[]>;
    deviceStates: Record<number, Record<string, Zigbee2MQTTAPI["{friendlyName}"]>>;
    // ... state properties
}

interface AppActions {
    setDevices: (sourceIdx: number, devices: Zigbee2MQTTAPI["bridge/devices"]) => void;
    updateDeviceStates: (sourceIdx: number, newEntries: Message<Zigbee2MQTTAPI["{friendlyName}"]>[]) => void;
    // ... action methods
}

export const useAppStore = create<AppState & AppActions>()((set) => ({
    // ... implementation
}));
```

**Multi-source support**: State is indexed by `sourceIdx` to support multiple Zigbee2MQTT instances:

```typescript
const devices = useAppStore((state) => state.devices);
for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
    for (const device of devices[sourceIdx]) {
        // ... process device
    }
}
```

**Use `useShallow` for array/object selectors**:

```typescript
import { useShallow } from "zustand/react/shallow";

const permitJoin = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].permit_join));
```

#### Local State

Use `store2` for persistent local storage:

```typescript
import store2 from "store2";
import { PERMIT_JOIN_TIME_KEY } from "../localStoreConsts.js";

const time = store2.get(PERMIT_JOIN_TIME_KEY, 254); // with default value
store2.set(PERMIT_JOIN_TIME_KEY, newValue);
```

### Styling with Tailwind CSS and DaisyUI

**Follow DaisyUI component patterns**:

```typescript
// Buttons
<button className="btn btn-outline btn-primary">
<button className="btn btn-square btn-xs">
<button className="btn-ghost">

// Badges
<span className="badge badge-sm badge-primary">

// Cards
<div className="card bg-base-200 rounded-box shadow-md">
    <div className="card-body p-2">

// Indicators
<div className="indicator">
    <span className="indicator-item badge badge-sm">

// Joins (button groups)
<div className="join join-horizontal">
    <button className="btn join-item">

// Tooltips
<button className="tooltip" data-tip="Tooltip text">

// Loading
<span className="loading loading-infinity loading-xl" />
```

**Flexbox utilities** (most common pattern):

```typescript
<div className="flex flex-row justify-center items-center gap-2">
<div className="flex flex-col">
<div className="flex-1 min-w-0">  // For truncation support
```

**Truncation pattern** (important for preventing overflow):

```typescript
<span className="truncate">Long text that needs truncation</span>
<div className="min-w-0">  // Enable shrinking below content size
```

**Custom CSS properties** (when needed):

```typescript
<div style={{ "--indicator-y": "65%" } as CSSProperties}>
```

### Internationalization

Use react-i18next with namespace-based organization:

```typescript
const { t } = useTranslation("navbar");

// Nested property access with arrow function
<span>{t(($) => $.permit_join)}</span>
<span>{t(($) => $.disable_join)}</span>

// Multiple namespaces
const { t } = useTranslation(["common", "zigbee"]);
```

**Translation file structure**: JSON files in `src/i18n/locales/` organized by namespace:

```json
{
    "navbar": {
        "permit_join": "Permit join",
        "disable_join": "Disable join",
        "all": "All"
    }
}
```

### WebSocket Communication

Use the centralized `WebSocketManager`:

```typescript
import { sendMessage } from "../websocket/WebSocketManager.js";

await sendMessage(sourceIdx, "bridge/request/permit_join", {
    time: permitJoin ? 0 : store2.get(PERMIT_JOIN_TIME_KEY, 254),
    device: device?.ieee_address,
});
```

**Pattern**: All WebSocket operations are indexed by `sourceIdx` for multi-instance support.

### Type Safety

#### Type Imports

Use `type` keyword for type-only imports:

```typescript
import type { Device, FeatureWithAnySubFeatures } from "../types.js";
import { type JSX, type CSSProperties, memo } from "react";
```

#### Zigbee2MQTT API Types

Use types from `zigbee2mqtt` package:

```typescript
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";

deviceStates: Record<number, Record<string, Zigbee2MQTTAPI["{friendlyName}"]>>;
bridgeInfo: Record<number, Zigbee2MQTTAPI["bridge/info"]>;
```

#### Mutable Type Conversion

Use `RecursiveMutable` for mutable versions of readonly types:

```typescript
import type { RecursiveMutable } from "./types.js";

setBridgeDefinitions: (sourceIdx: number, bridgeDefinitions: RecursiveMutable<Zigbee2MQTTAPI["bridge/definitions"]>) => void;
```

### Error Handling

**Minimal error handling** - let errors bubble up naturally unless specific handling is needed. No try-catch blocks by default.

**Async operations** - use `async/await` consistently:

```typescript
const onPermitJoinClick = useCallback(async () => {
    await sendMessage(sourceIdx, "bridge/request/permit_join", { time, device });
}, [sourceIdx]);
```

### Testing

**Minimal test suite** focusing on smoke tests:

```typescript
import { describe, it } from "vitest";

describe("Test", () => {
    it("passes", () => {});
});
```

**Test configuration**:
- Framework: Vitest with jsdom environment
- Coverage: V8 provider with HTML and text reporters
- Location: `test/` directory
- Run: `npm run test` or `npm run test:cov`

**Philosophy**: Visual regression via Storybook, manual validation for UI changes, real-time features require manual testing.

## Code Quality Standards

### Maintainability

- **Self-documenting code**: Clear naming without excessive comments
- **Single responsibility**: Functions focused on one task
- **Consistent patterns**: Follow existing component structures exactly
- **Type safety**: Use TypeScript types, avoid `any` unless absolutely necessary
- **Memoization**: Use `memo`, `useMemo`, `useCallback` appropriately for performance

### Performance

- **Component memoization**: Use `memo` for most components
- **Hook memoization**: Use `useMemo` for expensive computations, `useCallback` for callback props
- **Zustand shallow selectors**: Use `useShallow` for array/object selections
- **Multi-source indexing**: Efficient access to multi-instance state via `sourceIdx`
- **Lazy loading**: Code splitting handled by Vite with manual chunks for critical paths

### Accessibility

- **Semantic HTML**: Use appropriate elements (button, nav, etc.)
- **ARIA attributes**: Use DaisyUI's built-in accessibility features
- **Keyboard navigation**: Ensure interactive elements are keyboard accessible
- **Tooltips**: Use DaisyUI tooltip class with `data-tip` attribute
- **Focus management**: Maintain logical tab order

### Security

- **Input validation**: Validate user inputs before WebSocket messages
- **Content sanitization**: Follow existing patterns for user-provided content
- **Authentication**: Token-based auth via localStorage (AUTH_TOKEN_KEY)
- **WebSocket security**: Proper error handling for unauthorized (4401) responses

## Biome Configuration

Follow Biome linting and formatting rules from `biome.json`:

### Formatting
- **Indent**: 4 spaces
- **Line width**: 150 characters
- **Line ending**: LF
- **Quote style**: Double quotes
- **Organize imports**: Automatic import sorting enabled

### Linting Rules
- **Naming convention**: Mix of snake_case (API properties), camelCase (general), PascalCase (components/types), CONSTANT_CASE (constants)
- **No non-null assertions**: Allowed (off) - use `!` when confident
- **No parameter assign**: Allowed (off)
- **No unused imports**: Error - auto-removed
- **No unused variables**: Warning
- **Use exhaustive dependencies**: Error - React hooks must have complete deps
- **No inferrable types**: Error - don't specify obvious types
- **Use self-closing elements**: Error - use `<Component />` not `<Component></Component>`

### Auto-fix Commands
- **Check and fix**: `npm run check` - applies formatting and linting fixes
- **Check only**: `npm run check:ci` - validates without fixing (CI mode)

## Project-Specific Patterns

### Multi-Instance Support

The application supports multiple Zigbee2MQTT instances simultaneously:

```typescript
export const API_URLS = Z2M_API_URLS.split(",").map((url) => url.trim());
export const API_NAMES = Z2M_API_NAMES.split(",").map((name) => name.trim());

// State indexed by sourceIdx
for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
    // Access source-specific data
    const devices = useAppStore((state) => state.devices[sourceIdx]);
}
```

**SourceDot component**: Shows colored dots to identify different sources:

```typescript
<SourceDot idx={sourceIdx} autoHide alwaysHideName />
```

### Environment Variables

```typescript
// envs.ts
export const Z2M_API_URLS = import.meta.env.VITE_Z2M_API_URLS || "localhost:5173/api";
export const Z2M_API_NAMES = import.meta.env.VITE_Z2M_API_NAMES || "dev";
export const USE_PROXY = String(import.meta.env.VITE_USE_PROXY || "false");
```

**Development**: Use mock WebSocket server on port 8579 (starts automatically with `npm start`)

**Production**: Set `Z2M_API_URI` or `VITE_Z2M_API_URLS` to real Zigbee2MQTT instance

### Constants Organization

Use `consts.ts` for application-wide constants:

```typescript
export const TOAST_STATUSES_CMAP = { ... } as const;
export const AVAILABILITY_FEATURE_TOPIC_ENDING = "availability";
export const BLACKLISTED_NOTIFICATIONS = [...];
```

Use `localStoreConsts.ts` for localStorage keys:

```typescript
export const PERMIT_JOIN_TIME_KEY = "PERMIT_JOIN_TIME";
export const AUTH_TOKEN_KEY = "AUTH_TOKEN";
```

### Utility Functions

Place shared utilities in `utils.ts`:

```typescript
// Math utilities
export const scale = (inputY: number, yRange: Array<number>, xRange: Array<number>): number => { ... };

// String utilities
export const randomString = (len: number): string => { ... };

// Validation
export const getValidSourceIdx = (sourceIdx: string | undefined): [numSourceIdx: number, valid: boolean] => { ... };

// Formatting
export const stringifyWithUndefinedAsNull = (data: Record<string, unknown>): string => { ... };
export const toHex = (value: number | undefined, digits: number = 4): string => { ... };
```

### React Router Patterns

Use React Router v7 patterns:

```typescript
import { useNavigate, useParams, NavLink } from "react-router";

// In component
const navigate = useNavigate();
const { sourceIdx, deviceId } = useParams();

// Links
<NavLink to={`/device/${sourceIdx}/${deviceId}/info`} className={isTabActive}>
```

**URL structure**: `/{page}/{sourceIdx}/{identifier}/{subpage}`

Example: `/device/0/0x00158d00045b2a5e/info`

### Custom Hooks

#### useTable

Table management hook:

```typescript
import { useTable } from "../hooks/useTable.js";

const { rows, rowSelection, setRowSelection, globalFilter, setGlobalFilter, table } = useTable<DataType>({
    data,
    columns,
    enableRowSelection: true,
    initialSort: [{ id: "friendly_name", desc: false }],
});
```

#### useColumnCount

Responsive column count for masonry layouts:

```typescript
import { useColumnCount } from "../hooks/useColumnCount.js";

const columnCount = useColumnCount(); // Returns 1-6 based on screen width
```

#### useSearch

Search functionality:

```typescript
import { useSearch } from "../hooks/useSearch.ts";

const { searchFilter, setSearchFilter, onSearchChange } = useSearch();
```

## Version Control

### Semantic Versioning
- Follow semver (MAJOR.MINOR.PATCH)
- Current version tracked in `package.json`

### Commit Conventions
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Repository maintenance
- Breaking changes affecting UI/UX must be carefully documented

### Package Management
- **Lock file**: `package-lock.json` - use `npm ci` for consistent installs
- **Engines**: Node.js >=22.12.0 (strict requirement)
- **Type**: ESM only (`"type": "module"`)

## Build and Development

### Commands
```bash
npm ci                    # Clean install dependencies
npm start                 # Dev server with mocks (port 5173)
npm run build             # Production build
npm run preview           # Preview production build
npm run typecheck         # TypeScript validation (shortcut for `tsc --noEmit`)
npm run check             # Auto-fix formatting/linting
npm run check:ci          # Validate without fixing
npm run test              # Run tests
npm run test:cov          # Run tests with coverage
npm run storybook         # Start Storybook (port 6006)
```

### Build Configuration

Vite configuration patterns:

```typescript
export default defineConfig(async ({ command, mode }) => {
    if (command === "serve" && mode !== "test") {
        startServer(); // Mock WebSocket server
    }

    return {
        root: "src",
        base: "",
        build: {
            outDir: "../dist",
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        // Manual chunking for optimization
                    },
                },
            },
        },
        plugins: [react(), tailwindcss(), compression({ algorithms: [defineAlgorithm("brotliCompress")] })],
    };
});
```

## General Best Practices

1. **Consistency over convention**: Match existing patterns in the codebase exactly
2. **No premature optimization**: Use memoization strategically, not everywhere
3. **Type safety**: Let TypeScript catch errors, avoid type assertions unless necessary
4. **Component composition**: Build small, focused components
5. **Props destructuring**: Destructure props in function signature or first line
6. **Explicit returns**: Use explicit return types for clarity
7. **Avoid barrel files**: No re-exports (`noBarrelFile` rule enabled)
8. **Use async/await**: Consistent asynchronous patterns
9. **Leverage DaisyUI**: Use DaisyUI components instead of custom CSS when possible
10. **Multi-source awareness**: Always consider multi-instance scenarios

## Documentation

- **Minimal comments**: Code should be self-documenting
- **JSDoc when needed**: For complex utilities or public APIs
- **README updates**: Keep README.md current with major changes
- **Storybook stories**: Create stories for reusable components

## When in Doubt

1. Search the codebase for similar patterns
2. Reference instruction files in `.github/instructions/`
3. Check the copilot-instructions.md in this repository
4. Follow the most consistent pattern found
5. Prioritize consistency with existing code over external best practices
