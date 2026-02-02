import {
    faCheckCircle,
    faExclamationTriangle,
    faInfoCircle,
    faKey,
    faLockOpen,
    faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faApple, faGithub, faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { fetchAuthConfig, clearAuthConfigCache, getAvailableSocialProviders } from "../../auth/oidcService.js";
import type { AuthConfig, SocialProvider } from "../../auth/types.js";
import { SOCIAL_PROVIDER_CONFIG } from "../../auth/types.js";

type AuthStatusCardProps = {
    sourceIdx: number;
};

const socialIcons: Record<SocialProvider, typeof faGoogle> = {
    google: faGoogle,
    microsoft: faMicrosoft,
    github: faGithub,
    apple: faApple,
};

export default function AuthStatusCard({ sourceIdx }: AuthStatusCardProps) {
    const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            setLoading(true);
            setError(null);
            // Clear cache to get fresh config
            clearAuthConfigCache(sourceIdx);
            try {
                const config = await fetchAuthConfig(sourceIdx);
                setAuthConfig(config);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch auth config");
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [sourceIdx]);

    if (loading) {
        return (
            <div className="card bg-base-200 mb-4">
                <div className="card-body">
                    <div className="flex items-center gap-2">
                        <span className="loading loading-spinner loading-sm" />
                        <span>Loading authentication status...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-warning mb-4">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>Could not fetch authentication status: {error}</span>
            </div>
        );
    }

    // Determine auth status
    const hasOidc = !!authConfig?.oidc;
    const hasToken = authConfig?.token_enabled ?? false;
    const socialProviders = authConfig ? getAvailableSocialProviders(authConfig) : [];
    const hasSocial = socialProviders.length > 0;
    const hasAnyAuth = hasOidc || hasToken || hasSocial;

    const getStatusInfo = () => {
        if (hasOidc && hasSocial) {
            return {
                icon: faShieldAlt,
                iconColor: "text-success",
                title: "SSO + Social Login",
                description: "Enterprise SSO and social login are enabled.",
                status: "secure",
                badge: { text: "Multi-Provider", color: "badge-success" },
            };
        }
        if (hasOidc) {
            return {
                icon: faShieldAlt,
                iconColor: "text-success",
                title: "SSO Authentication (OIDC)",
                description: "Users authenticate via your identity provider.",
                status: "secure",
                badge: { text: "Enterprise SSO", color: "badge-success" },
            };
        }
        if (hasSocial) {
            return {
                icon: faCheckCircle,
                iconColor: "text-success",
                title: "Social Login",
                description: `Users can sign in with ${socialProviders.map((p) => SOCIAL_PROVIDER_CONFIG[p].name).join(", ")}.`,
                status: "protected",
                badge: { text: "Social Auth", color: "badge-success" },
            };
        }
        if (hasToken) {
            return {
                icon: faKey,
                iconColor: "text-warning",
                title: "Token Authentication",
                description: "Users must enter a static token to access the frontend.",
                status: "protected",
                badge: { text: "Simple Auth", color: "badge-warning" },
            };
        }
        return {
            icon: faLockOpen,
            iconColor: "text-error",
            title: "No Authentication",
            description: "The frontend is accessible without authentication.",
            status: "unprotected",
            badge: { text: "Unprotected", color: "badge-error" },
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="space-y-4 mb-4">
            {/* Current Status Card */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex items-start gap-4">
                        <div className={`text-3xl ${statusInfo.iconColor}`}>
                            <FontAwesomeIcon icon={statusInfo.icon} />
                        </div>
                        <div className="flex-1">
                            <h3 className="card-title text-lg flex items-center gap-2">
                                Current: {statusInfo.title}
                                <span className={`badge ${statusInfo.badge.color} badge-sm`}>
                                    {statusInfo.badge.text}
                                </span>
                            </h3>
                            <p className="opacity-70">{statusInfo.description}</p>

                            {/* Show OIDC details */}
                            {authConfig?.oidc && (
                                <div className="text-sm opacity-70 mt-2 space-y-1">
                                    <div>
                                        <strong>Provider:</strong>{" "}
                                        {new URL(authConfig.oidc.issuer_url).hostname}
                                    </div>
                                    <div>
                                        <strong>Client ID:</strong>{" "}
                                        <code className="text-xs">{authConfig.oidc.client_id}</code>
                                    </div>
                                </div>
                            )}

                            {/* Show enabled social providers */}
                            {hasSocial && (
                                <div className="flex gap-2 mt-3">
                                    {socialProviders.map((provider) => (
                                        <div
                                            key={provider}
                                            className="badge badge-outline gap-1"
                                            title={SOCIAL_PROVIDER_CONFIG[provider].name}
                                        >
                                            <FontAwesomeIcon icon={socialIcons[provider]} />
                                            {SOCIAL_PROVIDER_CONFIG[provider].name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Warning for no auth */}
                            {!hasAnyAuth && (
                                <div className="alert alert-warning mt-3">
                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                    <span>
                                        Consider enabling authentication if the frontend is exposed to the
                                        network.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Authentication Options Info */}
            <div className="alert alert-info">
                <FontAwesomeIcon icon={faInfoCircle} />
                <div>
                    <h4 className="font-bold">Authentication Options</h4>
                    <p className="text-sm">
                        Zigbee2MQTT supports multiple authentication methods:
                    </p>
                    <ul className="text-sm mt-2 space-y-1">
                        <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faKey} className="text-warning" />
                            <strong>Auth Token</strong> — Simple password-like protection
                        </li>
                        <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-success" />
                            <strong>OIDC/SSO</strong> — Enterprise Single Sign-On (Authentik, Keycloak,
                            Auth0, Okta)
                        </li>
                        <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faGoogle} className="text-info" />
                            <strong>Social Login</strong> — Google, Microsoft, GitHub, Apple
                        </li>
                    </ul>
                    <p className="text-sm mt-2 opacity-70">
                        Multiple methods can be enabled simultaneously. Users will see all available
                        options on the login page.
                    </p>
                </div>
            </div>

            {/* OIDC Setup Guide */}
            {!hasOidc && (
                <div className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">
                        <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-success" />
                        How to set up SSO with OIDC
                    </div>
                    <div className="collapse-content">
                        <div className="prose prose-sm max-w-none">
                            <h4>1. Prerequisites</h4>
                            <p>You need an OIDC-compatible identity provider:</p>
                            <ul>
                                <li>
                                    <strong>Authentik</strong> — Recommended for self-hosting
                                </li>
                                <li>
                                    <strong>Keycloak</strong> — Popular open-source option
                                </li>
                                <li>
                                    <strong>Auth0 / Okta</strong> — Cloud-based solutions
                                </li>
                            </ul>

                            <h4>2. Configure Zigbee2MQTT</h4>
                            <pre className="bg-base-300 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre">
                                {`frontend:
  oidc:
    enabled: true
    issuer_url: "https://your-provider.com/app/"
    client_id: "your-client-id"`}
                            </pre>

                            <div className="alert alert-warning mt-4">
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>Restart Zigbee2MQTT after changing authentication settings.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Social Login Setup Guide */}
            {!hasSocial && (
                <div className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">
                        <FontAwesomeIcon icon={faGoogle} className="mr-2 text-info" />
                        How to set up Social Login
                    </div>
                    <div className="collapse-content">
                        <div className="prose prose-sm max-w-none">
                            <h4>Google Login</h4>
                            <pre className="bg-base-300 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre">
                                {`frontend:
  social:
    google:
      enabled: true
      client_id: "xxx.apps.googleusercontent.com"`}
                            </pre>

                            <h4>Microsoft Login</h4>
                            <pre className="bg-base-300 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre">
                                {`frontend:
  social:
    microsoft:
      enabled: true
      client_id: "your-app-id"
      tenant: "common"  # or specific tenant`}
                            </pre>

                            <h4>GitHub Login</h4>
                            <pre className="bg-base-300 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre">
                                {`frontend:
  social:
    github:
      enabled: true
      client_id: "your-client-id"
      client_secret: "your-secret"`}
                            </pre>

                            <div className="alert alert-info mt-4">
                                <FontAwesomeIcon icon={faInfoCircle} />
                                <span>
                                    Create OAuth apps at each provider's developer console and set the
                                    redirect URI to your Zigbee2MQTT frontend URL.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Token Setup Guide */}
            {!hasToken && !hasOidc && !hasSocial && (
                <div className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">
                        <FontAwesomeIcon icon={faKey} className="mr-2 text-warning" />
                        How to set up Token authentication
                    </div>
                    <div className="collapse-content">
                        <div className="prose prose-sm max-w-none">
                            <p>For simple protection:</p>
                            <pre className="bg-base-300 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre">
                                {`frontend:
  auth_token: "your-secret-token"`}
                            </pre>
                            <div className="alert alert-info mt-2">
                                <FontAwesomeIcon icon={faInfoCircle} />
                                <span>
                                    Use a strong, random token. Consider SSO or social login for better
                                    security.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
