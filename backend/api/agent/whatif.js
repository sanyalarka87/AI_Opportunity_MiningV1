import { logAudit } from '../../src/audit.js';
import { getOpportunityById } from '../../src/data/opportunitiesStore.js';
import { getDashboardMetrics } from '../../src/data/stubMetrics.js';
import {
  parseRealizationRateFromScenario,
  parseMLRReductionFromScenario,
} from '../../src/serverless/agentShared.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { opportunityId, scenario } = req.body || {};
  const userId = req.headers['x-user-id'] || 'anonymous';
  logAudit({ action: 'whatif_simulation', userId, opportunityId, scenario });

  const opp = opportunityId ? getOpportunityById(opportunityId) : null;
  const metrics = getDashboardMetrics({});
  const oppAgg = metrics.opportunity || {};
  const currentRealizationRate = oppAgg.addressable > 0
    ? (oppAgg.realizable / oppAgg.addressable) * 100
    : 72;
  const targetRealizationPct = parseRealizationRateFromScenario(scenario);

  if (opp && targetRealizationPct != null && scenario && /realization\s+rate|net\s+savings/i.test(scenario)) {
    const currentNetSavings = opp.estimatedSavings;
    const addressableForOpp = currentRealizationRate > 0
      ? currentNetSavings / (currentRealizationRate / 100)
      : currentNetSavings / 0.72;
    const newNetSavings = Math.round(addressableForOpp * (targetRealizationPct / 100));
    const delta = newNetSavings - currentNetSavings;
    const response =
      `**What-if: Potential net savings at ${targetRealizationPct}% realization rate**\n\n` +
      `For this opportunity (**${opp.title}**), the current potential net savings are based on a realization rate of **${Math.round(currentRealizationRate)}%**. ` +
      `That yields **$${(currentNetSavings / 1e6).toFixed(2)} M** in net savings for this opportunity.\n\n` +
      `If the realization rate increases from **${Math.round(currentRealizationRate)}%** to **${targetRealizationPct}%**:\n\n` +
      `- **Addressable opportunity** (underlying scope) is unchanged: **$${(addressableForOpp / 1e6).toFixed(2)} M**.\n` +
      `- **New potential net savings** at ${targetRealizationPct}% realization: **$${(newNetSavings / 1e6).toFixed(2)} M**.\n` +
      `- **Change**: ${delta >= 0 ? '+' : ''}$${(delta / 1e6).toFixed(2)} M (${delta >= 0 ? 'increase' : 'decrease'} of **$${Math.abs(delta).toLocaleString()}**).\n\n` +
      `So **at ${targetRealizationPct}% realization, the potential net savings for this opportunity would be $${(newNetSavings / 1e6).toFixed(2)} M**.\n\n` +
      `This assumes the addressable scope and other drivers stay the same; only the share we capture (realization rate) changes.`;
    res.status(200).json({
      response,
      projections: {
        currentRealizationRatePct: Math.round(currentRealizationRate),
        targetRealizationRatePct: targetRealizationPct,
        currentNetSavings,
        newNetSavings,
        addressableForOpp,
        delta,
      },
      assumptions: scenario,
    });
    return;
  }

  const org = metrics.organizational || {};
  const mlrReduction = parseMLRReductionFromScenario(scenario);
  if (mlrReduction && scenario && /reduce\s+mlr|mlr\s+from|what\s+should\s+I\s+do/i.test(scenario)) {
    const currentMlr = org.mlr ?? 90;
    const totalMedicalCost = org.totalMedicalCost ?? 0;
    const totalRevenue = org.totalRevenue ?? 0;
    const targetMlrPct = mlrReduction.toPct;
    const targetCostAtMlr = totalRevenue > 0 ? (targetMlrPct / 100) * totalRevenue : 0;
    const requiredCostReduction = Math.max(0, Math.round(totalMedicalCost - targetCostAtMlr));
    const realizable = oppAgg.realizable ?? 0;

    const response =
      `**What should I do to reduce MLR from ${mlrReduction.fromPct}% to ${mlrReduction.toPct}%?**\n\n` +
      `**Current situation**\n\n` +
      `- **Current MLR**: **${currentMlr}%** (medical cost as % of revenue).\n` +
      `- **Target MLR**: **${targetMlrPct}%** — a **${mlrReduction.fromPct - targetMlrPct} percentage point** improvement.\n` +
      `- **Total medical cost** (current): **$${(totalMedicalCost / 1e6).toFixed(2)} M**.\n` +
      `- **Total revenue**: **$${(totalRevenue / 1e6).toFixed(2)} M**.\n\n` +
      `**Gap to close**\n\n` +
      `To reach **${targetMlrPct}%** MLR, medical cost must be at or below **$${(targetCostAtMlr / 1e6).toFixed(2)} M**. ` +
      `That means you need to **reduce medical cost by **$${(requiredCostReduction / 1e6).toFixed(2)} M** (or achieve equivalent margin improvement through revenue/cost levers).\n\n` +
      `**What you should do**\n\n` +
      `1. **Execute the opportunity pipeline** — You have **$${(realizable / 1e6).toFixed(2)} M** in **realizable** savings from identified opportunities (addressable after realization). Prioritize high-confidence, high-savings opportunities (e.g. prior auth automation, care gap closure, avoidable ED redirect) and track execution so realized savings hit the bottom line.\n\n` +
      `2. **Utilization and clinical levers** — Focus on: **avoidable inpatient admissions**, **duplicate services**, **low-value care**, and **non-emergent ED visits**. These map directly to cost reduction without cutting necessary care. Use the explainability and rationale on each opportunity to target the right populations and interventions.\n\n` +
      `3. **PMPM and unit cost** — Drive down **PMPM** through utilization management, site-of-care steerage, and pharmacy management. Even a small PMPM reduction across the book compounds to meaningful MLR improvement.\n\n` +
      `4. **Track and reforecast** — Monitor MLR monthly; re-run this what-if as you lock in savings to see how much of the **$${(requiredCostReduction / 1e6).toFixed(2)} M** gap is closed. If you realize **$${(realizable / 1e6).toFixed(2)} M** of the pipeline, you will have closed a significant portion of the gap toward **${targetMlrPct}%** MLR.\n\n` +
      `**Summary** — To reduce MLR from **${mlrReduction.fromPct}%** to **${targetMlrPct}%**, you need **$${(requiredCostReduction / 1e6).toFixed(2)} M** in medical cost reduction. Prioritize executing the identified opportunity pipeline (realizable **$${(realizable / 1e6).toFixed(2)} M**) and utilization levers; track progress and reforecast regularly.`;

    res.status(200).json({
      response,
      projections: {
        currentMlr,
        targetMlrPct,
        requiredCostReduction,
        targetCostAtMlr,
        realizable,
      },
      assumptions: scenario,
    });
    return;
  }

  const baseSavings = opp ? opp.estimatedSavings : 1000000;
  const response =
    (scenario ? `**Scenario:** ${scenario}\n\n` : '') +
    `**Projections (baseline):**\n` +
    `- Year 1: **$${(baseSavings / 1e6).toFixed(2)} M** savings\n` +
    `- Year 2: **$${(baseSavings * 1.1 / 1e6).toFixed(2)} M** savings\n` +
    `- Year 3: **$${(baseSavings * 1.2 / 1e6).toFixed(2)} M** savings\n\n` +
    `**Tailored what-if examples:**\n` +
    `- *Realization rate:* "What will be the potential net savings if the realization rate is 80%?"\n` +
    `- *MLR reduction:* "What should I do to reduce MLR from 90% to 87%?"`;

  res.status(200).json({
    response,
    projections: {
      year1: { savings: baseSavings, marginImpact: 0.2 },
      year2: { savings: baseSavings * 1.1, marginImpact: 0.22 },
      year3: { savings: baseSavings * 1.2, marginImpact: 0.24 },
    },
    assumptions: scenario || 'Baseline scenario',
  });
}

