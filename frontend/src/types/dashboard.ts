export interface DashboardMetrics {
  organizational: {
    totalMembers: number;
    totalRevenue: number;
    totalMedicalCost: number;
    mlr: number;
    pmpm: number;
    revenueChangePercent?: number;
    costChangePercent?: number;
    pmpmChangePercent?: number;
    mlrTarget?: number;
    mlrAboveTarget?: number;
  };
  opportunity: {
    totalIdentified: number;
    addressable: number;
    realizable: number;
    realized: number;
    affectedMembers?: number;
  };
  costUtilization: {
    edVisitsPer1000: number;
    admissionsPer1000: number;
    readmissionRate: number;
    avgLengthOfStay: number;
    inpatientAdmissionRate: number;
    erUtilization: number;
    outpatientUtilization: number;
    pharmacyCostTrend: number;
  };
  trend: {
    rolling12MonthMlr: number[];
    rolling12MonthPmpm: number[];
    predictiveForecast: { mlrNextQuarter: number; pmpmNextQuarter: number };
  };
  costDistribution?: { name: string; value: number; color: string }[];
}

export interface FilterOptions {
  lob: string[];
  timePeriod: string[];
  geography: string[];
  segment: string[];
}

export const PROMPT_CATEGORIES = {
  financial: 'Financial & Revenue',
  opportunity: 'Opportunity Discovery',
  provider: 'Provider & Population',
  executive: 'Executive Summary',
} as const;

export interface PromptItem {
  id: string;
  category: keyof typeof PROMPT_CATEGORIES;
  label: string;
  promptText: string;
}

export const PROMPTS: PromptItem[] = [
  { id: 'p1', category: 'financial', label: 'Show monthly revenue and cost trends', promptText: 'Show monthly revenue and cost trends' },
  { id: 'p2', category: 'financial', label: 'Rank LOBs based on revenue and cost performance', promptText: 'Rank LOBs based on revenue and cost performance' },
  { id: 'p3', category: 'financial', label: 'Simulate a no-intervention financial scenario', promptText: 'Simulate a no-intervention financial scenario' },
  { id: 'p4', category: 'financial', label: 'Analyze quality performance trend', promptText: 'Analyze quality performance trend' },
  { id: 'p5', category: 'financial', label: 'Evaluate all quality measures and gaps', promptText: 'Evaluate all quality measures and gaps' },
  { id: 'p6', category: 'opportunity', label: 'Show different opportunities to improve margin', promptText: 'Show different opportunities to improve margin' },
  { id: 'p7', category: 'opportunity', label: 'Analyze MLR change by population segment', promptText: 'Analyze MLR change by population segment' },
  { id: 'p8', category: 'opportunity', label: 'Identify top 5 margin recovery opportunities', promptText: 'Identify top 5 margin recovery opportunities' },
  { id: 'p9', category: 'opportunity', label: 'Review the current opportunity pipeline', promptText: 'Review the current opportunity pipeline' },
  { id: 'p10', category: 'opportunity', label: 'Identify opportunities with remaining execution gaps', promptText: 'Identify opportunities with remaining execution gaps' },
  { id: 'p11', category: 'provider', label: 'Analyze provider performance', promptText: 'Analyze provider performance' },
  { id: 'p12', category: 'provider', label: 'Evaluate provider readiness for value-based care', promptText: 'Evaluate provider readiness for value-based care' },
  { id: 'p13', category: 'provider', label: 'Identify high-cost population segments', promptText: 'Identify high-cost population segments' },
  { id: 'p14', category: 'provider', label: 'Analyze execution metrics (timelines, impact)', promptText: 'Analyze execution metrics (timelines, impact)' },
  { id: 'p15', category: 'executive', label: 'Summarize margin improvement story for board presentation', promptText: 'Summarize margin improvement story for board presentation' },
];
