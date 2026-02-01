---
id: 1
group: "bulk-settings"
dependencies: []
status: "completed"
created: "2026-01-31"
skills:
  - react-components
  - typescript
---
# Add Sort Toggle to Bulk Settings Page

## Objective
Add a toggle control to the Bulk Settings page that allows users to switch between default order and status-based sorting (uniform → mixed → unknown).

## Skills Required
- React components for UI and state management
- TypeScript for type-safe implementation

## Acceptance Criteria
- [ ] Toggle control visible in Common Features card header
- [ ] Default state is "default order" (sortByStatus = false)
- [ ] Clicking toggle switches between default and status-based sorting
- [ ] Status-based sorting groups: uniform first, mixed second, unknown last
- [ ] Original order preserved within each status group
- [ ] i18n keys added for toggle labels

Use your internal Todo tool to track these and keep on track.

## Technical Requirements
- Modify `src/pages/BulkSettingsPage.tsx`
- Add `sortByStatus` state variable (boolean, default false)
- Add toggle UI using daisyUI classes
- Create sorted features list using `useMemo`
- Add i18n keys to `src/i18n/locales/en.json`

## Input Dependencies
None - modifies existing page.

## Output Artifacts
- Modified BulkSettingsPage.tsx with sort toggle functionality
- Updated en.json with new i18n keys

## Implementation Notes

<details>
<summary>Detailed Implementation Guide</summary>

1. **Add state variable** in `BulkSettingsPage`:
   ```typescript
   const [sortByStatus, setSortByStatus] = useState(false);
   ```

2. **Create sorted features list** using `useMemo`:
   ```typescript
   const sortedExposes = useMemo(() => {
       if (!sortByStatus) {
           return commonExposes;
       }

       // Create array with original indices for stable sort
       const indexed = commonExposes.map((feature, index) => ({ feature, index }));

       // Sort by status priority, then by original index
       const getStatusPriority = (feature: BasicFeature): number => {
           const status = featureValueStatuses.get(feature.name);
           if (status?.type === 'uniform') return 0;
           if (status?.type === 'mixed') return 1;
           return 2; // unknown
       };

       indexed.sort((a, b) => {
           const priorityA = getStatusPriority(a.feature);
           const priorityB = getStatusPriority(b.feature);
           if (priorityA !== priorityB) return priorityA - priorityB;
           return a.index - b.index; // preserve original order within group
       });

       return indexed.map(({ feature }) => feature);
   }, [commonExposes, featureValueStatuses, sortByStatus]);
   ```

3. **Add toggle UI** in the Common Features card header (around line 335-337):
   ```tsx
   <h3 className="card-title p-4 pb-0">
       {t(($) => $.common_features)}
       <span className="badge badge-neutral">{commonExposes.length}</span>
       <div className="flex-1" />
       <label className="label cursor-pointer gap-2">
           <span className="label-text text-sm">{t(($) => $.sort_by_status)}</span>
           <input
               type="checkbox"
               className="toggle toggle-sm"
               checked={sortByStatus}
               onChange={(e) => setSortByStatus(e.target.checked)}
           />
       </label>
   </h3>
   ```

4. **Update the map** to use `sortedExposes` instead of `commonExposes`:
   ```tsx
   {sortedExposes.map((feature) => (
       <BulkFeatureRow
           key={feature.name}
           // ... rest unchanged
       />
   ))}
   ```

5. **Add i18n key** to `src/i18n/locales/en.json` in the `bulkSettings` namespace:
   ```json
   "sort_by_status": "Sort by status"
   ```

</details>
