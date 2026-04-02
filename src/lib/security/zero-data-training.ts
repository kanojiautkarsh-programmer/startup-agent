export interface ZeroDataTrainingPolicy {
  id: string;
  userId: string;
  optIn: boolean;
  optInDate?: string;
  optOutDate?: string;
  consentVersion: string;
  dataUsageRestrictions: DataUsageRestriction[];
  allowedProcessing: AllowedProcessing[];
  excludedPurposes: ExcludedPurpose[];
}

export interface DataUsageRestriction {
  id: string;
  restrictionType: 'no_training' | 'no_sharing' | 'no_retention' | 'processing_limited';
  description: string;
  scope: 'all_data' | 'user_content' | 'conversations' | 'ai_interactions';
  enforcement: 'contractual' | 'technical' | 'organizational';
}

export interface AllowedProcessing {
  id: string;
  purpose: string;
  description: string;
  safeguards: string[];
}

export interface ExcludedPurpose {
  id: string;
  purpose: string;
  rationale: string;
}

export const ZERO_TRAINING_PRINCIPLES = {
  noTraining: {
    id: 'ZDT-001',
    title: 'No AI Training',
    description: 'User data will never be used to train, fine-tune, or improve AI models.',
    binding: true,
  },
  noSharing: {
    id: 'ZDT-002',
    title: 'No Data Sharing',
    description: 'User data will not be shared with third parties for any purpose including AI development.',
    binding: true,
  },
  noRetentionForTraining: {
    id: 'ZDT-003',
    title: 'Training Exclusion',
    description: 'Data processing for service delivery is strictly separated from any hypothetical future training use.',
    binding: true,
  },
  vendorGuarantees: {
    id: 'ZDT-004',
    title: 'Vendor Guarantees',
    description: 'All AI providers are contractually bound to exclude customer data from training.',
    binding: true,
  },
};

export const CONSENT_VERSION = '1.0.0';

export const EXCLUDED_PURPOSES: ExcludedPurpose[] = [
  {
    id: 'EP-001',
    purpose: 'AI Model Training',
    rationale: 'Protecting user privacy and intellectual property',
  },
  {
    id: 'EP-002',
    purpose: 'Model Improvement',
    rationale: 'Ensuring user interactions remain private',
  },
  {
    id: 'EP-003',
    purpose: 'Research and Development',
    rationale: 'User data should not be used without explicit consent',
  },
  {
    id: 'EP-004',
    purpose: 'Benchmarking',
    rationale: 'Preventing competitive use of user data',
  },
  {
    id: 'EP-005',
    purpose: 'Third-party Distribution',
    rationale: 'Maintaining data sovereignty',
  },
];

export function generateDataProcessingAgreement(): string {
  return `
DATA PROCESSING AGREEMENT - ZERO DATA TRAINING COMMITMENT

This Data Processing Agreement ("DPA") establishes the binding commitment to Zero Data Training.

1. DEFINITIONS
   - "User Data" means all data provided by users through the Service
   - "Processing" means any operation performed on User Data
   - "AI Training" means using data to train, fine-tune, or improve AI models

2. ZERO TRAINING COMMITMENT
   The Service Provider commits that:
   a) User Data will NOT be used for AI Training under any circumstances
   b) User Data will NOT be shared with third parties for AI purposes
   c) Technical measures ensure training data cannot be extracted
   d) Vendor contracts include binding no-training clauses

3. SCOPE OF PERMITTED PROCESSING
   User Data may be processed exclusively for:
   - Delivering requested service features
   - Improving user experience within the Service
   - Ensuring security and compliance
   - Legal and regulatory obligations

4. SAFEGUARDS
   - End-to-end encryption of sensitive data
   - Data minimization principles
   - Regular security audits
   - Access controls and monitoring

5. USER RIGHTS
   - Right to access their data
   - Right to deletion ("right to be forgotten")
   - Right to data portability
   - Right to audit our practices

6. COMPLIANCE
   This commitment is verified through:
   - Annual third-party security audits
   - SOC 2 Type II certification
   - Technical compliance reviews
   - Customer right-to-audit provisions

7. DURATION
   This commitment remains in effect for the duration of service plus any legally required retention period.

Version: ${CONSENT_VERSION}
Last Updated: ${new Date().toISOString()}
  `.trim();
}
