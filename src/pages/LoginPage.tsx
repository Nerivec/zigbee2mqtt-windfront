import { faArrowRightLong, faBuilding, faKey, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faApple, faGithub, faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import store2 from "store2";
import {
    fetchAuthConfig,
    startOidcLogin,
    startSocialLogin,
    getOidcToken,
    hasOAuthOptions,
    getAvailableSocialProviders,
} from "../auth/oidcService.js";
import type { AuthConfig, SocialProvider } from "../auth/types.js";
import { SOCIAL_PROVIDER_CONFIG } from "../auth/types.js";
import { AUTH_TOKEN_KEY } from "../localStoreConsts.js";
import { API_NAMES, MULTI_INSTANCE, useAppStore } from "../store.js";
import { startWebSocketManager } from "../websocket/WebSocketManager.js";

type AuthModeState = {
    loading: boolean;
    config: AuthConfig | undefined;
    error: string | undefined;
};

// Provider button styles matching their brand colors
const providerStyles: Record<SocialProvider | "sso", { bg: string; hover: string; text: string; icon: typeof faGoogle }> = {
    google: {
        bg: "bg-white",
        hover: "hover:bg-gray-50",
        text: "text-gray-700",
        icon: faGoogle,
    },
    apple: {
        bg: "bg-black",
        hover: "hover:bg-gray-900",
        text: "text-white",
        icon: faApple,
    },
    microsoft: {
        bg: "bg-white",
        hover: "hover:bg-gray-50",
        text: "text-gray-700",
        icon: faMicrosoft,
    },
    github: {
        bg: "bg-gray-900",
        hover: "hover:bg-gray-800",
        text: "text-white",
        icon: faGithub,
    },
    sso: {
        bg: "bg-white",
        hover: "hover:bg-gray-50",
        text: "text-gray-700",
        icon: faBuilding,
    },
};

export function LoginPage() {
    const authRequired = useAppStore((s) => s.authRequired);
    const [values, setValues] = useState(() => API_NAMES.map((_v, idx) => store2.get(`${AUTH_TOKEN_KEY}_${idx}`, "") as string));
    const [authModes, setAuthModes] = useState<AuthModeState[]>(() =>
        API_NAMES.map(() => ({ loading: true, config: undefined, error: undefined }))
    );
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [showTokenInput, setShowTokenInput] = useState(false);

    // Fetch auth config for each API that requires auth
    useEffect(() => {
        const fetchConfigs = async () => {
            const newModes = [...authModes];

            for (let i = 0; i < API_NAMES.length; i++) {
                if (!authRequired[i]) {
                    continue;
                }

                try {
                    const config = await fetchAuthConfig(i);
                    newModes[i] = { loading: false, config, error: undefined };

                    // If we already have a token, try to use it
                    if (hasOAuthOptions(config)) {
                        const existingToken = getOidcToken(i);
                        if (existingToken) {
                            useAppStore.setState((state) => {
                                const newAuth = [...state.authRequired];
                                newAuth[i] = false;
                                return { authRequired: newAuth };
                            });
                            startWebSocketManager();
                        }
                    }
                } catch (error) {
                    console.error(`Failed to fetch auth config for API ${i}:`, error);
                    newModes[i] = {
                        loading: false,
                        config: { token_enabled: true, social: {} },
                        error: error instanceof Error ? error.message : "Failed to fetch auth config",
                    };
                }
            }

            setAuthModes(newModes);
        };

        fetchConfigs();
    }, [authRequired]);

    const onTokenSubmit = () => {
        const newAuth: boolean[] = [];

        for (let i = 0; i < API_NAMES.length; i++) {
            const token = values[i] ?? "";

            if (token) {
                store2.set(`${AUTH_TOKEN_KEY}_${i}`, token);
            } else {
                store2.remove(`${AUTH_TOKEN_KEY}_${i}`);
            }

            newAuth[i] = false;
        }

        useAppStore.setState({ authRequired: newAuth });
        startWebSocketManager();
    };

    const onSocialLogin = async (idx: number, provider: SocialProvider) => {
        const config = authModes[idx].config;
        if (!config) return;

        setLoadingProvider(provider);
        try {
            await startSocialLogin(idx, provider, config);
        } catch (error) {
            console.error(`${provider} login error:`, error);
            setLoadingProvider(null);
        }
    };

    const onOidcLogin = async (idx: number) => {
        const config = authModes[idx].config;
        if (!config?.oidc) return;

        setLoadingProvider("sso");
        try {
            await startOidcLogin(idx, config);
        } catch (error) {
            console.error("SSO login error:", error);
            setLoadingProvider(null);
        }
    };

    if (!authRequired || !authRequired.some((v) => v)) {
        return null;
    }

    const needsAuth = authRequired.map((required, idx) => (required ? idx : -1)).filter((idx) => idx !== -1);

    // Get the first API that needs auth (for single instance mode)
    const primaryIdx = needsAuth[0];
    const primaryConfig = authModes[primaryIdx]?.config;
    const isLoading = authModes[primaryIdx]?.loading;
    const error = authModes[primaryIdx]?.error;

    // Determine available auth methods
    const socialProviders = primaryConfig ? getAvailableSocialProviders(primaryConfig) : [];
    const hasOidc = !!primaryConfig?.oidc;
    const hasToken = primaryConfig?.token_enabled ?? false;
    const hasAnyOAuth = socialProviders.length > 0 || hasOidc;

    return (
        <main className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <svg
                                className="w-12 h-12 text-primary"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold">Zigbee2MQTT</h1>
                        <p className="text-base-content/60 mt-1">Sign in to access your smart home</p>
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-primary" />
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="alert alert-warning mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Auth options */}
                    {!isLoading && primaryConfig && (
                        <>
                            {/* Social login buttons */}
                            {socialProviders.length > 0 && (
                                <div className="space-y-3">
                                    {socialProviders.map((provider) => {
                                        const style = providerStyles[provider];
                                        const config = SOCIAL_PROVIDER_CONFIG[provider];
                                        const isLoadingThis = loadingProvider === provider;

                                        return (
                                            <button
                                                key={provider}
                                                type="button"
                                                className={`btn w-full ${style.bg} ${style.hover} ${style.text} border border-base-300 font-normal`}
                                                onClick={() => onSocialLogin(primaryIdx, provider)}
                                                disabled={loadingProvider !== null}
                                            >
                                                {isLoadingThis ? (
                                                    <FontAwesomeIcon icon={faSpinner} spin />
                                                ) : (
                                                    <FontAwesomeIcon icon={style.icon} className="text-lg" />
                                                )}
                                                <span className="flex-1 text-center">
                                                    Continue with {config.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* SSO button */}
                            {hasOidc && (
                                <>
                                    {socialProviders.length > 0 && <div className="divider text-xs text-base-content/50">or</div>}
                                    <button
                                        type="button"
                                        className="btn w-full bg-white hover:bg-gray-50 text-gray-700 border border-base-300 font-normal"
                                        onClick={() => onOidcLogin(primaryIdx)}
                                        disabled={loadingProvider !== null}
                                    >
                                        {loadingProvider === "sso" ? (
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                        ) : (
                                            <FontAwesomeIcon icon={faBuilding} className="text-lg" />
                                        )}
                                        <span className="flex-1 text-center">Single sign-on (SSO)</span>
                                    </button>
                                </>
                            )}

                            {/* Token auth section */}
                            {hasToken && (
                                <>
                                    {hasAnyOAuth && (
                                        <div className="divider text-xs text-base-content/50">
                                            or continue with token
                                        </div>
                                    )}

                                    {!showTokenInput && hasAnyOAuth ? (
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm w-full"
                                            onClick={() => setShowTokenInput(true)}
                                        >
                                            <FontAwesomeIcon icon={faKey} />
                                            Use access token
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            {needsAuth.map((idx) => (
                                                <div key={idx} className="form-control">
                                                    {MULTI_INSTANCE && (
                                                        <label className="label">
                                                            <span className="label-text">{API_NAMES[idx]} Token</span>
                                                        </label>
                                                    )}
                                                    <div className="join w-full">
                                                        <input
                                                            type="password"
                                                            placeholder={MULTI_INSTANCE ? "" : "Enter access token"}
                                                            className="input input-bordered join-item flex-1"
                                                            autoCapitalize="none"
                                                            value={values[idx]}
                                                            onChange={(e) => {
                                                                const newValues = Array.from(values);
                                                                newValues[idx] = e.target.value;
                                                                setValues(newValues);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    onTokenSubmit();
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary join-item"
                                                            onClick={onTokenSubmit}
                                                        >
                                                            <FontAwesomeIcon icon={faArrowRightLong} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* No auth configured */}
                            {!hasAnyOAuth && !hasToken && (
                                <div className="alert alert-info">
                                    <span>No authentication methods configured.</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="card-body pt-0">
                    <p className="text-xs text-center text-base-content/40">
                        By continuing, you agree to the terms of service.
                    </p>
                </div>
            </div>
        </main>
    );
}
