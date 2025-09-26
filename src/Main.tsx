import NiceModal from "@ebay/nice-modal-react";
import React, { lazy, Suspense, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { HashRouter, Route, Routes } from "react-router";
import { useShallow } from "zustand/react/shallow";
import ScrollToTop from "./components/ScrollToTop.js";
import Toasts from "./components/Toasts.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import i18n from "./i18n/index.js";
import AppLayout from "./layout/AppLayout.js";
import { LoginPage } from "./pages/LoginPage.js";
import { useAppStore } from "./store.js";
import { startWebSocketManager } from "./websocket/WebSocketManager.js";

const HomePage = lazy(async () => await import("./pages/HomePage.js"));
const DevicesPage = lazy(async () => await import("./pages/DevicesPage.js"));
const DevicePage = lazy(async () => await import("./pages/DevicePage.js"));
const DashboardPage = lazy(async () => await import("./pages/Dashboard.js"));
const NetworkPage = lazy(async () => await import("./pages/NetworkPage.js"));
const GroupsPage = lazy(async () => await import("./pages/GroupsPage.js"));
const GroupPage = lazy(async () => await import("./pages/GroupPage.js"));
const OtaPage = lazy(async () => await import("./pages/OtaPage.js"));
const TouchlinkPage = lazy(async () => await import("./pages/TouchlinkPage.js"));
const LogsPage = lazy(async () => await import("./pages/LogsPage.js"));
const SettingsPage = lazy(async () => await import("./pages/SettingsPage.js"));
const FrontendSettingsPage = lazy(async () => await import("./pages/FrontendSettingsPage.js"));
const ContributePage = lazy(async () => await import("./pages/ContributePage.js"));

function App() {
    const authRequired = useAppStore(useShallow((s) => s.authRequired.some((v) => v === true)));

    useEffect(() => {
        // do the initial startup, will determine if LoginPage needs to be shown or not
        startWebSocketManager();
    }, []);

    if (authRequired) {
        return <LoginPage />;
    }

    return (
        <HashRouter>
            <ScrollToTop />
            <AppLayout>
                <Suspense
                    fallback={
                        <div className="flex flex-row justify-center items-center gap-2">
                            <span className="loading loading-infinity loading-xl" />
                        </div>
                    }
                >
                    <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/devices" element={<DevicesPage />} />
                        <Route path="/device/:sourceIdx/:deviceId/:tab?" element={<DevicePage />} />
                        <Route path="/groups" element={<GroupsPage />} />
                        <Route path="/group/:sourceIdx/:groupId/:tab?" element={<GroupPage />} />
                        <Route path="/touchlink" element={<TouchlinkPage />} />
                        <Route path="/ota" element={<OtaPage />} />
                        <Route path="/network/:sourceIdx?" element={<NetworkPage />} />
                        <Route path="/logs/:sourceIdx?" element={<LogsPage />} />
                        <Route path="/settings/:sourceIdx?/:tab?/:subTab?" element={<SettingsPage />} />
                        <Route path="/frontend-settings" element={<FrontendSettingsPage />} />
                        <Route path="/contribute" element={<ContributePage />} />
                        <Route path="/" element={<HomePage />} />
                        <Route path="*" element={<HomePage />} />
                    </Routes>
                </Suspense>
            </AppLayout>
            <Toasts />
        </HashRouter>
    );
}

export function Main() {
    return (
        <React.StrictMode>
            <ErrorBoundary>
                <NiceModal.Provider>
                    <I18nextProvider i18n={i18n}>
                        <App />
                    </I18nextProvider>
                </NiceModal.Provider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}
