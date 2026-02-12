/**
 * Stub data for Phase 3: AI Segmentation.
 */

// Helper to vary data based on filters (simple hash-based variation)
function applyFilterVariation(base, filters, key) {
  let v = base;
  if (filters.lob) v *= 0.95 + Math.abs(hash(key + (filters.lob || '')) % 100) / 500;
  if (filters.geography) v *= 0.98 + Math.abs(hash(key + (filters.geography || '')) % 100) / 500;
  return Math.round(v * 100) / 100;
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

export function getPopulationMetrics(filters = {}) {
  const totalMembers = Math.round(applyFilterVariation(652847, filters, 'pop_members'));
  
  const riskDistribution = [
    { name: 'Low Risk', value: Math.round(totalMembers * 0.45), color: '#22c55e' },
    { name: 'Medium Risk', value: Math.round(totalMembers * 0.30), color: '#eab308' },
    { name: 'High Risk', value: Math.round(totalMembers * 0.15), color: '#f97316' },
    { name: 'Very High Risk', value: Math.round(totalMembers * 0.10), color: '#ef4444' },
  ];

  /* Align with dashboard cost distribution (stubMetrics costDistribution) */
  const costDistribution = [
    { name: 'Inpatient', value: 38, color: '#0d9488' },
    { name: 'Outpatient', value: 28, color: '#7c3aed' },
    { name: 'Professional', value: 18, color: '#ea580c' },
    { name: 'Pharmacy', value: 12, color: '#eab308' },
    { name: 'Emergency', value: 8, color: '#38bdf8' },
    { name: 'Other', value: 6, color: '#a78bfa' },
  ];

  /* Align with dashboard costUtilization (stubMetrics) */
  const utilizationPatterns = {
    admissionsPer1000: Math.round(applyFilterVariation(78, filters, 'pop_adm')),
    erVisitsPer1000: Math.round(applyFilterVariation(385, filters, 'pop_er')),
    readmissionRate: applyFilterVariation(14.2, filters, 'pop_readm'),
    avgLengthOfStay: applyFilterVariation(4.3, filters, 'pop_alos'),
    preventableAdmissions: applyFilterVariation(4.5, filters, 'pop_prev'),
  };

  return {
    totalMembers,
    riskDistribution,
    costDistribution,
    utilizationPatterns,
  };
}

export function getSegmentsList(filters = {}) {
  // Mock AI-generated segments
  const raw = [
    {
      id: 'seg-001',
      name: 'Uncontrolled Diabetics with Comorbidities',
      memberCount: Math.round(applyFilterVariation(12450, filters, 'seg1_mem')),
      pmpm: applyFilterVariation(1850, filters, 'seg1_pmpm'),
      riskScore: 2.4,
      opportunityCount: 3,
      potentialSavings: applyFilterVariation(4500000, filters, 'seg1_sav'),
      confidenceScore: 0.88,
      riskCharacteristics: ['High HbA1c', 'Hypertension', 'Obesity'],
      description: 'Members with diabetes who have not achieved glycemic control and have at least one other chronic condition.',
    },
    {
      id: 'seg-002',
      name: 'High Utilizers - ER Frequent Flyers',
      memberCount: Math.round(applyFilterVariation(3200, filters, 'seg2_mem')),
      pmpm: applyFilterVariation(2900, filters, 'seg2_pmpm'),
      riskScore: 3.1,
      opportunityCount: 2,
      potentialSavings: applyFilterVariation(2800000, filters, 'seg2_sav'),
      confidenceScore: 0.92,
      riskCharacteristics: ['Multiple ER visits > 3/yr', 'Substance Abuse History'],
      description: 'Members using the ER as their primary source of care for non-emergent conditions.',
    },
    {
      id: 'seg-003',
      name: 'Rising Risk - Pre-CKD',
      memberCount: Math.round(applyFilterVariation(25000, filters, 'seg3_mem')),
      pmpm: applyFilterVariation(850, filters, 'seg3_pmpm'),
      riskScore: 1.2,
      opportunityCount: 1,
      potentialSavings: applyFilterVariation(1200000, filters, 'seg3_sav'),
      confidenceScore: 0.79,
      riskCharacteristics: ['Early signs of renal decline', 'Hypertension'],
      description: 'Members showing early markers of Chronic Kidney Disease who are not yet on dialysis.',
    },
    {
      id: 'seg-004',
      name: 'Maternity - High Risk',
      memberCount: Math.round(applyFilterVariation(1500, filters, 'seg4_mem')),
      pmpm: applyFilterVariation(3200, filters, 'seg4_pmpm'),
      riskScore: 1.8,
      opportunityCount: 2,
      potentialSavings: applyFilterVariation(950000, filters, 'seg4_sav'),
      confidenceScore: 0.85,
      riskCharacteristics: ['Advanced Maternal Age', 'History of Pre-eclampsia'],
      description: 'Expectant mothers with risk factors indicating potential complications.',
    },
    {
      id: 'seg-005',
      name: 'Post-Acute Care Gaps',
      memberCount: Math.round(applyFilterVariation(4500, filters, 'seg5_mem')),
      pmpm: applyFilterVariation(2100, filters, 'seg5_pmpm'),
      riskScore: 2.1,
      opportunityCount: 2,
      potentialSavings: applyFilterVariation(1800000, filters, 'seg5_sav'),
      confidenceScore: 0.91,
      riskCharacteristics: ['Recent Discharge', 'Medication Non-adherence'],
      description: 'Members recently discharged from inpatient care with identified gaps in follow-up.',
    }
  ];
  return raw.map((s) => ({
    ...s,
    totalCost: Math.round(s.memberCount * s.pmpm * 12),
  }));
}

const PLAN_TOTAL_MEMBERS = 652847;
const PLAN_PMPM = 336;
const PLAN_TOTAL_COST = 2.63e9;

export function getSegmentDetail(segmentId) {
  const segments = getSegmentsList();
  const baseSegment = segments.find(s => s.id === segmentId) || segments[0];
  const totalCost = baseSegment.totalCost ?? Math.round(baseSegment.memberCount * baseSegment.pmpm * 12);
  const conf = baseSegment.confidenceScore ?? 0.85;

  return {
    ...baseSegment,
    totalCost,
    metrics: {
      admissionRate: 125,
      erVisitRate: 450,
      genericPrescribingRate: 82,
      pcpVisitCompliance: 65,
    },
    costDrivers: [
      { category: 'Inpatient', amount: baseSegment.pmpm * 0.45, trend: '+5.2%' },
      { category: 'Pharmacy', amount: baseSegment.pmpm * 0.25, trend: '+8.1%' },
      { category: 'Specialist', amount: baseSegment.pmpm * 0.20, trend: '+2.0%' },
    ],
    behavioralPatterns: [
      'Low engagement with care management programs',
      'High rate of "shopping" for providers',
      'Prescription refill gaps > 15 days',
    ],
    interventionOpportunities: [
      { id: 'int-1', name: 'Telehealth Monitoring', impact: 'High', savings: '$1.2M' },
      { id: 'int-2', name: 'Home Health Visits', impact: 'Medium', savings: '$800k' },
      { id: 'int-3', name: 'Medication Reconciliation', impact: 'Medium', savings: '$450k' },
    ],
    explanation: `This segment was identified due to a clustering of ${baseSegment.riskCharacteristics.join(', ')}. The AI model detected a ${Math.floor(15 + hash(segmentId) % 15)}% higher than average cost trajectory over the last 6 months, driven primarily by ${baseSegment.riskCharacteristics[0]}. Members in this cluster show consistent utilization and cost patterns that distinguish them from the broader population, making them suitable for targeted interventions.`,
    // Extended metrics for SegmentationMetrics.md (stub/derived)
    detailMetrics: {
      percentOfMembership: Math.round((baseSegment.memberCount / PLAN_TOTAL_MEMBERS) * 1000) / 10,
      percentOfSpend: Math.round((totalCost / PLAN_TOTAL_COST) * 1000) / 10,
      clusterStabilityScore: 72 + (hash(segmentId) % 25),
      medianPmpm: Math.round(baseSegment.pmpm * 0.88),
      costVsPlanPercent: Math.round(((baseSegment.pmpm / PLAN_PMPM) - 1) * 100),
      top10CostConcentration: 42 + (hash(segmentId + 'a') % 25),
      avoidableUtilizationRate: 18 + (hash(segmentId + 'b') % 12),
      readmissionRate30d: 12 + (hash(segmentId + 'r') % 8),
      utilizationVsPlanBenchmark: (baseSegment.pmpm / PLAN_PMPM).toFixed(2) + 'x',
      edFirstCarePattern: baseSegment.riskScore > 2 ? 'Yes' : 'No',
      postDischargeSpike: baseSegment.id === 'seg-005' ? 'Yes' : (hash(segmentId) % 2 ? 'Yes' : 'No'),
      repeatUtilizationLikelihood: baseSegment.riskScore > 2.5 ? 'High' : baseSegment.riskScore > 1.5 ? 'Medium' : 'Low',
      highRiskMemberCount: Math.round(baseSegment.memberCount * 0.22),
      risingRiskMemberCount: Math.round(baseSegment.memberCount * 0.18),
      costGrowthRate3m: 4.2,
      costGrowthRate6m: 7.8,
      costGrowthRate12m: 12.4,
      probHospitalization90d: (8 + (hash(segmentId) % 12)) / 100,
      pctWithCareGap: 58 + (hash(segmentId + 'c') % 25),
      topImpactedQualityMeasures: ['HbA1c control', 'BP control', 'Medication adherence'],
      postDischargeFollowUpRate: 62 + (hash(segmentId) % 20),
      medicationAdherenceRate: 68 + (hash(segmentId) % 18),
      qualityRiskLevel: baseSegment.riskScore > 2 ? 'High' : baseSegment.riskScore > 1.5 ? 'Medium' : 'Low',
      qualityUpsidePotential: Math.round(baseSegment.potentialSavings * 0.4),
      identifiedOpportunity: baseSegment.potentialSavings,
      addressableOpportunity: Math.round(baseSegment.potentialSavings * 0.85),
      realizableOpportunity: baseSegment.potentialSavings,
      opportunityPerMember: Math.round(baseSegment.potentialSavings / baseSegment.memberCount),
      expectedPmpmReduction: Math.round(baseSegment.pmpm * 0.12),
      pctMembersAttributed: 78 + (hash(segmentId) % 15),
      top5ProvidersControl: 52 + (hash(segmentId) % 20),
      providerCostVariationIndex: (1.2 + (hash(segmentId) % 30) / 100).toFixed(2),
      pctValueBasedCare: 35 + (hash(segmentId) % 25),
      actionFeasibilityScore: 65 + (hash(segmentId) % 25),
      careManagementCapacityRequired: Math.ceil(baseSegment.memberCount / 120),
      historicalSuccessRate: 72 + (hash(segmentId) % 15),
      expectedTimeToImpact: 6 + (hash(segmentId) % 6),
      clusterPriorityScore: Math.round((baseSegment.riskScore * 25) + (conf * 30)),
    },
  };
}
