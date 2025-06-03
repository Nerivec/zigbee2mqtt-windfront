import { lazy } from 'react'
import type { RouteObject } from 'react-router'

const HomePage = lazy(async () => await import('../pages/HomePage.js'))
const DevicesPage = lazy(async () => await import('../pages/DevicesPage.js'))
const DevicePage = lazy(async () => await import('../pages/DevicePage.js'))
const DashboardPage = lazy(async () => await import('../pages/Dashboard.js'))
const NetworkPage = lazy(async () => await import('../pages/NetworkPage.js'))
const GroupsPage = lazy(async () => await import('../pages/GroupsPage.js'))
const GroupPage = lazy(async () => await import('../pages/GroupPage.js'))
const OtaPage = lazy(async () => await import('../pages/OtaPage.js'))
const TouchlinkPage = lazy(
  async () => await import('../pages/TouchlinkPage.js')
)
const LogsPage = lazy(async () => await import('../pages/LogsPage.js'))
const SettingsPage = lazy(async () => await import('../pages/SettingsPage.js'))

export const appRoutes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/devices', element: <DevicesPage /> },
  { path: '/device/:deviceId/:tab?', element: <DevicePage /> },
  { path: '/groups', element: <GroupsPage /> },
  { path: '/group/:groupId/:tab?', element: <GroupPage /> },
  { path: '/network', element: <NetworkPage /> },
  { path: '/ota', element: <OtaPage /> },
  { path: '/logs', element: <LogsPage /> },
  { path: '/touchlink', element: <TouchlinkPage /> },
  { path: '/settings/:tab?', element: <SettingsPage /> }
]
