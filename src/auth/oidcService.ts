import { UserManager, WebStorageStateStore, type User } from "oidc-client-ts";
import store2 from "store2";
import { API_URLS } from "../store.js";
import type { AuthConfig, SocialProvider } from "./types.js";
import { SOCIAL_PROVIDER_CONFIG } from "./types.js";

const OIDC_TOKEN_KEY = "z2m-oidc-token";
const AUTH_CONFIG_KEY = "z2m-auth-config";
const AUTH_PROVIDER_KEY = "z2m-auth-provider";

// Cache UserManager instances per API instance and provider
const userManagers: Map<string, UserManager> = new Map();

/**
 * Build the HTTP base URL for an API instance (for fetching auth config)
 */
function buildHttpUrl(idx: number): string {
    const raw = API_URLS[idx];
    const protocol = window.location.protocol;
    // API_URLS contain the WebSocket path like "localhost:8080/api"
    // We need to convert to HTTP URL for the auth/config endpoint
    const url = new URL(`${protocol}//${raw}`);
    // Navigate up from /api to get base URL, then add /api/auth/config
    const basePath = url.pathname.replace(/\/api\/?$/, "");
    return `${url.origin}${basePath}`;
}

/**
 * Fetch auth configuration from the backend
 */
export async function fetchAuthConfig(idx: number): Promise<AuthConfig> {
    // Check cache first
    const cached = store2.get(`${AUTH_CONFIG_KEY}_${idx}`) as AuthConfig | undefined;
    if (cached) {
        return cached;
    }

    const baseUrl = buildHttpUrl(idx);
    const response = await fetch(`${baseUrl}/api/auth/config`);

    if (!response.ok) {
        throw new Error(`Failed to fetch auth config: ${response.status}`);
    }

    const config = (await response.json()) as AuthConfig;

    // Cache the config
    store2.set(`${AUTH_CONFIG_KEY}_${idx}`, config);

    return config;
}

/**
 * Clear cached auth config (useful when config might have changed)
 */
export function clearAuthConfigCache(idx: number): void {
    store2.remove(`${AUTH_CONFIG_KEY}_${idx}`);
}

/**
 * Get a cache key for user manager
 */
function getManagerKey(idx: number, provider: string): string {
    return `${idx}-${provider}`;
}

/**
 * Get or create a UserManager for OIDC authentication (custom provider)
 */
function getOrCreateOidcUserManager(idx: number, config: AuthConfig): UserManager {
    const key = getManagerKey(idx, "oidc");
    let manager = userManagers.get(key);

    if (manager) {
        return manager;
    }

    if (!config.oidc) {
        throw new Error("OIDC config not available");
    }

    const currentUrl = new URL(window.location.href);
    const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;

    manager = new UserManager({
        authority: config.oidc.issuer_url,
        client_id: config.oidc.client_id,
        redirect_uri: redirectUri,
        post_logout_redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid profile email",
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        automaticSilentRenew: true,
    });

    setupManagerEvents(manager, idx);
    userManagers.set(key, manager);
    return manager;
}

/**
 * Get or create a UserManager for social provider authentication
 */
function getOrCreateSocialUserManager(idx: number, provider: SocialProvider, config: AuthConfig): UserManager {
    const key = getManagerKey(idx, provider);
    let manager = userManagers.get(key);

    if (manager) {
        return manager;
    }

    const providerConfig = SOCIAL_PROVIDER_CONFIG[provider];
    const socialConfig = config.social[provider];

    if (!socialConfig) {
        throw new Error(`Social provider ${provider} not configured`);
    }

    const currentUrl = new URL(window.location.href);
    const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;

    // Handle Microsoft tenant replacement
    let authority = providerConfig.authorization_endpoint.replace("{tenant}", "");
    let issuer = providerConfig.issuer;

    if (provider === "microsoft" && "tenant" in socialConfig) {
        const tenant = socialConfig.tenant || "common";
        authority = providerConfig.authorization_endpoint.replace("{tenant}", tenant);
        issuer = providerConfig.issuer.replace("{tenant}", tenant);
    } else if (provider === "google") {
        authority = providerConfig.issuer;
    } else if (provider === "apple") {
        authority = providerConfig.issuer;
    }

    // For GitHub, we use a simplified OAuth2 flow (not full OIDC)
    if (provider === "github") {
        // GitHub requires special handling - create a minimal manager
        manager = new UserManager({
            authority: "https://github.com",
            client_id: socialConfig.client_id,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: providerConfig.scopes.join(" "),
            userStore: new WebStorageStateStore({ store: window.localStorage }),
            metadata: {
                issuer: "https://github.com",
                authorization_endpoint: providerConfig.authorization_endpoint,
                token_endpoint: providerConfig.token_endpoint,
                // GitHub doesn't have these, but oidc-client-ts requires them
                userinfo_endpoint: "https://api.github.com/user",
            },
        });
    } else {
        manager = new UserManager({
            authority,
            client_id: socialConfig.client_id,
            redirect_uri: redirectUri,
            post_logout_redirect_uri: redirectUri,
            response_type: "code",
            scope: providerConfig.scopes.join(" "),
            userStore: new WebStorageStateStore({ store: window.localStorage }),
            automaticSilentRenew: provider !== "apple", // Apple doesn't support silent renew well
        });
    }

    setupManagerEvents(manager, idx);
    userManagers.set(key, manager);
    return manager;
}

/**
 * Setup common event handlers for a UserManager
 */
function setupManagerEvents(manager: UserManager, idx: number): void {
    manager.events.addSilentRenewError((error) => {
        console.error(`Auth silent renew error for API ${idx}:`, error);
    });

    manager.events.addUserLoaded((user) => {
        if (user.access_token) {
            store2.set(`${OIDC_TOKEN_KEY}_${idx}`, user.access_token);
        }
    });
}

/**
 * Start OIDC login flow with custom provider (redirects to IdP)
 */
export async function startOidcLogin(idx: number, config: AuthConfig): Promise<void> {
    const manager = getOrCreateOidcUserManager(idx, config);
    // Store which API and provider we're authenticating for
    store2.set("oidc_auth_idx", idx);
    store2.set(AUTH_PROVIDER_KEY, "oidc");
    await manager.signinRedirect();
}

/**
 * Start social login flow (redirects to provider)
 */
export async function startSocialLogin(idx: number, provider: SocialProvider, config: AuthConfig): Promise<void> {
    const manager = getOrCreateSocialUserManager(idx, provider, config);
    // Store which API and provider we're authenticating for
    store2.set("oidc_auth_idx", idx);
    store2.set(AUTH_PROVIDER_KEY, provider);
    await manager.signinRedirect();
}

/**
 * Handle OIDC/OAuth callback after returning from IdP
 * Returns true if this was a callback, false if not
 */
export async function handleOidcCallback(): Promise<boolean> {
    // Check if this is an OIDC callback (has code or error in URL)
    const params = new URLSearchParams(window.location.search);
    if (!params.has("code") && !params.has("error")) {
        return false;
    }

    // Get the API index and provider we were authenticating for
    const idx = store2.get("oidc_auth_idx") as number | undefined;
    const provider = store2.get(AUTH_PROVIDER_KEY) as string | undefined;

    if (idx === undefined) {
        console.error("Auth callback but no API index stored");
        window.history.replaceState({}, "", window.location.pathname);
        return true;
    }

    try {
        const config = await fetchAuthConfig(idx);

        let manager: UserManager;
        if (provider === "oidc") {
            manager = getOrCreateOidcUserManager(idx, config);
        } else if (provider && provider in SOCIAL_PROVIDER_CONFIG) {
            manager = getOrCreateSocialUserManager(idx, provider as SocialProvider, config);
        } else {
            throw new Error(`Unknown auth provider: ${provider}`);
        }

        const user = await manager.signinRedirectCallback();

        if (user.access_token) {
            store2.set(`${OIDC_TOKEN_KEY}_${idx}`, user.access_token);
        }

        // Clean up
        store2.remove("oidc_auth_idx");
        store2.remove(AUTH_PROVIDER_KEY);

        // Remove code/state from URL
        window.history.replaceState({}, "", window.location.pathname);

        return true;
    } catch (error) {
        console.error("Auth callback error:", error);
        store2.remove("oidc_auth_idx");
        store2.remove(AUTH_PROVIDER_KEY);
        window.history.replaceState({}, "", window.location.pathname);
        throw error;
    }
}

/**
 * Get the current OIDC/OAuth user if logged in
 */
export async function getOidcUser(idx: number, config: AuthConfig, provider?: string): Promise<User | null> {
    let manager: UserManager | undefined;

    if (provider && provider !== "oidc" && provider in SOCIAL_PROVIDER_CONFIG) {
        try {
            manager = getOrCreateSocialUserManager(idx, provider as SocialProvider, config);
        } catch {
            return null;
        }
    } else if (config.oidc) {
        try {
            manager = getOrCreateOidcUserManager(idx, config);
        } catch {
            return null;
        }
    }

    if (!manager) {
        return null;
    }

    return manager.getUser();
}

/**
 * Get stored OIDC/OAuth token for an API instance
 */
export function getOidcToken(idx: number): string | undefined {
    return store2.get(`${OIDC_TOKEN_KEY}_${idx}`) as string | undefined;
}

/**
 * Clear OIDC/OAuth token for an API instance
 */
export function clearOidcToken(idx: number): void {
    store2.remove(`${OIDC_TOKEN_KEY}_${idx}`);
}

/**
 * Sign out
 */
export async function signOut(idx: number, config: AuthConfig): Promise<void> {
    clearOidcToken(idx);

    // Try to sign out from all configured managers
    for (const [key, manager] of userManagers) {
        if (key.startsWith(`${idx}-`)) {
            try {
                await manager.signoutRedirect();
            } catch (error) {
                console.error("Auth signout error:", error);
            }
        }
    }
}

/**
 * Check if token is valid (not expired)
 */
export async function isOidcTokenValid(idx: number, config: AuthConfig): Promise<boolean> {
    const user = await getOidcUser(idx, config);
    if (!user) {
        return false;
    }
    return !user.expired;
}

/**
 * Check if any auth method is available (not just token)
 */
export function hasOAuthOptions(config: AuthConfig): boolean {
    if (config.oidc) return true;
    if (config.social.google) return true;
    if (config.social.microsoft) return true;
    if (config.social.github) return true;
    if (config.social.apple) return true;
    return false;
}

/**
 * Get list of available social providers
 */
export function getAvailableSocialProviders(config: AuthConfig): SocialProvider[] {
    const providers: SocialProvider[] = [];
    if (config.social.google) providers.push("google");
    if (config.social.microsoft) providers.push("microsoft");
    if (config.social.github) providers.push("github");
    if (config.social.apple) providers.push("apple");
    return providers;
}
