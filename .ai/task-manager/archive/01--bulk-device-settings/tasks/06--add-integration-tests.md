---
id: 6
group: "testing"
dependencies: [5]
status: "completed"
created: "2026-01-31"
skills:
  - vitest
---
# Add Integration Tests for Bulk Settings Flow

## Objective
Write meaningful integration tests covering the critical business logic: common expose computation and the bulk settings user flow.

## Skills Required
- Vitest for test implementation

## Acceptance Criteria
- [ ] Tests for `computeCommonExposes` covering: exact match, type mismatch, enum value differences, numeric range intersection
- [ ] Integration test for bulk settings page rendering with mock devices
- [ ] Test for current value detection (uniform vs mixed)
- [ ] All tests pass with `npm test`

Use your internal Todo tool to track these and keep on track.

## Technical Requirements
- Test location: `test/` directory following existing patterns
- Test runner: Vitest (jsdom)
- Mock WebSocket and store as needed

## Input Dependencies
- Task 5: Complete bulk settings feature implementation

## Output Artifacts
- Test files covering bulk settings functionality
- Tests integrated into test suite

## Meaningful Test Strategy Guidelines

Your critical mantra for test generation is: "write a few tests, mostly integration".

**When TO Write Tests:**
- Custom business logic and algorithms (computeCommonExposes)
- Critical user workflows (bulk selection → apply)
- Edge cases (no common features, all features match)

**When NOT to Write Tests:**
- React component rendering basics
- TanStack Table row selection (framework feature)
- WebSocket library functionality

## Implementation Notes

<details>
<summary>Detailed Implementation Guide</summary>

1. **Create test file** at `test/bulkSettings.test.ts` or similar location matching existing test structure.

2. **Test `computeCommonExposes`**:
   ```typescript
   describe('computeCommonExposes', () => {
     it('returns features that exist in all devices with same name and type', () => {
       const devices = [
         mockDevice({ exposes: [{ name: 'power_on_behavior', type: 'enum', values: ['on', 'off'], access: 7 }] }),
         mockDevice({ exposes: [{ name: 'power_on_behavior', type: 'enum', values: ['on', 'off'], access: 7 }] }),
       ];
       const result = computeCommonExposes(devices);
       expect(result).toHaveLength(1);
       expect(result[0].name).toBe('power_on_behavior');
     });

     it('excludes features with different types', () => {
       const devices = [
         mockDevice({ exposes: [{ name: 'brightness', type: 'numeric', access: 7 }] }),
         mockDevice({ exposes: [{ name: 'brightness', type: 'enum', values: ['low', 'high'], access: 7 }] }),
       ];
       const result = computeCommonExposes(devices);
       expect(result).toHaveLength(0);
     });

     it('excludes enum features with different allowed values', () => {
       const devices = [
         mockDevice({ exposes: [{ name: 'mode', type: 'enum', values: ['a', 'b'], access: 7 }] }),
         mockDevice({ exposes: [{ name: 'mode', type: 'enum', values: ['a', 'c'], access: 7 }] }),
       ];
       const result = computeCommonExposes(devices);
       expect(result).toHaveLength(0);
     });

     it('excludes features without SET access', () => {
       const devices = [
         mockDevice({ exposes: [{ name: 'temperature', type: 'numeric', access: 1 }] }), // read-only
         mockDevice({ exposes: [{ name: 'temperature', type: 'numeric', access: 1 }] }),
       ];
       const result = computeCommonExposes(devices);
       expect(result).toHaveLength(0);
     });
   });
   ```

3. **Test current value detection**:
   ```typescript
   describe('getCurrentValue', () => {
     it('returns uniform when all devices have same value', () => {
       const result = getCurrentValue('power_on_behavior', devices, {
         'device1': { power_on_behavior: 'on' },
         'device2': { power_on_behavior: 'on' },
       });
       expect(result.type).toBe('uniform');
       expect(result.value).toBe('on');
     });

     it('returns mixed when devices have different values', () => {
       const result = getCurrentValue('power_on_behavior', devices, {
         'device1': { power_on_behavior: 'on' },
         'device2': { power_on_behavior: 'off' },
       });
       expect(result.type).toBe('mixed');
     });
   });
   ```

4. **Create mock helpers** for devices with exposes:
   ```typescript
   function mockDevice(overrides: Partial<Device> = {}): Device {
     return {
       ieee_address: `0x${Math.random().toString(16).slice(2, 18)}`,
       friendly_name: 'Test Device',
       definition: { exposes: [] },
       ...overrides,
     };
   }
   ```

5. **Focus on integration over unit tests** - test the computation and detection logic together rather than isolated tiny functions.

</details>
