---
id: 4
group: "bulk-settings-page"
dependencies: [1, 3]
status: "completed"
created: "2026-01-31"
skills:
  - react-components
  - typescript
---
# Create Bulk Settings Page

## Objective
Create a new Bulk Settings page that displays common expose features for selected devices, allows editing values, and shows current value status (uniform vs. mixed).

## Skills Required
- React components for page and feature rendering
- TypeScript for type-safe implementation

## Acceptance Criteria
- [ ] New route `/bulk-settings/:sourceIdx` registered in router
- [ ] Page loads selected devices from store and displays summary header
- [ ] Common exposes computed and displayed using existing Feature components
- [ ] Current values queried from device states
- [ ] Uniform values shown as control default; mixed values show variance indicator
- [ ] Empty/invalid selection redirects back to devices page
- [ ] i18n support for all user-facing text

Use your internal Todo tool to track these and keep on track.

## Technical Requirements
- Page file: `src/pages/BulkSettingsPage.tsx`
- Route registration in router config
- Reuse Feature components from `src/components/features/`
- Access device states from store (`deviceStates`)
- Use `computeCommonExposes` from Task 3

## Input Dependencies
- Task 1: Store with `bulkSelectedDevices` state
- Task 3: `computeCommonExposes` utility function

## Output Artifacts
- `BulkSettingsPage.tsx` component
- Route configuration update
- Navigation menu update (if applicable)

## Implementation Notes

<details>
<summary>Detailed Implementation Guide</summary>

1. **Create the page component** at `src/pages/BulkSettingsPage.tsx`:
   ```typescript
   export function BulkSettingsPage() {
     const { sourceIdx } = useParams<{ sourceIdx: string }>();
     const idx = Number(sourceIdx);
     const navigate = useNavigate();

     const bulkSelectedDevices = useStore(state => state.bulkSelectedDevices);
     const devices = useStore(state => state.devices);
     const deviceStates = useStore(state => state.deviceStates);

     const selectedIeees = bulkSelectedDevices.get(idx) ?? [];
     const selectedDevices = devices
       .filter(d => selectedIeees.includes(d.ieee_address));

     // Redirect if no valid selection
     useEffect(() => {
       if (selectedDevices.length < 2) {
         navigate(`#/devices`);
       }
     }, [selectedDevices.length, navigate]);

     const commonExposes = useMemo(
       () => computeCommonExposes(selectedDevices),
       [selectedDevices]
     );

     // ... render
   }
   ```

2. **Implement current value detection**:
   ```typescript
   function getCurrentValue(expose: CommonExpose, devices: Device[], deviceStates: Map) {
     const values = devices.map(d => {
       const state = deviceStates.get(d.ieee_address);
       return state?.[expose.name];
     });

     const definedValues = values.filter(v => v !== undefined);
     if (definedValues.length === 0) return { type: 'unknown' };

     const allSame = definedValues.every(v => v === definedValues[0]);
     if (allSame) return { type: 'uniform', value: definedValues[0] };
     return { type: 'mixed' };
   }
   ```

3. **Render the page layout**:
   ```tsx
   return (
     <div className="p-4">
       {/* Header with device count */}
       <div className="mb-4">
         <h1 className="text-2xl font-bold">{t('bulk_settings.title')}</h1>
         <p className="text-base-content/70">
           {t('bulk_settings.device_count', { count: selectedDevices.length })}
         </p>
       </div>

       {/* Common exposes list */}
       <div className="space-y-4">
         {commonExposes.map(expose => (
           <BulkFeatureControl
             key={expose.name}
             expose={expose}
             devices={selectedDevices}
             currentValue={getCurrentValue(expose, selectedDevices, deviceStates)}
             sourceIdx={idx}
           />
         ))}
       </div>

       {commonExposes.length === 0 && (
         <div className="alert alert-info">
           {t('bulk_settings.no_common_features')}
         </div>
       )}
     </div>
   );
   ```

4. **Create `BulkFeatureControl` component** that wraps existing Feature components:
   - Displays the feature name/label
   - Shows variance indicator if values mixed
   - Passes appropriate onChange handler for bulk application (Task 5)

5. **Register the route** in the router configuration (find existing route setup):
   ```typescript
   { path: '/bulk-settings/:sourceIdx', element: <BulkSettingsPage /> }
   ```

6. **Add i18n keys** to translation files:
   - `bulk_settings.title`
   - `bulk_settings.device_count`
   - `bulk_settings.no_common_features`
   - `bulk_settings.values_vary`

</details>
