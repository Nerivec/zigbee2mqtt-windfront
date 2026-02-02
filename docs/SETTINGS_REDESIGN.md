# Settings UI Redesign

This document describes the redesigned Settings tabs that replace the auto-generated JSON Schema forms with purpose-built, user-friendly interfaces.

## Design Principles

1. **Progressive Disclosure** - Hide complexity until needed. Toggles reveal nested settings, collapsible sections prevent information overload.
2. **Logical Sections** - Group related settings with clear headers and descriptions.
3. **Visual Hierarchy** - FontAwesome icons with color-coded section headers for quick scanning.
4. **Contextual Help** - Every field has descriptive `detail` text explaining its purpose.

## Architecture

### Shared Components (`components/settings-page/shared/`)

| Component | Purpose |
|-----------|---------|
| `Section.tsx` | Card wrapper with icon, title, and description |
| `SettingCard.tsx` | Toggle-able card that reveals nested settings when enabled |

### Tab Components (`components/settings-page/tabs/`)

| Tab | Sections |
|-----|----------|
| `FrontendSettingsTab` | Frontend Availability, Network Configuration, Authentication (Token, OIDC, Social Login) |
| `MqttSettingsTab` | Broker Connection, Authentication, TLS/SSL, Message Options |
| `SerialSettingsTab` | Adapter Connection, Communication, Hardware |
| `AvailabilitySettingsTab` | Enable Availability, Active Devices, Passive Devices |
| `OtaSettingsTab` | Update Checking, Transfer Settings, Advanced |
| `HomeAssistantSettingsTab` | Integration, Discovery, Entity Options |
| `AdvancedSettingsTab` | Logging, Debug, Syslog, Zigbee Network, Adapter Tuning, State & Caching, Output Format |

## Key Features

### InputField Enhancement

Updated `InputField.tsx` to support controlled state with optimistic editing:
- `initialValue` prop for setting initial state
- `onSubmit` callback triggered on blur or Enter key
- Internal state prevents API calls on every keystroke

### Progressive Disclosure Examples

**Availability Tab**: Active/Passive device sections only appear when the master "Enable Availability" toggle is on.

**MQTT Tab**: TLS section is collapsed by default, expands when user clicks "Configure TLS certificates".

**Advanced Tab**: Debug Logging, Syslog, and Network Key sections are collapsible to reduce cognitive load.

### Warning Alerts

Destructive actions show prominent warnings:
- Network settings changes (channel, PAN ID, network key) warn about re-pairing all devices
- Disabling message retain warns about breaking Home Assistant integration

## WebSocket Integration

All settings use the existing `sendMessage()` function to persist changes:

```typescript
await sendMessage(sourceIdx, "bridge/request/options", {
  options: { [section]: { key: value } }
});
```

Nested settings use helper functions like `setNestedSettings()` for cleaner code.

## Icon Reference

| Icon | Color Class | Usage |
|------|-------------|-------|
| `faPowerOff` | `text-success` | Enable/disable toggles |
| `faServer` | `text-primary` | Server/broker settings |
| `faLock` | `text-warning` | Authentication |
| `faShieldAlt` | `text-success` | TLS/SSL |
| `faNetworkWired` | `text-primary` | Zigbee network |
| `faDatabase` | `text-purple-500` | State/caching |
| `faFileLines` | `text-info` | Logging |
| `faBug` | `text-warning` | Debug |
| `faHome` | `text-info` | Home Assistant |
| `faPlug` | `text-primary` | Active/mains devices |
| `faBatteryFull` | `text-warning` | Battery devices |
| `faCloudArrowDown` | `text-info` | OTA updates |
| `faUsb` | `text-primary` | Serial port (from brands) |
