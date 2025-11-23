export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface BMCData {
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface GeneratedDocs {
  summaryNote: string;
  bmc: BMCData | null;
  onePagePlan: string;
  financialPlan: string;
  gtmStrategy: string;     // Go-to-Market
  marketingPlan: string;   // 1-Page Marketing Plan
  hrPlan: string;          // HR Plan (includes Org Structure)
  opsPlan: string;         // Operational Plan
  strategicPlan: string;   // Strategic Plan
}

export enum AppStep {
  INTRO = 'INTRO',
  INTERVIEW = 'INTERVIEW',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS'
}