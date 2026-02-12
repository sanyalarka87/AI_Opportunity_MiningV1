/**
 * In-memory opportunity store. Aligns with SSD Section 5.1 Opportunity entity.
 * Status: identified | under_review | approved | declined | in_execution
 */
const opportunities = [
  {
    id: 'opp-1',
    title: 'Reduce avoidable inpatient admissions',
    description: 'Target preventable and avoidable inpatient admissions through care management and chronic disease programs to reduce unnecessary hospitalizations.',
    confidenceScore: 0.88,
    estimatedSavings: 2100000,
    implementationComplexity: 'high',
    status: 'under_review',
    tags: ['inpatient', 'admissions', 'care-management'],
    lob: ['Medicare Advantage', 'Medicaid'],
    version: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
    createdBy: 'system',
    segmentId: 'seg-001',
    rationale: 'Claims data shows 18% of inpatient admissions are potentially avoidable (ACSC). Focus on CHF, COPD, and diabetes could reduce admissions by 8% in target segments.',
    supportingAnalytics: { avoidableAdmissions: 12500, avgCostPerAdmission: 16800 },
    explainability: {
      populationSegment: [
        'Members with congestive heart failure',
        'Discharged from hospital in last 90 days',
        '>1 ED visits in last 6 months',
      ],
      scale: [
        { label: 'Members affected', value: '4,000' },
        { label: '30 day readmission rate', value: '17%' },
        { label: 'Benchmark', value: '11%' },
      ],
      financialImpact: [
        { label: 'Avg cost per readmission', value: '$15,000' },
        { label: 'Excess readmissions', value: '240' },
        { label: 'Identified opportunity (theoretical maximum)', value: '$3.6 M' },
        { label: 'Addressable opportunity (75% of excess readmissions addressable)', value: '$2.7 M' },
        { label: 'Realizable opportunity (50% effectiveness in capturing addressable)', value: '$1.35 M' },
        { label: 'PMPM impact', value: null },
        { label: 'MLR improvement', value: null },
      ],
      rootCauseKeyDrivers: ['Missed follow up', 'Medication confusion'],
      nextBestAction: 'Mandatory PCP follow up within 7 days',
    },
  },
  {
    id: 'opp-2',
    title: 'Eliminate duplicate services',
    description: 'Identify and eliminate duplicate diagnostic and therapeutic services (e.g., repeat imaging, redundant labs) through clinical integration and prior-auth visibility.',
    confidenceScore: 0.85,
    estimatedSavings: 1590000,
    implementationComplexity: 'medium',
    status: 'approved',
    tags: ['duplicate', 'utilization', 'imaging'],
    lob: ['Medicare Advantage', 'Medicaid', 'Commercial'],
    version: 1,
    createdAt: '2024-01-09T09:00:00Z',
    updatedAt: '2024-01-14T11:00:00Z',
    createdBy: 'system',
    segmentId: 'seg-005',
    rationale: 'Duplicate service rate estimated at 4.2% of professional and outpatient spend. Cross-setting visibility and alerts could reduce redundant CT/MRI and labs by 25%.',
    supportingAnalytics: { duplicateVolume: 32000, avgCostPerService: 50 },
    explainability: {
      populationSegment: [
        'Members with multiple providers or care settings',
        'At least one CT/MRI or advanced imaging in last 12 months',
        'Duplicate or overlapping claims in last 6 months',
      ],
      scale: [
        { label: 'Members affected', value: '32,000' },
        { label: 'Duplicate service rate', value: '4.2%' },
        { label: 'Benchmark (target)', value: '2%' },
      ],
      financialImpact: [
        { label: 'Avg cost per duplicate service', value: '$50' },
        { label: 'Duplicate service volume', value: '~48,000' },
        { label: 'Identified opportunity (theoretical maximum)', value: '$2.4 M' },
        { label: 'Addressable opportunity (80% of duplicates addressable)', value: '$1.92 M' },
        { label: 'Realizable opportunity (83% effectiveness)', value: '$1.59 M' },
        { label: 'PMPM impact', value: null },
        { label: 'MLR improvement', value: null },
      ],
      rootCauseKeyDrivers: ['Fragmented care across settings', 'Lack of prior-auth visibility', 'No shared imaging repository'],
      nextBestAction: 'Deploy cross-setting visibility and prior-auth alerts; promote shared imaging where available',
    },
  },
  {
    id: 'opp-3',
    title: 'Reduce low value care',
    description: 'De-implement low-value services (e.g., unnecessary imaging for uncomplicated low back pain, routine pre-op testing) using evidence-based guidelines and provider education.',
    confidenceScore: 0.82,
    estimatedSavings: 1100000,
    implementationComplexity: 'medium',
    status: 'in_execution',
    tags: ['low-value', 'utilization', 'guidelines'],
    lob: ['Commercial'],
    version: 1,
    createdAt: '2024-01-08T08:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
    createdBy: 'system',
    segmentId: 'seg-001',
    rationale: 'Choosing Wisely and internal data identify ~$11M in low-value spend. Focus on top 5 measures (imaging, pre-op, antibiotics) with prior-auth and decision support.',
    supportingAnalytics: { lowValueSpend: 11000000, targetMeasures: 5 },
    explainability: {
      populationSegment: [
        'Members with uncomplicated low back pain (no red flags)',
        'Members scheduled for low-risk procedures (routine pre-op testing)',
        'Members with upper respiratory symptoms (antibiotic stewardship)',
      ],
      scale: [
        { label: 'Members affected', value: '~85,000' },
        { label: 'Low-value spend (top 5 measures)', value: '$11 M' },
        { label: 'Target measures', value: '5 (Choosing Wisely aligned)' },
      ],
      financialImpact: [
        { label: 'Low-value spend (identified)', value: '$11 M' },
        { label: 'Identified opportunity (theoretical maximum)', value: '$2.2 M' },
        { label: 'Addressable opportunity (70% addressable)', value: '$1.54 M' },
        { label: 'Realizable opportunity (71% effectiveness)', value: '$1.1 M' },
        { label: 'PMPM impact', value: null },
        { label: 'MLR improvement', value: null },
      ],
      rootCauseKeyDrivers: ['Routine ordering without guidelines', 'Defensive medicine', 'Lack of decision support at point of care'],
      nextBestAction: 'Embed Choosing Wisely guidelines in prior-auth and EMR; provider education on top 5 measures',
    },
  },
  {
    id: 'opp-4',
    title: 'Redirect avoidable ED visits',
    description: 'Expand nurse triage, urgent care steerage, and same-day primary care to redirect non-emergent ED visits and reduce avoidable ED utilization.',
    confidenceScore: 0.79,
    estimatedSavings: 1500000,
    implementationComplexity: 'high',
    status: 'under_review',
    tags: ['ed', 'utilization', 'triage'],
    lob: ['Medicare Advantage', 'Commercial'],
    version: 1,
    createdAt: '2024-01-07T11:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    createdBy: 'analyst',
    segmentId: 'seg-002',
    rationale: 'ED visit rate is 0.42 per member; 22% are non-emergent. Pilot in one region showed 8% reduction with nurse triage and urgent care partnerships.',
    supportingAnalytics: { erVisits: 525000, nonEmergentPct: 22 },
    explainability: {
      populationSegment: [
        'Members with at least one ED visit in last 6 months',
        'Non-emergent triage (CTAS 4/5 or equivalent)',
        'No inpatient admission from ED',
      ],
      scale: [
        { label: 'Members affected', value: '~115,000' },
        { label: 'Non-emergent ED share', value: '22%' },
        { label: 'Benchmark (target redirect rate)', value: '15%' },
      ],
      financialImpact: [
        { label: 'Avg cost per avoidable ED visit', value: '$580' },
        { label: 'Non-emergent ED visits', value: '~525,000' },
        { label: 'Identified opportunity (theoretical maximum)', value: '$2.5 M' },
        { label: 'Addressable opportunity (70% redirectable)', value: '$1.75 M' },
        { label: 'Realizable opportunity (86% effectiveness)', value: '$1.5 M' },
        { label: 'PMPM impact', value: null },
        { label: 'MLR improvement', value: null },
      ],
      rootCauseKeyDrivers: ['Lack of same-day PCP access', 'After-hours care gaps', 'Member preference for ED'],
      nextBestAction: 'Nurse triage line and urgent care steerage; expand same-day primary care slots',
    },
  },
  {
    id: 'opp-5',
    title: 'Care gap closure - HEDIS',
    description: 'Target members with open HEDIS care gaps for outreach and closing gaps to improve quality revenue and avoid penalties.',
    confidenceScore: 0.82,
    estimatedSavings: 1800000,
    implementationComplexity: 'medium',
    status: 'identified',
    tags: ['quality', 'hedis', 'care-gaps'],
    lob: ['Medicare Advantage', 'Medicaid'],
    version: 1,
    createdAt: '2024-01-06T09:00:00Z',
    updatedAt: '2024-01-08T09:00:00Z',
    createdBy: 'system',
    segmentId: 'seg-002',
    rationale: 'Current gap list of 28k members with 3+ gaps. Closing 15% of gaps in top measures could yield ~$1.8M in quality incentives and avoid penalties.',
    supportingAnalytics: { gapCount: 28000, incentivePerGap: 65 },
    explainability: {
      populationSegment: [
        'Members with 3+ open HEDIS care gaps',
        'Medicare Advantage or Medicaid',
        'Gaps in top measures (e.g., diabetes eye exam, colorectal screening, HbA1c)',
      ],
      scale: [
        { label: 'Members affected', value: '28,000' },
        { label: 'Avg open gaps per member', value: '3+' },
        { label: 'Target closure rate', value: '15%' },
      ],
      financialImpact: [
        { label: 'Incentive per gap closed (approx)', value: '$65' },
        { label: 'Gap count (total)', value: '28,000' },
        { label: 'Identified opportunity (theoretical maximum)', value: '$2.2 M' },
        { label: 'Addressable opportunity (82% addressable)', value: '$1.8 M' },
        { label: 'Realizable opportunity (100% capture of addressable)', value: '$1.8 M' },
        { label: 'PMPM impact', value: null },
        { label: 'MLR improvement', value: null },
      ],
      rootCauseKeyDrivers: ['No outreach or reminder system', 'Access barriers', 'Coding and documentation gaps'],
      nextBestAction: 'Targeted outreach and reminders; partner with PCPs and specialists for gap closure',
    },
  },
  {
    id: 'opp-6',
    title: 'Prior authorization approval',
    description: 'Streamline and automate prior authorization for high-volume, low-variance procedures to reduce admin cost, speed approvals, and improve member and provider experience.',
    confidenceScore: 0.88,
    estimatedSavings: 2100000,
    implementationComplexity: 'medium',
    status: 'under_review',
    tags: ['prior-auth', 'automation', 'cost'],
    lob: ['Medicare Advantage', 'Medicaid', 'Commercial'],
    version: 1,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
    createdBy: 'system',
    segmentId: 'seg-003',
    rationale: 'Claims data shows 12% of prior auth requests fall into repeatable patterns. Automating these could reduce manual review by 40% and improve turnaround by 2 days.',
    supportingAnalytics: { affectedVolume: 45000, avgCostPerAuth: 47 },
    explainability: {
      populationSegment: [
        'High-volume, low-variance procedures (e.g., imaging, DME, select drugs)',
        'Prior auth requests with repeatable clinical criteria',
        'All LOBs (Medicare Advantage, Medicaid, Commercial)',
      ],
      scale: [
        { label: 'Prior auth volume affected', value: '45,000' },
        { label: 'Share in repeatable patterns', value: '12%' },
        { label: 'Target automation rate', value: '40%' },
      ],
      financialImpact: [
        { label: 'Avg admin cost per prior auth', value: '$47' },
        { label: 'Volume (addressable)', value: '45,000' },
        { label: 'Identified opportunity (theoretical maximum)', value: '$2.1 M' },
        { label: 'Addressable opportunity (100% of automatable)', value: '$2.1 M' },
        { label: 'Realizable opportunity (100% effectiveness)', value: '$2.1 M' },
        { label: 'PMPM impact', value: null },
        { label: 'MLR improvement', value: null },
      ],
      rootCauseKeyDrivers: ['Manual review for rule-based requests', 'Slow turnaround', 'Provider and member abrasion'],
      nextBestAction: 'Automate prior auth for high-volume, rule-based procedures; keep complex cases in clinical review',
    },
  },
];

const versionHistory = {}; // id -> [{ version, snapshot, timestamp }]
const collaborationNotes = {}; // id -> [{ id, author, text, createdAt }]

function nextId() {
  const max = opportunities.reduce((m, o) => {
    const n = parseInt(o.id.replace(/\D/g, ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `opp-${max + 1}`;
}

export function listOpportunities(query = {}) {
  let list = [...opportunities];
  if (query.status) list = list.filter((o) => o.status === query.status);
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.title.toLowerCase().includes(s) ||
        (o.description && o.description.toLowerCase().includes(s)) ||
        (o.tags && o.tags.some((t) => t.toLowerCase().includes(s)))
    );
  }
  if (query.tags) {
    const tags = Array.isArray(query.tags) ? query.tags : [query.tags];
    list = list.filter((o) => o.tags && tags.some((t) => o.tags.includes(t)));
  }
  if (query.segmentId) {
    list = list.filter((o) => o.segmentId === query.segmentId);
  }
  return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getOpportunityById(id) {
  return opportunities.find((o) => o.id === id) || null;
}

export function createOpportunity(body) {
  const now = new Date().toISOString();
  const opp = {
    id: nextId(),
    title: body.title || 'Untitled opportunity',
    description: body.description || '',
    confidenceScore: body.confidenceScore ?? 0.7,
    estimatedSavings: body.estimatedSavings ?? 0,
    implementationComplexity: body.implementationComplexity || 'medium',
    status: 'identified',
    tags: body.tags || [],
    lob: body.lob || [],
    version: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: body.createdBy || 'user',
    segmentId: body.segmentId ?? null,
    rationale: body.rationale || '',
    supportingAnalytics: body.supportingAnalytics || {},
  };
  opportunities.push(opp);
  return opp;
}

export function updateOpportunity(id, body) {
  const idx = opportunities.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const prev = opportunities[idx];
  const versionHistoryEntry = { version: prev.version, snapshot: { ...prev }, timestamp: prev.updatedAt };
  if (!versionHistory[id]) versionHistory[id] = [];
  versionHistory[id].push(versionHistoryEntry);

  const updated = {
    ...prev,
    ...body,
    id: prev.id,
    version: prev.version + 1,
    updatedAt: new Date().toISOString(),
  };
  opportunities[idx] = updated;
  return updated;
}

export function setOpportunityStatus(id, status, userId) {
  const idx = opportunities.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const valid = ['identified', 'under_review', 'approved', 'declined', 'in_execution'];
  if (!valid.includes(status)) return null;
  const prev = opportunities[idx];
  const updated = { ...prev, status, updatedAt: new Date().toISOString() };
  opportunities[idx] = updated;
  return { opportunity: updated, previousStatus: prev.status };
}

export function getVersionHistory(id) {
  return versionHistory[id] || [];
}

export function getCollaborationNotes(id) {
  return collaborationNotes[id] || [];
}

export function addCollaborationNote(id, author, text) {
  const notes = collaborationNotes[id] || [];
  const note = {
    id: `note-${Date.now()}`,
    author,
    text,
    createdAt: new Date().toISOString(),
  };
  notes.push(note);
  collaborationNotes[id] = notes;
  return note;
}

export function trimCollaborationNotes(id, keep) {
  const notes = collaborationNotes[id] || [];
  collaborationNotes[id] = notes.slice(0, Math.max(0, keep));
  return collaborationNotes[id];
}
