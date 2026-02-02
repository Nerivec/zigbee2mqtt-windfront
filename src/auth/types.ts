/**
 * Social provider configurations
 */
export interface GoogleAuthConfig {
    client_id: string;
}

export interface MicrosoftAuthConfig {
    client_id: string;
    tenant: string;
}

export interface GitHubAuthConfig {
    client_id: string;
}

export interface AppleAuthConfig {
    client_id: string;
}

export interface SocialAuthConfig {
    google?: GoogleAuthConfig;
    microsoft?: MicrosoftAuthConfig;
    github?: GitHubAuthConfig;
    apple?: AppleAuthConfig;
}

/**
 * Auth configuration returned from the backend /api/auth/config endpoint
 */
export interface AuthConfig {
    // Token-based auth enabled
    token_enabled: boolean;
    // Custom OIDC/SSO provider
    oidc?: {
        issuer_url: string;
        client_id: string;
    };
    // Social login providers
    social: SocialAuthConfig;
}

/**
 * Legacy auth config type for backward compatibility
 * @deprecated Use AuthConfig instead
 */
export interface LegacyAuthConfig {
    type: "none" | "token" | "oidc";
    oidc?: {
        issuer_url: string;
        client_id: string;
    };
}

/**
 * Supported social provider types
 */
export type SocialProvider = "google" | "microsoft" | "github" | "apple";

/**
 * OIDC provider endpoints (resolved from discovery or hardcoded for social providers)
 */
export interface OIDCEndpoints {
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint?: string;
    jwks_uri: string;
    issuer: string;
}

/**
 * Pre-configured OIDC endpoints for social providers
 */
export const SOCIAL_PROVIDER_CONFIG: Record<SocialProvider, {
    name: string;
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    jwks_uri: string;
    scopes: string[];
    usePKCE: boolean;
}> = {
    google: {
        name: "Google",
        issuer: "https://accounts.google.com",
        authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        token_endpoint: "https://oauth2.googleapis.com/token",
        jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
        scopes: ["openid", "email", "profile"],
        usePKCE: true,
    },
    microsoft: {
        name: "Microsoft",
        issuer: "https://login.microsoftonline.com/{tenant}/v2.0",
        authorization_endpoint: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
        token_endpoint: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
        jwks_uri: "https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys",
        scopes: ["openid", "email", "profile"],
        usePKCE: true,
    },
    github: {
        name: "GitHub",
        issuer: "https://github.com",
        authorization_endpoint: "https://github.com/login/oauth/authorize",
        token_endpoint: "https://github.com/login/oauth/access_token",
        jwks_uri: "", // GitHub doesn't use JWKs - OAuth2 only
        scopes: ["read:user", "user:email"],
        usePKCE: false, // GitHub doesn't support PKCE
    },
    apple: {
        name: "Apple",
        issuer: "https://appleid.apple.com",
        authorization_endpoint: "https://appleid.apple.com/auth/authorize",
        token_endpoint: "https://appleid.apple.com/auth/token",
        jwks_uri: "https://appleid.apple.com/auth/keys",
        scopes: ["openid", "email", "name"],
        usePKCE: true,
    },
};

/**
 * Cached auth state per API instance
 */
export interface AuthState {
    config: AuthConfig | undefined;
    oidcToken: string | undefined;
    loading: boolean;
    error: string | undefined;
}
