export interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export const PRIVACY_POLICY_SECTIONS: PrivacyPolicySection[] = [
  {
    id: 'data-collection',
    title: 'Data Collection',
    content: 'We collect only the data necessary to provide our services. This includes account information, conversation content, and usage analytics.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'data-usage',
    title: 'Data Usage',
    content: 'Your data is used exclusively to deliver the services you request. We do not use your data for advertising, marketing, or any purpose beyond service delivery.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'data-protection',
    title: 'Data Protection',
    content: 'We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'ai-training',
    title: 'AI Training Prohibition',
    content: 'We have a strict ZERO DATA TRAINING policy. Your conversations and data will NEVER be used to train, fine-tune, or improve AI models.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing',
    content: 'We do not sell, trade, or rent your personal information to third parties. Data may only be shared with your explicit consent or when required by law.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'user-rights',
    title: 'Your Rights',
    content: 'You have the right to access, correct, delete, or export your data at any time. Contact us to exercise any of these rights.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'compliance',
    title: 'Compliance',
    content: 'We comply with SOC 2 Type II requirements, GDPR, CCPA, and other applicable privacy regulations.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: 'For privacy-related questions or to report concerns, contact our Data Protection Officer at privacy@example.com.',
    lastUpdated: '2024-01-15',
  },
];

export const TERMS_OF_SERVICE_SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: 'By using our services, you agree to be bound by these Terms of Service.',
  },
  {
    id: 'services',
    title: 'Description of Services',
    content: 'We provide AI-powered productivity tools designed to help you manage conversations, memories, and goals.',
  },
  {
    id: 'account',
    title: 'Account Responsibilities',
    content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.',
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: 'You agree to use our services only for lawful purposes and in accordance with these Terms.',
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    content: 'We retain all rights to our technology and services. Your content remains yours.',
  },
  {
    id: 'termination',
    title: 'Termination',
    content: 'We may terminate or suspend your account if you violate these Terms or engage in prohibited activities.',
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    content: 'Our services are provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.',
  },
  {
    id: 'limitation',
    title: 'Limitation of Liability',
    content: 'We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.',
  },
];
