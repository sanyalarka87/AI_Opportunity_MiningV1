const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3005/api';

function headers(): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  const uid = localStorage.getItem('userId') || 'demo-user';
  const role = localStorage.getItem('userRole') || 'executive';
  (h as Record<string, string>)['X-User-Id'] = uid;
  (h as Record<string, string>)['X-User-Role'] = role;
  return h;
}

export async function getDashboardMetrics(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/metrics/dashboard?${q}`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getFilterOptions() {
  const res = await fetch(`${API_BASE}/metrics/filters`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function executePrompt(payload: { promptId?: string; promptText: string; context?: unknown }) {
  const res = await fetch(`${API_BASE}/agent/prompt`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendChatMessage(message: string, sessionId?: string) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message, sessionId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function exportPdf(title: string, html: string) {
  const res = await fetch(`${API_BASE}/export/pdf`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title, html }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function exportPpt(title: string, slides: unknown[]) {
  const res = await fetch(`${API_BASE}/export/ppt`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title, slides }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Opportunities (Phase 2)
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  confidenceScore: number;
  estimatedSavings: number;
  implementationComplexity: string;
  status: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  segmentId: string | null;
  rationale: string;
  supportingAnalytics: Record<string, unknown>;
  /** Line(s) of business: e.g. Medicare Advantage, Medicaid, Commercial */
  lob?: string[];
  /** Natural-language explainability (population segment, scale, financial impact, root cause, next best action) */
  explainability?: {
    populationSegment: string[];
    scale: { label: string; value: string | number }[];
    financialImpact: { label: string; value: string | number | null }[];
    rootCauseKeyDrivers: string[];
    nextBestAction: string;
  };
}

export async function getOpportunities(params?: { status?: string; search?: string; tags?: string; segmentId?: string }) {
  const cleanParams: Record<string, string> = {};
  if (params) {
    if (params.status) cleanParams.status = params.status;
    if (params.search) cleanParams.search = params.search;
    if (params.tags) cleanParams.tags = params.tags;
    if (params.segmentId) cleanParams.segmentId = params.segmentId;
  }
  const q = new URLSearchParams(cleanParams).toString();
  const res = await fetch(`${API_BASE}/opportunities${q ? `?${q}` : ''}`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Opportunity[]>;
}

export async function getOpportunity(id: string) {
  const res = await fetch(`${API_BASE}/opportunities/${id}`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Opportunity>;
}

export async function createOpportunity(body: Partial<Opportunity>) {
  const res = await fetch(`${API_BASE}/opportunities`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Opportunity>;
}

export async function updateOpportunity(id: string, body: Partial<Opportunity>) {
  const res = await fetch(`${API_BASE}/opportunities/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Opportunity>;
}

export async function approveOpportunity(id: string) {
  const res = await fetch(`${API_BASE}/opportunities/${id}/approve`, { method: 'POST', headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Opportunity>;
}

export async function declineOpportunity(id: string) {
  const res = await fetch(`${API_BASE}/opportunities/${id}/decline`, { method: 'POST', headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Opportunity>;
}

export async function getOpportunityHistory(id: string) {
  const res = await fetch(`${API_BASE}/opportunities/${id}/history`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOpportunityNotes(id: string) {
  const res = await fetch(`${API_BASE}/opportunities/${id}/notes`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addOpportunityNote(id: string, text: string) {
  const res = await fetch(`${API_BASE}/opportunities/${id}/notes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function trimOpportunityNotes(id: string, keep: number) {
  const res = await fetch(`${API_BASE}/opportunities/${id}/notes/trim`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ keep }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendChatWithContext(message: string, opportunityId?: string, sessionId?: string) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message, sessionId, opportunityId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function whatIfSimulation(opportunityId?: string, scenario?: string) {
  const res = await fetch(`${API_BASE}/agent/whatif`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ opportunityId, scenario }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function plannerSuggest(message: string) {
  const res = await fetch(`${API_BASE}/agent/planner`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Segments (Phase 3)
export interface Segment {
  id: string;
  name: string;
  memberCount: number;
  pmpm: number;
  totalCost?: number;
  riskScore: number;
  opportunityCount: number;
  potentialSavings: number;
  confidenceScore?: number;
  riskCharacteristics: string[];
  description: string;
  metrics?: {
    admissionRate: number;
    erVisitRate: number;
    genericPrescribingRate: number;
    pcpVisitCompliance: number;
  };
  costDrivers?: Array<{ category: string; amount: number; trend: string }>;
  behavioralPatterns?: string[];
  interventionOpportunities?: Array<{ id: string; name: string; impact: string; savings: string }>;
  explanation?: string;
  detailMetrics?: SegmentDetailMetrics;
}

export interface SegmentDetailMetrics {
  percentOfMembership: number;
  percentOfSpend: number;
  clusterStabilityScore: number;
  medianPmpm: number;
  costVsPlanPercent: number;
  top10CostConcentration: number;
  avoidableUtilizationRate: number;
  readmissionRate30d?: number;
  utilizationVsPlanBenchmark: string;
  edFirstCarePattern: string;
  postDischargeSpike: string;
  repeatUtilizationLikelihood: string;
  highRiskMemberCount: number;
  risingRiskMemberCount: number;
  costGrowthRate3m: number;
  costGrowthRate6m: number;
  costGrowthRate12m: number;
  probHospitalization90d: number;
  pctWithCareGap: number;
  topImpactedQualityMeasures: string[];
  postDischargeFollowUpRate: number;
  medicationAdherenceRate: number;
  qualityRiskLevel: string;
  qualityUpsidePotential: number;
  identifiedOpportunity: number;
  addressableOpportunity: number;
  realizableOpportunity: number;
  opportunityPerMember: number;
  expectedPmpmReduction: number;
  pctMembersAttributed: number;
  top5ProvidersControl: number;
  providerCostVariationIndex: string;
  pctValueBasedCare: number;
  actionFeasibilityScore: number;
  careManagementCapacityRequired: number;
  historicalSuccessRate: number;
  expectedTimeToImpact: number;
  clusterPriorityScore: number;
}

export interface PopulationMetrics {
  totalMembers: number;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
  costDistribution: Array<{ name: string; value: number; color: string }>;
  utilizationPatterns: {
    admissionsPer1000: number;
    erVisitsPer1000: number;
    readmissionRate: number;
    avgLengthOfStay?: number;
    preventableAdmissions?: number;
  };
}

export async function getPopulationMetrics(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/segments/population?${q}`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<PopulationMetrics>;
}

export async function getSegmentsList(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/segments/list?${q}`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Segment[]>;
}

export async function getSegmentDetail(id: string) {
  const res = await fetch(`${API_BASE}/segments/${id}`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Segment>;
}

export async function sendSegmentChatMessage(message: string, segmentId: string, sessionId?: string) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message, sessionId, segmentId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

