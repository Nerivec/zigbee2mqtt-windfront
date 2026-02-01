---
id: 3
group: "core-logic"
dependencies: []
status: "pending"
created: "2026-01-31"
skills:
  - typescript
---
# Implement Common Expose Computation Logic

## Objective
Create a utility function that computes the intersection of expose features across multiple devices, returning only features that are compatible across all selected devices.

## Skills Required
- TypeScript for algorithm implementation and type definitions

## Acceptance Criteria
- [ ] Function `computeCommonExposes(devices[])` returns array of common expose features
- [ ] Features match by exact `name` AND `type`
- [ ] Enum features require identical allowed values
- [ ] Numeric features compute intersection of min/max ranges
- [ ] Only features with SET access (access & 0b010) are included
- [ ] Properly typed input/output with existing expose types from codebase

Use your internal Todo tool to track these and keep on track.

## Technical Requirements
- Create utility in `src/utils/` or appropriate location
- Use existing expose type definitions from the codebase
- Access check: `feature.access & 2` (SET bit is 0b010 = 2)
- Handle nested expose structures (some devices have grouped exposes)

## Input Dependencies
None - this is pure logic that uses existing types.

## Output Artifacts
- `computeCommonExposes` function exported for use in Bulk Settings page
- Type definitions for the return structure (common expose with merged constraints)

## Implementation Notes

<details>
<summary>Detailed Implementation Guide</summary>

1. **Locate existing expose types** - search for `Expose` or `Feature` type definitions in the codebase.

2. **Create the utility file** at `src/utils/bulkExposes.ts` or similar.

3. **Implement the algorithm**:
   ```typescript
   export function computeCommonExposes(devices: Device[]): CommonExpose[] {
     if (devices.length === 0) return [];

     // Get all exposes from first device as candidates
     const firstDeviceExposes = flattenExposes(devices[0].definition?.exposes ?? []);

     // Filter to only SET-accessible features
     const candidates = firstDeviceExposes.filter(e => (e.access ?? 0) & 2);

     // For each candidate, check if all other devices have compatible feature
     return candidates.filter(candidate => {
       return devices.slice(1).every(device => {
         const deviceExposes = flattenExposes(device.definition?.exposes ?? []);
         return deviceExposes.some(e => isCompatible(candidate, e));
       });
     });
   }
   ```

4. **Implement `flattenExposes`** to handle nested expose structures:
   ```typescript
   function flattenExposes(exposes: Expose[]): Feature[] {
     const result: Feature[] = [];
     for (const expose of exposes) {
       if ('features' in expose && expose.features) {
         result.push(...flattenExposes(expose.features));
       } else {
         result.push(expose as Feature);
       }
     }
     return result;
   }
   ```

5. **Implement `isCompatible`** to check feature compatibility:
   ```typescript
   function isCompatible(a: Feature, b: Feature): boolean {
     // Must have same name and type
     if (a.name !== b.name || a.type !== b.type) return false;

     // Must have SET access
     if (!((b.access ?? 0) & 2)) return false;

     // Type-specific checks
     if (a.type === 'enum') {
       // Enum values must be identical sets
       const aValues = new Set(a.values ?? []);
       const bValues = new Set(b.values ?? []);
       if (aValues.size !== bValues.size) return false;
       for (const v of aValues) if (!bValues.has(v)) return false;
     }

     if (a.type === 'numeric') {
       // Ranges must overlap (intersection exists)
       const aMin = a.value_min ?? -Infinity;
       const aMax = a.value_max ?? Infinity;
       const bMin = b.value_min ?? -Infinity;
       const bMax = b.value_max ?? Infinity;
       if (Math.max(aMin, bMin) > Math.min(aMax, bMax)) return false;
     }

     return true;
   }
   ```

6. **For numeric features**, also compute the merged range (intersection) to use in the UI:
   ```typescript
   interface CommonExpose extends Feature {
     mergedMin?: number;
     mergedMax?: number;
   }
   ```

</details>
