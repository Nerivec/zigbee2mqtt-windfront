---
id: 1
group: "state-management"
dependencies: []
status: "pending"
created: "2026-01-31"
skills:
  - typescript
  - zustand
---
# Add Bulk Selection Store Slice

## Objective
Add a new slice to the Zustand store to track selected devices for bulk operations, following existing store patterns and supporting multi-instance (sourceIdx).

## Skills Required
- TypeScript for type definitions
- Zustand for state management patterns

## Acceptance Criteria
- [ ] New `bulkSelectedDevices` state added to store (Map keyed by sourceIdx to array of IEEE addresses)
- [ ] `setBulkSelectedDevices(sourceIdx, ieeeAddresses[])` action implemented
- [ ] `clearBulkSelectedDevices(sourceIdx?)` action implemented
- [ ] Types exported for use in components
- [ ] Follows existing store slice patterns in the codebase

Use your internal Todo tool to track these and keep on track.

## Technical Requirements
- Store file: `src/store.ts`
- State shape: `bulkSelectedDevices: Map<number, string[]>` (sourceIdx → IEEE addresses)
- Must support multi-instance pattern (sourceIdx) used throughout the codebase

## Input Dependencies
None - this is the foundation task.

## Output Artifacts
- Extended store with bulk selection state and actions
- Type definitions for bulk selection state

## Implementation Notes

<details>
<summary>Detailed Implementation Guide</summary>

1. **Open `src/store.ts`** and locate the existing state interface and store creation.

2. **Add new state property** to the store state interface:
   ```typescript
   bulkSelectedDevices: Map<number, string[]>;
   ```

3. **Add actions** to the store:
   ```typescript
   setBulkSelectedDevices: (sourceIdx: number, ieeeAddresses: string[]) => void;
   clearBulkSelectedDevices: (sourceIdx?: number) => void;
   ```

4. **Initialize the state** in the store creation:
   ```typescript
   bulkSelectedDevices: new Map(),
   ```

5. **Implement the actions**:
   - `setBulkSelectedDevices`: Create a new Map, copy existing entries, set the new entry for the given sourceIdx
   - `clearBulkSelectedDevices`: If sourceIdx provided, delete that entry; otherwise create new empty Map

6. **Pattern reference**: Look at how other Map-based state is handled in the store (e.g., `deviceStates`).

7. **Export selectors** if the codebase uses selector patterns for store access.

</details>
