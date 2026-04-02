export interface SSOConfig {
  id: string;
  tenantId: string;
  provider: SSOProvider;
  enabled: boolean;
  domain: string;
  metadataUrl?: string;
  certificate?: string;
  issuer?: string;
  ssoUrl?: string;
  acsUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SSOProvider = 'saml' | 'oidc';

export interface SSOProviderSAMLConfig {
  assertionConsumerServiceUrl: string;
  serviceProviderEntityId: string;
  serviceProviderLoginUrl: string;
  serviceProviderCertificate?: string;
  attributeMapping?: SAMLAttributeMapping;
}

export interface SAMLAttributeMapping {
  email: string;
  firstName?: string;
  lastName?: string;
  groups?: string;
  role?: string;
}

export interface SSOProviderOIDCConfig {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  claimsMapping?: OIDCClaimsMapping;
}

export interface OIDCClaimsMapping {
  email: string;
  givenName?: string;
  familyName?: string;
  groups?: string;
  role?: string;
}

export interface SSOUserSession {
  provider: SSOProvider;
  providerId: string;
  email: string;
  attributes: Record<string, string>;
  groups?: string[];
  roles?: string[];
  linkedAt: string;
}

export const SUPPORTED_SSO_PROVIDERS: { id: SSOProvider; name: string; icon: string }[] = [
  { id: 'saml', name: 'SAML 2.0', icon: 'shield' },
  { id: 'oidc', name: 'OpenID Connect', icon: 'key' },
];

export const SAML_PROVIDER_TEMPLATES = {
  okta: {
    name: 'Okta',
    documentation: 'https://developer.okta.com/docs/reference/saml/',
    requiredAttributes: ['email'],
    optionalAttributes: ['firstName', 'lastName', 'groups'],
  },
  azure: {
    name: 'Microsoft Entra ID (Azure AD)',
    documentation: 'https://learn.microsoft.com/en-us/azure/active-directory/develop/saml-protocol',
    requiredAttributes: ['email'],
    optionalAttributes: ['displayName', 'groups', 'roles'],
  },
  onelogin: {
    name: 'OneLogin',
    documentation: 'https://developers.onelogin.com/saml',
    requiredAttributes: ['email'],
    optionalAttributes: ['firstName', 'lastName', 'groups'],
  },
  google: {
    name: 'Google Workspace',
    documentation: 'https://support.google.com/a/answer/6087519',
    requiredAttributes: ['email'],
    optionalAttributes: ['firstName', 'lastName', 'groups'],
  },
  ping: {
    name: 'Ping Identity',
    documentation: 'https://docs.pingidentity.com/',
    requiredAttributes: ['email'],
    optionalAttributes: ['firstName', 'lastName', 'groups'],
  },
};

export const OIDC_PROVIDER_TEMPLATES = {
  okta: {
    name: 'Okta',
    documentation: 'https://developer.okta.com/docs/reference/api/oidc/',
  },
  azure: {
    name: 'Microsoft Entra ID',
    documentation: 'https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow',
  },
  auth0: {
    name: 'Auth0',
    documentation: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow',
  },
  cognito: {
    name: 'AWS Cognito',
    documentation: 'https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html',
  },
};
