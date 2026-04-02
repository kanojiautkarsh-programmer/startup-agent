export interface DataRetentionPolicy {
  id: string;
  name: string;
  dataType: string;
  retentionDays: number;
  deletionMethod: 'immediate' | 'grace_period' | 'anonymized';
  gracePeriodDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  id: string;
  reportType: 'soc2' | 'hipaa' | 'gdpr' | 'custom';
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  controls: ComplianceControl[];
}

export interface ComplianceControl {
  id: string;
  controlId: string;
  category: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'in_progress';
  lastAssessed: string;
  evidence?: string;
  notes?: string;
}

export const SOC2_CONTROLS = {
  CC1: {
    name: 'Control Environment',
    controls: [
      { id: 'CC1.1', description: 'Entity demonstrates commitment to integrity and ethical values' },
      { id: 'CC1.2', description: 'Board of Directors demonstrates independence from management' },
      { id: 'CC1.3', description: 'Management establishes structures, reporting lines, and appropriate authorities' },
    ],
  },
  CC2: {
    name: 'Communication and Information',
    controls: [
      { id: 'CC2.1', description: 'Entity obtains or generates and uses relevant quality information' },
      { id: 'CC2.2', description: 'Entity internally communicates information including objectives and responsibilities' },
      { id: 'CC2.3', description: 'Entity communicates with external parties regarding matters affecting functioning' },
    ],
  },
  CC3: {
    name: 'Risk Assessment',
    controls: [
      { id: 'CC3.1', description: 'Entity specifies objectives with sufficient clarity' },
      { id: 'CC3.2', description: 'Entity identifies and analyzes risk to objectives' },
      { id: 'CC3.3', description: 'Entity assesses fraud risk' },
      { id: 'CC3.4', description: 'Entity identifies and analyzes risk that may result from new ventures' },
    ],
  },
  CC4: {
    name: 'Monitoring Activities',
    controls: [
      { id: 'CC4.1', description: 'Entity selects and develops ongoing evaluations' },
      { id: 'CC4.2', description: 'Entity deploys evaluations or uses others developed by others' },
    ],
  },
  CC5: {
    name: 'Control Activities',
    controls: [
      { id: 'CC5.1', description: 'Entity selects and develops control activities' },
      { id: 'CC5.2', description: 'Entity selects and develops general controls over technology' },
      { id: 'CC5.3', description: 'Entity deploys control activities through policies and procedures' },
    ],
  },
  CC6: {
    name: 'Logical and Physical Access Controls',
    controls: [
      { id: 'CC6.1', description: 'Entity implements logical access security software' },
      { id: 'CC6.2', description: 'Prior to issuing system credentials, registers authorized users' },
      { id: 'CC6.3', description: 'Entity removes access to assets when appropriate' },
      { id: 'CC6.4', description: 'Entity implements controls to prevent or detect unauthorized software' },
      { id: 'CC6.5', description: 'Entity implements controls to restrict access to sensitive data' },
      { id: 'CC6.6', description: 'Entity implements encryption and key management' },
    ],
  },
  CC7: {
    name: 'System Operations',
    controls: [
      { id: 'CC7.1', description: 'Entity manages day-to-day vulnerabilities' },
      { id: 'CC7.2', description: 'Entity monitors system components for anomalies' },
      { id: 'CC7.3', description: 'Entity implements incident response procedures' },
    ],
  },
  CC8: {
    name: 'Change Management',
    controls: [
      { id: 'CC8.1', description: 'Entity authorizes, designs, develops, configures, tests, approves, and implements changes' },
    ],
  },
  CC9: {
    name: 'Risk Mitigation',
    controls: [
      { id: 'CC9.1', description: 'Entity identifies, selects, and develops risk mitigation activities' },
      { id: 'CC9.2', description: 'Entity monitors vendor relationships and contractual requirements' },
    ],
  },
};

export const DEFAULT_RETENTION_POLICIES: Omit<DataRetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'User Messages', dataType: 'messages', retentionDays: 365, deletionMethod: 'immediate' },
  { name: 'Conversation History', dataType: 'conversations', retentionDays: 730, deletionMethod: 'anonymized' },
  { name: 'Extracted Memories', dataType: 'memories', retentionDays: 1095, deletionMethod: 'immediate' },
  { name: 'Audit Logs', dataType: 'audit_logs', retentionDays: 2555, deletionMethod: 'anonymized' },
  { name: 'Session Records', dataType: 'sessions', retentionDays: 90, deletionMethod: 'immediate' },
  { name: 'API Access Logs', dataType: 'api_logs', retentionDays: 365, deletionMethod: 'immediate' },
];
