import NiceModal from "@ebay/nice-modal-react";
import React, { lazy, Suspense } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { HashRouter, Route, Routes } from "react-router";
import { AuthForm } from "./components/modal/components/AuthModal.js";
import NavBarWithNotifications from "./components/navbar/NavBar.js";
import ScrollToTop from "./components/ScrollToTop.js";
import Toasts from "./components/Toasts.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import i18n from "./i18n/index.js";
import { WebSocketApiRouter } from "./WebSocketApiRouter.js";

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

export function Main() {
    const { t } = useTranslation("common");

    return (
        <React.StrictMode>
            <I18nextProvider i18n={i18n}>
                <NiceModal.Provider>
                    <AuthForm id="auth-form" onAuth={async () => {}} />
                    <ErrorBoundary>
                        <HashRouter>
                            <ScrollToTop />
                            <WebSocketApiRouter>
                                <NavBarWithNotifications />
                                <main className="pt-3 px-2">
                                    <Suspense
                                        fallback={
                                            <>
                                                <div className="flex flex-row justify-center items-center gap-2">
                                                    <span className="loading loading-infinity loading-xl" />
                                                </div>
                                                <div className="flex flex-row justify-center items-center gap-2">{t("loading")}</div>
                                            </>
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
                                            <Route path="/" element={<HomePage />} />
                                            <Route path="*" element={<HomePage />} />
                                        </Routes>
                                    </Suspense>
                                </main>
                                <Toasts />
                            </WebSocketApiRouter>
                        </HashRouter>
                    </ErrorBoundary>
                </NiceModal.Provider>
            </I18nextProvider>
        </React.StrictMode>
    );
}
