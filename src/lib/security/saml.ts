import { createHash, randomBytes, createHmac } from 'crypto';

export interface SAMLRequest {
  id: string;
  issueInstant: string;
  destination: string;
  assertionConsumerServiceUrl: string;
  issuer: string;
  nameIdPolicy?: string;
}

export interface SAMLAssertion {
  id: string;
  issueInstant: string;
  issuer: string;
  status: SAMLStatus;
  subject: SAMLSubject;
  conditions?: SAMLConditions;
  attributes: Record<string, string[]>;
  signature?: string;
}

export interface SAMLStatus {
  code: string;
  message?: string;
}

export interface SAMLSubject {
  nameId: string;
  format?: string;
  confirmationMethod?: string;
  confirmationData?: string;
}

export interface SAMLConditions {
  notBefore?: string;
  notOnOrAfter?: string;
  audience?: string;
}

export interface SAMLConfig {
  privateKey: string;
  certificate: string;
  issuer: string;
  acsUrl: string;
  slsUrl?: string;
  attributeMapping: {
    email: string;
    firstName?: string;
    lastName?: string;
    groups?: string;
  };
}

export function generateSAMLRequestId(): string {
  return `_${randomBytes(16).toString('hex')}`;
}

export function generateSAMLRequest(config: SAMLConfig): SAMLRequest {
  const id = generateSAMLRequestId();
  return {
    id,
    issueInstant: new Date().toISOString(),
    destination: config.acsUrl,
    assertionConsumerServiceUrl: config.acsUrl,
    issuer: config.issuer,
    nameIdPolicy: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  };
}

export function encodeSAMLRequest(request: SAMLRequest): string {
  const xml = buildSAMLRequestXML(request);
  return base64Encode(deflateSync(xml));
}

export function decodeSAMLResponse(response: string): { assertion: SAMLAssertion; isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const decoded = inflateSync(base64Decode(response));
    const assertion = parseSAMLAssertion(decoded);
    
    const isValid = validateAssertion(assertion, errors);
    
    return { assertion, isValid, errors };
  } catch (error) {
    errors.push(`Failed to decode SAML response: ${error}`);
    return { 
      assertion: null as unknown as SAMLAssertion, 
      isValid: false, 
      errors 
    };
  }
}

function buildSAMLRequestXML(request: SAMLRequest): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest 
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="${request.id}"
  Version="2.0"
  IssueInstant="${request.issueInstant}"
  Destination="${request.destination}"
  AssertionConsumerServiceURL="${request.assertionConsumerServiceUrl}"
  ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
  <saml:Issuer>${request.issuer}</saml:Issuer>
  <samlp:NameIDPolicy 
    Format="${request.nameIdPolicy}"
    AllowCreate="true"/>
</samlp:AuthnRequest>`;
}

function parseSAMLAssertion(xml: string): SAMLAssertion {
  const getElementContent = (name: string): string | undefined => {
    const regex = new RegExp(`<[^>]*:${name}[^>]*>([^<]*)</[^>]*:${name}>|<[^>]*:${name}[^>]*\\/>`, 'i');
    const match = xml.match(regex);
    return match ? match[1]?.trim() : undefined;
  };

  const getAttributeValue = (name: string): string | undefined => {
    const regex = new RegExp(`<[^>]*Attribute\\s+Name="${name}"[^>]*>\\s*<[^>]*AttributeValue[^>]*>([^<]*)</[^>]*AttributeValue>`, 'i');
    const match = xml.match(regex);
    return match ? match[1]?.trim() : undefined;
  };

  const getStatusCode = (): string => {
    const regex = /<[^>]*StatusCode[^>]*Value="([^"]*)"/i;
    const match = xml.match(regex);
    return match ? match[1] : 'urn:oasis:names:tc:SAML:2.0:status:Success';
  };

  const getStatusMessage = (): string | undefined => {
    const regex = /<[^>]*StatusMessage[^>]*>([^<]*)<\/[^>]*StatusMessage>/i;
    const match = xml.match(regex);
    return match && match[1] ? match[1].trim() : undefined;
  };

  const getConditions = (): SAMLConditions | undefined => {
    const notBefore = getElementContent('NotBefore');
    const notOnOrAfter = getElementContent('NotOnOrAfter');
    const audience = getElementContent('Audience');

    if (notBefore || notOnOrAfter || audience) {
      return { notBefore, notOnOrAfter, audience };
    }
    return undefined;
  };

  const statusCode = getStatusCode();
  
  return {
    id: getElementContent('ID') || generateSAMLRequestId(),
    issueInstant: getElementContent('IssueInstant') || new Date().toISOString(),
    issuer: getElementContent('Issuer') || '',
    status: {
      code: statusCode,
      message: getStatusMessage(),
    },
    subject: {
      nameId: getElementContent('NameID') || '',
      format: getElementContent('Format'),
    },
    conditions: getConditions(),
    attributes: {
      email: [getAttributeValue('email') || ''].filter((v): v is string => Boolean(v)),
      firstName: [getAttributeValue('firstName') || ''].filter((v): v is string => Boolean(v)),
      lastName: [getAttributeValue('lastName') || ''].filter((v): v is string => Boolean(v)),
      groups: [getAttributeValue('groups') || ''].filter((v): v is string => Boolean(v)),
    },
  };
}

function validateAssertion(assertion: SAMLAssertion, errors: string[]): boolean {
  if (!assertion) {
    errors.push('Invalid SAML assertion');
    return false;
  }

  if (assertion.status.code !== 'urn:oasis:names:tc:SAML:2.0:status:Success') {
    errors.push(`SAML authentication failed: ${assertion.status.message || assertion.status.code}`);
    return false;
  }

  if (!assertion.subject.nameId) {
    errors.push('Missing subject NameID');
    return false;
  }

  if (assertion.conditions) {
    const now = new Date();
    
    if (assertion.conditions.notBefore) {
      const notBefore = new Date(assertion.conditions.notBefore);
      if (now < notBefore) {
        errors.push('Assertion not yet valid');
        return false;
      }
    }
    
    if (assertion.conditions.notOnOrAfter) {
      const notOnOrAfter = new Date(assertion.conditions.notOnOrAfter);
      if (now >= notOnOrAfter) {
        errors.push('Assertion has expired');
        return false;
      }
    }
  }

  return errors.length === 0;
}

function base64Encode(data: string): string {
  return Buffer.from(data).toString('base64');
}

function base64Decode(data: string): string {
  return Buffer.from(data, 'base64').toString('utf8');
}

function deflateSync(data: string): string {
  const zlib = require('zlib');
  return zlib.deflateSync(data).toString('base64');
}

function inflateSync(data: string): string {
  const zlib = require('zlib');
  return zlib.inflateSync(Buffer.from(data, 'base64')).toString('utf8');
}

export function createSAMLResponse(
  config: SAMLConfig,
  requestId: string,
  userAttributes: Record<string, string>
): string {
  const assertionId = generateSAMLRequestId();
  const issueInstant = new Date().toISOString();
  const notOnOrAfter = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  
  const subjectConfirmationData = `<saml:SubjectConfirmationData NotOnOrAfter="${notOnOrAfter}" Recipient="${config.acsUrl}"/>`;
  
  const attributeStatement = Object.entries({
    email: userAttributes.email,
    firstName: userAttributes.firstName,
    lastName: userAttributes.lastName,
    groups: userAttributes.groups,
  })
    .filter(([, value]) => value)
    .map(([name, value]) => `
    <saml:Attribute Name="${name}">
      <saml:AttributeValue>${value}</saml:AttributeValue>
    </saml:Attribute>`)
    .join('');

  const assertionXml = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" 
                 xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" 
                 ID="${generateSAMLRequestId()}" 
                 Version="2.0" 
                 IssueInstant="${issueInstant}" 
                 Destination="${config.acsUrl}" 
                 InResponseTo="${requestId}">
  <saml:Issuer>${config.issuer}</saml:Issuer>
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
  <saml:Assertion ID="${assertionId}" Version="2.0" IssueInstant="${issueInstant}">
    <saml:Issuer>${config.issuer}</saml:Issuer>
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">${userAttributes.email}</saml:NameID>
      <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
        ${subjectConfirmationData}
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="${issueInstant}" NotOnOrAfter="${notOnOrAfter}">
      <saml:AudienceRestriction>
        <saml:Audience>${config.issuer}</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
    <saml:AuthnStatement AuthnInstant="${issueInstant}">
      <saml:AuthnContext>
        <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</saml:AuthnContextClassRef>
      </saml:AuthnContext>
    </saml:AuthnStatement>
    <saml:AttributeStatement>
      ${attributeStatement}
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>`;

  return Buffer.from(assertionXml).toString('base64');
}
