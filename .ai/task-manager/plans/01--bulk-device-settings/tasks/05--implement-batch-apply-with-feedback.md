---
id: 5
group: "bulk-settings-page"
dependencies: [4]
status: "pending"
created: "2026-01-31"
skills:
  - react-components
  - websocket
---
# Implement Batch Apply with Feedback

## Objective
Implement the batch WebSocket operation that applies a setting change to all selected devices in parallel, with a feedback toast showing success/failure counts.

## Skills Required
- React components for UI feedback
- WebSocket API integration

## Acceptance Criteria
- [ ] Setting change triggers parallel WebSocket calls to all selected devices
- [ ] Uses `Promise.allSettled()` pattern for batch operations
- [ ] Toast notification shows results: "X/Y devices updated successfully"
- [ ] Failed devices listed in toast or expandable detail
- [ ] Loading state shown while operation in progress
- [ ] Follows existing WebSocket patterns in codebase (sendMessage, transactions)

Use your internal Todo tool to track these and keep on track.

## Technical Requirements
- WebSocket manager located in `src/websocket/`
- Endpoint pattern: `{ieee_address}/set` with payload `{ [feature_name]: value }`
- Reference: Look at ReportingPage batch operations for pattern
- Toast system: use existing toast/notification system in codebase

## Input Dependencies
- Task 4: Bulk Settings page with feature controls

## Output Artifacts
- `applyBulkSetting` function integrated into BulkSettingsPage
- Toast feedback UI for batch results

## Implementation Notes

<details>
<summary>Detailed Implementation Guide</summary>

1. **Locate the WebSocket manager** - likely in `src/websocket/` directory. Find the `sendMessage` or similar function.

2. **Locate existing batch operation patterns** - search for `Promise.allSettled` in ReportingPage.tsx or BindingsPage.tsx.

3. **Implement the batch apply function**:
   ```typescript
   async function applyBulkSetting(
     devices: Device[],
     featureName: string,
     value: unknown,
     sourceIdx: number
   ) {
     const promises = devices.map(device =>
       sendMessage(sourceIdx, `${device.ieee_address}/set`, {
         [featureName]: value
       })
     );

     const results = await Promise.allSettled(promises);

     const succeeded = results.filter(r => r.status === 'fulfilled').length;
     const failed = results.filter(r => r.status === 'rejected');

     return { succeeded, failed, total: devices.length };
   }
   ```

4. **Integrate into the feature control onChange**:
   ```typescript
   const handleFeatureChange = async (featureName: string, value: unknown) => {
     setLoading(featureName);
     try {
       const result = await applyBulkSetting(selectedDevices, featureName, value, sourceIdx);

       if (result.failed.length === 0) {
         toast.success(t('bulk_settings.all_updated', { count: result.total }));
       } else {
         toast.warning(t('bulk_settings.partial_update', {
           succeeded: result.succeeded,
           total: result.total
         }));
       }
     } catch (error) {
       toast.error(t('bulk_settings.update_failed'));
     } finally {
       setLoading(null);
     }
   };
   ```

5. **Add loading state** to the feature control:
   ```typescript
   const [loadingFeature, setLoadingFeature] = useState<string | null>(null);

   // In render:
   <BulkFeatureControl
     loading={loadingFeature === expose.name}
     // ...
   />
   ```

6. **Show loading indicator** on the control while operation is in progress - use existing spinner/loading patterns from the codebase.

7. **Add i18n keys** for toast messages:
   - `bulk_settings.all_updated`
   - `bulk_settings.partial_update`
   - `bulk_settings.update_failed`

8. **Handle transaction responses** if the WebSocket uses a transaction pattern - check how other parts of the codebase handle async WebSocket responses.

</details>
