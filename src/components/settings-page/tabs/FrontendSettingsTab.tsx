import {
    faGlobe,
    faKey,
    faLock,
    faPowerOff,
    faShieldAlt,
    faServer,
    faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { faApple, faGithub, faGoogle, faMicrosoft, faWindows } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import InputField from "../../form-fields/InputField.js";
import NumberField from "../../form-fields/NumberField.js";
import AuthStatusCard from "../AuthStatusCard.js";
import { Section, SettingCard } from "../shared/index.js";

type FrontendSettingsTabProps = {
    sourceIdx: number;
};

export default function FrontendSettingsTab({ sourceIdx }: FrontendSettingsTabProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    const frontendConfig = bridgeInfo?.config?.frontend as Record<string, unknown> | undefined;
    const frontendSchema = bridgeInfo?.config_schema?.properties?.frontend as JSONSchema7 | undefined;

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", { options: { frontend: options } });
        },
        [sourceIdx],
    );

    const setNestedSettings = useCallback(
        async (section: string, options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", {
                options: { frontend: { [section]: options } },
            });
        },
        [sourceIdx],
    );

    // Extract current values
    const isEnabled = (frontendConfig?.enabled as boolean) ?? false;
    const disableUiServing = (frontendConfig?.disable_ui_serving as boolean) ?? false;
    const host = (frontendConfig?.host as string) ?? "";
    const port = (frontendConfig?.port as number) ?? 8080;
    const baseUrl = (frontendConfig?.base_url as string) ?? "/";
    const url = (frontendConfig?.url as string) ?? "";
    const sslCert = (frontendConfig?.ssl_cert as string) ?? "";
    const sslKey = (frontendConfig?.ssl_key as string) ?? "";
    const authToken = (frontendConfig?.auth_token as string) ?? "";

    // OIDC config
    const oidcConfig = frontendConfig?.oidc as Record<string, unknown> | undefined;
    const oidcEnabled = (oidcConfig?.enabled as boolean) ?? false;
    const oidcIssuerUrl = (oidcConfig?.issuer_url as string) ?? "";
    const oidcClientId = (oidcConfig?.client_id as string) ?? "";
    const oidcAudience = (oidcConfig?.audience as string) ?? "";

    // Social config
    const socialConfig = frontendConfig?.social as Record<string, unknown> | undefined;
    const googleConfig = socialConfig?.google as Record<string, unknown> | undefined;
    const microsoftConfig = socialConfig?.microsoft as Record<string, unknown> | undefined;
    const githubConfig = socialConfig?.github as Record<string, unknown> | undefined;
    const appleConfig = socialConfig?.apple as Record<string, unknown> | undefined;

    if (!bridgeInfo) {
        return (
            <div className="flex items-center justify-center p-8">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Current Auth Status */}
            <AuthStatusCard sourceIdx={sourceIdx} />

            {/* Section 1: Frontend Availability */}
            <Section
                title="Frontend Availability"
                icon={faPowerOff}
                iconColor="text-success"
                description="Control whether the web interface is enabled and how it's served"
            >
                <div className="space-y-4">
                    <CheckboxField
                        name="enabled"
                        label="Enable Frontend"
                        detail="Enable the Zigbee2MQTT web interface. When disabled, only MQTT communication is available."
                        defaultChecked={isEnabled}
                        onChange={(e) => setSettings({ enabled: e.target.checked })}
                    />

                    {isEnabled && (
                        <CheckboxField
                            name="disable_ui_serving"
                            label="Disable UI Serving (API Only)"
                            detail="When enabled, Zigbee2MQTT only provides the WebSocket API. You must serve the UI files yourself (e.g., via nginx). Useful for custom deployments or reverse proxy setups."
                            defaultChecked={disableUiServing}
                            onChange={(e) => setSettings({ disable_ui_serving: e.target.checked })}
                        />
                    )}
                </div>
            </Section>

            {/* Section 2: Network Configuration (only show if frontend enabled) */}
            {isEnabled && (
                <Section
                    title="Network Configuration"
                    icon={faGlobe}
                    iconColor="text-info"
                    description="Configure how the frontend is accessed over the network"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            name="host"
                            label="Bind Host"
                            detail="IP address or hostname to bind to. Leave empty for all interfaces. Use a path (e.g., /run/z2m.sock) for Unix socket."
                            initialValue={host}
                            onSubmit={(value) => setSettings({ host: value || null })}
                        />
                        <NumberField
                            type="number"
                            name="port"
                            label="Port"
                            detail="Port number for the web interface"
                            initialValue={port}
                            min={1}
                            max={65535}
                            onSubmit={(value, valid) => valid && setSettings({ port: value })}
                        />
                        <InputField
                            name="base_url"
                            label="Base URL"
                            detail="Base path if hosting under a subpath (e.g., '/z2m' for http://host/z2m)"
                            initialValue={baseUrl}
                            onSubmit={(value) => setSettings({ base_url: value || "/" })}
                        />
                        <InputField
                            name="url"
                            label="External URL"
                            detail="Public URL for accessing the frontend (used for Home Assistant device pages)"
                            initialValue={url}
                            onSubmit={(value) => setSettings({ url: value || null })}
                        />
                    </div>

                    <div className="divider text-sm">SSL/TLS (Optional)</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            name="ssl_cert"
                            label="SSL Certificate Path"
                            detail="Path to SSL certificate file for HTTPS"
                            initialValue={sslCert}
                            onSubmit={(value) => setSettings({ ssl_cert: value || null })}
                        />
                        <InputField
                            name="ssl_key"
                            label="SSL Key Path"
                            detail="Path to SSL private key file for HTTPS"
                            initialValue={sslKey}
                            onSubmit={(value) => setSettings({ ssl_key: value || null })}
                        />
                    </div>
                </Section>
            )}

            {/* Section 3: Authentication (only show if frontend enabled) */}
            {isEnabled && (
                <Section
                    title="Authentication"
                    icon={faLock}
                    iconColor="text-warning"
                    description="Configure how users authenticate to access the frontend. Multiple methods can be enabled simultaneously."
                >
                    {/* Token Auth */}
                    <SettingCard
                        title="Access Token"
                        description="Simple password-like protection. Users enter a static token to access the frontend."
                        icon={faKey}
                        iconColor="text-warning"
                        enabled={!!authToken}
                        onToggle={(enabled) => {
                            if (!enabled) {
                                setSettings({ auth_token: null });
                            }
                        }}
                        badge={{ text: "Simple", color: "badge-warning" }}
                    >
                        <InputField
                            name="auth_token"
                            label="Token"
                            detail="The secret token users must enter"
                            initialValue={authToken}
                            type="password"
                            onSubmit={(value) => setSettings({ auth_token: value || null })}
                        />
                    </SettingCard>

                    {/* OIDC/SSO */}
                    <SettingCard
                        title="OIDC / Single Sign-On"
                        description="Enterprise SSO via OpenID Connect. Works with Authentik, Keycloak, Auth0, Okta, and more."
                        icon={faShieldAlt}
                        iconColor="text-success"
                        enabled={oidcEnabled}
                        onToggle={(enabled) => setNestedSettings("oidc", { enabled })}
                        badge={{ text: "Enterprise", color: "badge-success" }}
                    >
                        <InputField
                            name="issuer_url"
                            label="Issuer URL"
                            detail="Your OIDC provider's issuer URL"
                            initialValue={oidcIssuerUrl}
                            onSubmit={(value) => setNestedSettings("oidc", { issuer_url: value })}
                        />
                        <InputField
                            name="client_id"
                            label="Client ID"
                            detail="Application client ID from your provider"
                            initialValue={oidcClientId}
                            onSubmit={(value) => setNestedSettings("oidc", { client_id: value })}
                        />
                        <InputField
                            name="audience"
                            label="Audience (Optional)"
                            detail="Custom audience claim if different from client ID"
                            initialValue={oidcAudience}
                            onSubmit={(value) => setNestedSettings("oidc", { audience: value || null })}
                        />
                    </SettingCard>

                    <div className="divider text-sm">Social Login Providers</div>

                    {/* Google */}
                    <SettingCard
                        title="Google"
                        description="Allow users to sign in with their Google accounts"
                        icon={faGoogle}
                        iconColor="text-error"
                        enabled={(googleConfig?.enabled as boolean) ?? false}
                        onToggle={(enabled) =>
                            setNestedSettings("social", { google: { ...googleConfig, enabled } })
                        }
                    >
                        <InputField
                            name="google_client_id"
                            label="Client ID"
                            detail="OAuth Client ID from Google Cloud Console"
                            initialValue={(googleConfig?.client_id as string) ?? ""}
                            onSubmit={(value) =>
                                setNestedSettings("social", { google: { ...googleConfig, client_id: value } })
                            }
                        />
                    </SettingCard>

                    {/* Microsoft */}
                    <SettingCard
                        title="Microsoft"
                        description="Allow users to sign in with Microsoft accounts (personal, work, or school)"
                        icon={faMicrosoft}
                        iconColor="text-info"
                        enabled={(microsoftConfig?.enabled as boolean) ?? false}
                        onToggle={(enabled) =>
                            setNestedSettings("social", { microsoft: { ...microsoftConfig, enabled } })
                        }
                    >
                        <InputField
                            name="microsoft_client_id"
                            label="Application ID"
                            detail="Application (client) ID from Azure AD"
                            initialValue={(microsoftConfig?.client_id as string) ?? ""}
                            onSubmit={(value) =>
                                setNestedSettings("social", {
                                    microsoft: { ...microsoftConfig, client_id: value },
                                })
                            }
                        />
                        <InputField
                            name="microsoft_tenant"
                            label="Tenant"
                            detail="'common' for any account, 'organizations' for work/school, or specific tenant ID"
                            initialValue={(microsoftConfig?.tenant as string) ?? "common"}
                            onSubmit={(value) =>
                                setNestedSettings("social", {
                                    microsoft: { ...microsoftConfig, tenant: value || "common" },
                                })
                            }
                        />
                    </SettingCard>

                    {/* GitHub */}
                    <SettingCard
                        title="GitHub"
                        description="Allow users to sign in with their GitHub accounts"
                        icon={faGithub}
                        iconColor="text-base-content"
                        enabled={(githubConfig?.enabled as boolean) ?? false}
                        onToggle={(enabled) =>
                            setNestedSettings("social", { github: { ...githubConfig, enabled } })
                        }
                    >
                        <InputField
                            name="github_client_id"
                            label="Client ID"
                            detail="Client ID from GitHub OAuth App"
                            initialValue={(githubConfig?.client_id as string) ?? ""}
                            onSubmit={(value) =>
                                setNestedSettings("social", { github: { ...githubConfig, client_id: value } })
                            }
                        />
                        <InputField
                            name="github_client_secret"
                            label="Client Secret"
                            detail="Client secret from GitHub OAuth App"
                            type="password"
                            initialValue={(githubConfig?.client_secret as string) ?? ""}
                            onSubmit={(value) =>
                                setNestedSettings("social", {
                                    github: { ...githubConfig, client_secret: value },
                                })
                            }
                        />
                    </SettingCard>

                    {/* Apple */}
                    <SettingCard
                        title="Apple"
                        description="Allow users to sign in with their Apple ID"
                        icon={faApple}
                        iconColor="text-base-content"
                        enabled={(appleConfig?.enabled as boolean) ?? false}
                        onToggle={(enabled) =>
                            setNestedSettings("social", { apple: { ...appleConfig, enabled } })
                        }
                    >
                        <InputField
                            name="apple_client_id"
                            label="Service ID"
                            detail="Services ID identifier (e.g., com.example.z2m)"
                            initialValue={(appleConfig?.client_id as string) ?? ""}
                            onSubmit={(value) =>
                                setNestedSettings("social", { apple: { ...appleConfig, client_id: value } })
                            }
                        />
                        <InputField
                            name="apple_team_id"
                            label="Team ID"
                            detail="Your Apple Developer Team ID"
                            initialValue={(appleConfig?.team_id as string) ?? ""}
                            onSubmit={(value) =>
                                setNestedSettings("social", { apple: { ...appleConfig, team_id: value } })
                            }
                        />
                        <InputField
                            name="apple_key_id"
                            label="Key ID"
                            detail="Key ID for the private key"
                            initialValue={(appleConfig?.key_id as string) ?? ""}
                            onSubmit={(value) =>
                                setNestedSettings("social", { apple: { ...appleConfig, key_id: value } })
                            }
                        />
                        <InputField
                            name="apple_private_key_path"
                            label="Private Key Path"
                            detail="Path to the .p8 private key file"
                            initialValue={(appleConfig?.private_key_path as string) ?? ""}
                            onSubmit={(value) =>
                                setNestedSettings("social", {
                                    apple: { ...appleConfig, private_key_path: value },
                                })
                            }
                        />
                    </SettingCard>

                    <div className="divider text-sm">Enterprise Directory Services</div>

                    {/* SAML2 - Coming Soon */}
                    <SettingCard
                        title="SAML 2.0"
                        description="Enterprise SAML-based Single Sign-On for legacy identity providers"
                        icon={faUserShield}
                        iconColor="text-purple-500"
                        enabled={false}
                        onToggle={() => {}}
                        badge={{ text: "Enterprise", color: "badge-secondary" }}
                        comingSoon
                    />

                    {/* Active Directory - Coming Soon */}
                    <SettingCard
                        title="Active Directory"
                        description="Direct authentication against Microsoft Active Directory"
                        icon={faWindows}
                        iconColor="text-blue-500"
                        enabled={false}
                        onToggle={() => {}}
                        comingSoon
                    />

                    {/* LDAP - Coming Soon */}
                    <SettingCard
                        title="LDAP"
                        description="Authenticate against LDAP directory servers (OpenLDAP, 389DS, etc.)"
                        icon={faServer}
                        iconColor="text-orange-500"
                        enabled={false}
                        onToggle={() => {}}
                        comingSoon
                    />

                    {/* Microsoft Entra ID Note */}
                    <div className="alert alert-info mt-4">
                        <FontAwesomeIcon icon={faMicrosoft} />
                        <div>
                            <strong>Microsoft Entra ID (Azure AD)</strong>
                            <p className="text-sm">
                                Use the OIDC/SSO option above with your Entra ID tenant, or enable Microsoft
                                social login for consumer accounts.
                            </p>
                        </div>
                    </div>
                </Section>
            )}

            {/* Restart Notice */}
            <div className="alert alert-warning">
                <FontAwesomeIcon icon={faPowerOff} />
                <span>
                    <strong>Changes require restart.</strong> Authentication and network settings take
                    effect after restarting Zigbee2MQTT.
                </span>
            </div>
        </div>
    );
}
