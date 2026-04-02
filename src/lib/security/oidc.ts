import { createHash, randomBytes, createSign, createVerify } from 'crypto';

export interface OIDCConfig {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userinfoEndpoint?: string;
  jwksUri?: string;
}

export interface OIDCTokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

export interface OIDCUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  groups?: string[];
  roles?: string[];
  [key: string]: unknown;
}

export interface OIDCIDTokenClaims {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  nonce?: string;
  at_hash?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
}

export function generateState(): string {
  return base64UrlEncode(randomBytes(16));
}

export function buildAuthorizationUrl(
  config: OIDCConfig,
  state: string,
  codeChallenge: string,
  nonce?: string
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  if (nonce) {
    params.append('nonce', nonce);
  }

  const authEndpoint = config.authorizationEndpoint || `${config.issuer}/authorize`;
  return `${authEndpoint}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  config: OIDCConfig,
  code: string,
  codeVerifier: string
): Promise<OIDCTokens> {
  const tokenEndpoint = config.tokenEndpoint || `${config.issuer}/oauth/token`;
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    code_verifier: codeVerifier,
  });

  if (config.clientSecret) {
    params.append('client_secret', config.clientSecret);
  }

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type || 'Bearer',
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

export async function getUserInfo(config: OIDCConfig, accessToken: string): Promise<OIDCUserInfo> {
  const userinfoEndpoint = config.userinfoEndpoint || `${config.issuer}/userinfo`;
  
  const response = await fetch(userinfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }

  return response.json();
}

export function decodeIdToken(token: string): OIDCIDTokenClaims {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return payload;
}

export function validateIdToken(
  token: OIDCIDTokenClaims,
  config: OIDCConfig,
  nonce?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (token.iss !== config.issuer) {
    errors.push(`Invalid issuer: expected ${config.issuer}, got ${token.iss}`);
  }

  const now = Math.floor(Date.now() / 1000);
  if (token.exp < now) {
    errors.push('Token has expired');
  }

  if (token.iat > now + 60) {
    errors.push('Token issued in the future');
  }

  const expectedAud = Array.isArray(token.aud) ? token.aud : [token.aud];
  if (!expectedAud.includes(config.clientId)) {
    errors.push(`Invalid audience: ${token.aud}`);
  }

  if (nonce && token.nonce !== nonce) {
    errors.push('Invalid nonce');
  }

  return { valid: errors.length === 0, errors };
}

export interface OIDCSession {
  provider: string;
  sub: string;
  email?: string;
  name?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  nonce?: string;
  codeVerifier?: string;
  state?: string;
}

export function createOIDCSession(
  config: OIDCConfig,
  tokens: OIDCTokens,
  userInfo: OIDCUserInfo,
  nonce?: string,
  codeVerifier?: string,
  state?: string
): OIDCSession {
  return {
    provider: config.issuer,
    sub: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    nonce,
    codeVerifier,
    state,
  };
}

function base64UrlEncode(data: Buffer | string): string {
  if (typeof data === 'string') {
    data = Buffer.from(data);
  }
  return data.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(data: string): string {
  const padded = data + '='.repeat((4 - data.length % 4) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}
