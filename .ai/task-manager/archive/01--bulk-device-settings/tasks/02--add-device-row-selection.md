---
id: 2
group: "devices-page"
dependencies: [1]
status: "completed"
created: "2026-01-31"
skills:
  - react-components
  - typescript
---
# Add Device Row Selection to Devices Page

## Objective
Enable row selection with checkboxes on the Devices page table, with a "Bulk Settings" button that stores selection and navigates to the bulk settings page.

## Skills Required
- React components for UI implementation
- TypeScript for type safety

## Acceptance Criteria
- [ ] Checkbox column added as first column in devices table
- [ ] Row selection state managed via TanStack Table's `rowSelection` feature
- [ ] Contextual toolbar appears when devices are selected showing count
- [ ] "Bulk Settings" button visible when 2+ devices selected
- [ ] Clicking button stores IEEE addresses in Zustand and navigates to `/bulk-settings/:sourceIdx`
- [ ] Selection respects multi-instance boundaries (only devices from same sourceIdx)

Use your internal Todo tool to track these and keep on track.

## Technical Requirements
- Devices page component location: find via `src/pages/` or `src/components/devices/`
- Uses existing `useTable` hook with `rowSelection` option
- Navigation via react-router (hash routing)
- Store integration via `setBulkSelectedDevices` action from Task 1

## Input Dependencies
- Task 1: Store slice with `setBulkSelectedDevices` action

## Output Artifacts
- Modified Devices page with row selection capability
- Navigation trigger to bulk settings page

## Implementation Notes

<details>
<summary>Detailed Implementation Guide</summary>

1. **Locate the Devices page** - likely in `src/pages/DevicesPage.tsx` or similar.

2. **Enable row selection** in the table configuration:
   ```typescript
   const table = useReactTable({
     // existing config...
     enableRowSelection: true,
     onRowSelectionChange: setRowSelection,
     state: {
       rowSelection,
     },
   });
   ```

3. **Add checkbox column** as the first column in the columns definition:
   ```typescript
   {
     id: 'select',
     header: ({ table }) => (
       <input
         type="checkbox"
         checked={table.getIsAllRowsSelected()}
         indeterminate={table.getIsSomeRowsSelected()}
         onChange={table.getToggleAllRowsSelectedHandler()}
       />
     ),
     cell: ({ row }) => (
       <input
         type="checkbox"
         checked={row.getIsSelected()}
         onChange={row.getToggleSelectedHandler()}
       />
     ),
   }
   ```

4. **Add contextual toolbar** that shows when `Object.keys(rowSelection).length > 0`:
   - Display selected count
   - Show "Bulk Settings" button when count >= 2

5. **Handle "Bulk Settings" button click**:
   ```typescript
   const handleBulkSettings = () => {
     const selectedRows = table.getSelectedRowModel().rows;
     const ieeeAddresses = selectedRows.map(row => row.original.ieee_address);
     setBulkSelectedDevices(sourceIdx, ieeeAddresses);
     navigate(`#/bulk-settings/${sourceIdx}`);
   };
   ```

6. **Style the toolbar** using daisyUI classes - look at ReportingPage or BindingsPage for reference patterns.

7. **Add i18n keys** for "Bulk Settings" button text and selected count message.

</details>
