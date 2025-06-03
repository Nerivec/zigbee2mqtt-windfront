import NiceModal from '@ebay/nice-modal-react'
import React, { lazy, Suspense } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { Provider } from 'react-redux'
import { HashRouter, Route, Routes, useRoutes } from 'react-router'
import { ErrorBoundary } from './ErrorBoundary.js'
import { WebSocketApiRouter } from './WebSocketApiRouter.js'
import ScrollToTop from './components/ScrollToTop.js'
import { AuthForm } from './components/modal/components/AuthModal.js'
import NavBar from './components/navbar/NavBar.js'
import Toasts from './components/toasts/Toasts.js'
import i18n from './i18n/index.js'
import { appRoutes } from './routes/index.js'
import store from './store.js'

export function Main() {
  const { t } = useTranslation('common')

  return (
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <NiceModal.Provider>
          <AuthForm id="auth-form" onAuth={async () => {}} />
          <Provider store={store}>
            <ErrorBoundary>
              <HashRouter>
                <ScrollToTop />
                <WebSocketApiRouter>
                  <NavBar />
                  <main className="p-3">
                    <Suspense
                      fallback={
                        <>
                          <div className="flex flex-row justify-center items-center gap-2">
                            <span className="loading loading-infinity loading-xl" />
                          </div>
                          <div className="flex flex-row justify-center items-center gap-2">
                            {t('loading')}
                          </div>
                        </>
                      }
                    >
                      <Routes>
                        {appRoutes.map((route) => (
                          <Route
                            key={route.path}
                            path={route.path}
                            element={route.element}
                          />
                        ))}
                      </Routes>
                    </Suspense>
                  </main>
                  <Toasts />
                </WebSocketApiRouter>
              </HashRouter>
            </ErrorBoundary>
          </Provider>
        </NiceModal.Provider>
      </I18nextProvider>
    </React.StrictMode>
  )
}
