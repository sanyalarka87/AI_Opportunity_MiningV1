/**
 * Stub dashboard metrics aligned to BRD Section 4.2.
 * Filters (LOB, time period, geography, segment) can be used to vary values in a real implementation.
 */
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

export function getDashboardMetrics(filters = {}) {
  const totalMembers = Math.round(applyFilterVariation(652847, filters, 'members'));
  const pmpm = applyFilterVariation(336, filters, 'pmpm');
  const totalMedicalCost = Math.round(totalMembers * pmpm * 12);
  const mlrTarget = 85;
  const targetMlrPct = applyFilterVariation(90, filters, 'mlr');
  const totalRevenue = Math.round(totalMedicalCost / (targetMlrPct / 100));
  const mlr = Math.round((totalMedicalCost / totalRevenue) * 100 * 100) / 100;

  const org = {
    totalMembers,
    totalRevenue,
    totalMedicalCost,
    mlr,
    pmpm,
    revenueChangePercent: 3.1,
    costChangePercent: -2.3,
    pmpmChangePercent: -1.8,
    mlrTarget,
    mlrAboveTarget: Math.round((mlr - mlrTarget) * 10) / 10,
  };

  const projectedMlrTarget = 89;
  const realizable = Math.max(0, Math.round(totalMedicalCost - (projectedMlrTarget / 100) * totalRevenue));
  const realizationRate = 0.72;
  const addressable = Math.round(realizable / realizationRate);
  const addressablePctOfIdentified = 0.83;
  const totalIdentified = Math.round(addressable / addressablePctOfIdentified);
  const realized = Math.round(realizable * 0.45);
  const affectedMembersPct = 0.18;
  const affectedMembers = Math.min(totalMembers - 1, Math.round(totalMembers * affectedMembersPct));

  const opportunity = {
    totalIdentified,
    addressable,
    realizable,
    realized,
    affectedMembers,
  };

  const costUtilization = {
    edVisitsPer1000: Math.round(applyFilterVariation(385, filters, 'ed')),
    admissionsPer1000: Math.round(applyFilterVariation(78, filters, 'adm')),
    readmissionRate: applyFilterVariation(14.2, filters, 'readm'),
    avgLengthOfStay: applyFilterVariation(4.3, filters, 'alos'),
    inpatientAdmissionRate: applyFilterVariation(0.082, filters, 'inp'), // keeping for compat if needed
    erUtilization: applyFilterVariation(0.42, filters, 'er'),
    outpatientUtilization: applyFilterVariation(3.2, filters, 'out'),
    pharmacyCostTrend: applyFilterVariation(6.5, filters, 'rx'),
  };

  const trend = {
    rolling12MonthMlr: [88.1, 88.5, 89.0, 89.2, 89.5, 89.8, 90.0, 90.1, 90.2, 90.0, 89.9, 90.2],
    rolling12MonthPmpm: [328, 330, 332, 331, 333, 334, 335, 336, 336, 335, 334, 336],
    predictiveForecast: { mlrNextQuarter: 90.0, pmpmNextQuarter: 338 },
  };

  const costDistribution = [
    { name: 'Inpatient', value: 38, color: '#0d9488' },
    { name: 'Outpatient', value: 28, color: '#7c3aed' },
    { name: 'Professional', value: 18, color: '#ea580c' },
    { name: 'Pharmacy', value: 12, color: '#eab308' },
    { name: 'Emergency', value: 8, color: '#38bdf8' },
    { name: 'Other', value: 6, color: '#a78bfa' },
  ];

  return {
    organizational: org,
    opportunity,
    costUtilization,
    trend,
    costDistribution,
  };
}
