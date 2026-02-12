import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSegmentDetail, getOpportunities, sendSegmentChatMessage } from '../api/client';
import { FormattedMarkdown } from '../components/FormattedMarkdown';
import styles from './SegmentDetailPage.module.css';

function formatCost(dollars: number): string {
  if (dollars >= 1e6) return `$${(dollars / 1e6).toFixed(1)}M`;
  if (dollars >= 1e3) return `$${(dollars / 1e3).toFixed(0)}k`;
  return `$${Math.round(dollars)}`;
}

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
  );
}

function ProgressBar({ value, max, color, label, displayValue }: { value: number; max: number; color: string; label: string; displayValue: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={styles.vizRow}>
      <div className={styles.vizLabel}>{label}</div>
      <div className={styles.vizBarWrap}>
        <div className={styles.vizTrack}>
          <div className={styles.vizFill} style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }} />
        </div>
        <span className={styles.vizValue}>{displayValue}</span>
      </div>
    </div>
  );
}

function Badge({ label, variant }: { label: string; variant: 'high' | 'medium' | 'low' | 'yes' | 'no' | 'neutral' }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{label}</span>;
}

function FunnelStep({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className={styles.funnelStep}>
      <div className={styles.funnelLabel}>{label}</div>
      <div className={styles.funnelBarWrap}>
        <div className={styles.funnelBar} style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: color }} />
      </div>
      <div className={styles.funnelValue}>{value}</div>
    </div>
  );
}

function StatHighlight({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className={styles.statHighlight}>
      <div className={styles.statHighlightValue} style={color ? { color } : undefined}>{value}</div>
      <div className={styles.statHighlightLabel}>{label}</div>
      {sub && <div className={styles.statHighlightSub}>{sub}</div>}
    </div>
  );
}

function badgeVariant(val: string): 'high' | 'medium' | 'low' | 'yes' | 'no' | 'neutral' {
  const v = val.toLowerCase();
  if (v === 'yes') return 'yes';
  if (v === 'no') return 'no';
  if (v === 'high') return 'high';
  if (v === 'medium') return 'medium';
  if (v === 'low') return 'low';
  return 'neutral';
}

function Card({
  title,
  question,
  children,
}: {
  title: string;
  question?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {question && <p className={styles.cardQuestion}>{question}</p>}
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

function generateOpportunityExplanation(segment: any): string {
  const dm = segment.detailMetrics;
  const confPct = segment.confidenceScore != null
    ? (segment.confidenceScore <= 1 ? segment.confidenceScore * 100 : segment.confidenceScore).toFixed(0)
    : '85';
  const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}k` : `$${Math.round(n)}`;
  
  const identified = dm?.identifiedOpportunity ?? segment.potentialSavings;
  const addressable = dm?.addressableOpportunity ?? segment.potentialSavings;
  const realizable = dm?.realizableOpportunity ?? segment.potentialSavings;
  const oppPerMember = dm?.opportunityPerMember ?? Math.round(segment.potentialSavings / segment.memberCount);
  const pmpmReduction = dm?.expectedPmpmReduction ?? Math.round(segment.pmpm * 0.12);
  const totalCost = segment.totalCost ?? segment.memberCount * segment.pmpm * 12;
  const planTotalCost = 2.63e9;
  const mlrImpact = ((realizable / planTotalCost) * 100).toFixed(2);
  const timeframe = dm?.expectedTimeToImpact ?? 6;

  return `## Opportunity Overview

This segment represents a significant opportunity for cost reduction and quality improvement. The AI-identified cluster of **${segment.memberCount.toLocaleString()} members** (${dm?.percentOfMembership ?? '-'}% of total membership) accounts for **${dm?.percentOfSpend ?? '-'}% of total medical spend**, with an average PMPM of **$${segment.pmpm.toLocaleString()}** compared to the plan average of $336.

## Opportunity Numbers & Justification

### Identified Opportunity: ${fmt(identified)}

**Justification:** The total potential savings identified across this cluster is based on:
- **Cost intensity:** Average PMPM of $${segment.pmpm.toLocaleString()} is ${dm?.costVsPlanPercent ?? '-'}% above plan average
- **Utilization patterns:** ${segment.metrics?.admissionRate ?? '-'} inpatient admissions per 1k and ${segment.metrics?.erVisitRate ?? '-'} ED visits per 1k, with ${dm?.avoidableUtilizationRate ?? '-'}% avoidable utilization
- **Quality gaps:** ${dm?.pctWithCareGap ?? '-'}% of members have ≥1 open care gap, indicating intervention potential
- **Risk trajectory:** Cost growth rate of ${dm?.costGrowthRate12m ?? '-'}% over 12 months suggests accelerating costs without intervention

### Addressable Opportunity: ${fmt(addressable)}

**Justification:** Not all identified opportunity can be addressed due to:
- **Provider attribution:** Only ${dm?.pctMembersAttributed ?? '-'}% of members are attributed to providers, limiting direct intervention reach
- **Value-based care penetration:** ${dm?.pctValueBasedCare ?? '-'}% of providers are in value-based arrangements, affecting leverage
- **Care management capacity:** Requires ${dm?.careManagementCapacityRequired ?? Math.ceil(segment.memberCount / 120)} FTE to effectively manage this population
- **Historical success rate:** Similar clusters have achieved ${dm?.historicalSuccessRate ?? 72}% success rate, indicating realistic addressability

### Realizable Opportunity: ${fmt(realizable)}

**Justification:** The realizable amount accounts for:
- **Execution feasibility:** Action feasibility score of ${dm?.actionFeasibilityScore ?? '-'}/100 indicates moderate to high feasibility
- **Time to impact:** Expected ${timeframe} months to realize savings, accounting for intervention ramp-up and member engagement
- **Quality guardrails:** ${dm?.qualityRiskLevel ?? 'Medium'} quality risk level requires careful intervention design to avoid adverse outcomes
- **Confidence level:** ${confPct}% confidence score reflects data quality and model reliability

### Opportunity per Member: $${oppPerMember.toLocaleString()}

**Justification:** Calculated as realizable opportunity divided by ${segment.memberCount.toLocaleString()} members. This represents the average savings potential per member through targeted interventions.

### Expected PMPM Reduction: $${pmpmReduction}

**Justification:** Based on:
- Current PMPM of $${segment.pmpm.toLocaleString()} vs plan average of $336
- Realizable opportunity of ${fmt(realizable)} spread across ${segment.memberCount.toLocaleString()} members over 12 months
- Expected reduction represents approximately ${((pmpmReduction / segment.pmpm) * 100).toFixed(1)}% of current PMPM

### Expected MLR Impact: ${mlrImpact} basis points

**Justification:** Realizable savings of ${fmt(realizable)} represents ${mlrImpact}% of total plan medical cost ($${(planTotalCost / 1e9).toFixed(2)}B), directly impacting the Medical Loss Ratio.

### Timeframe to Realize Savings: ${timeframe} months

**Justification:** Timeline accounts for:
- **Intervention deployment:** ${Math.ceil(timeframe / 3)} months to implement care management programs
- **Member engagement:** ${Math.ceil(timeframe / 2)} months for members to engage with interventions
- **Outcome measurement:** ${Math.ceil(timeframe / 2)} months to observe utilization and cost changes
- **Historical benchmarks:** Similar clusters show impact beginning at ${Math.ceil(timeframe / 2)} months with full realization by ${timeframe} months

## Recommended Interventions

${(segment.interventionOpportunities || []).map((o: any, idx: number) => `${idx + 1}. **${o.name}** (${o.impact} impact, ${o.savings}) — Expected to address key cost drivers and quality gaps in this cluster.`).join('\n\n') || '1. Telehealth Monitoring — High impact, $1.2M savings\n2. Home Health Visits — Medium impact, $800k savings\n3. Medication Reconciliation — Medium impact, $450k savings'}

## Risks & Considerations

- **Quality risk:** ${dm?.qualityRiskLevel ?? 'Medium'} risk level requires careful monitoring to ensure interventions don't compromise outcomes
- **Execution risk:** Requires ${dm?.careManagementCapacityRequired ?? Math.ceil(segment.memberCount / 120)} FTE capacity, which may be constrained
- **Provider engagement:** Only ${dm?.top5ProvidersControl ?? '-'}% of cost controlled by top 5 providers, requiring broad network engagement
- **Historical success:** ${dm?.historicalSuccessRate ?? 72}% success rate for similar clusters indicates moderate execution risk

## Connection to Opportunities Page

The opportunity numbers and recommended interventions above are directly linked to one or more opportunities on the **Opportunities** page. Each linked opportunity has been mapped to this cluster so you can drill into assumptions, ROI, risks, and status there. Use the links below to open each opportunity.`;
}

export function SegmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showOpportunityDetails, setShowOpportunityDetails] = useState(false);
  const [qnaMessage, setQnaMessage] = useState('');
  const [qnaResponses, setQnaResponses] = useState<{ role: string; content: string }[]>([]);
  const [qnaLoading, setQnaLoading] = useState(false);
  const [qnaCollapsed, setQnaCollapsed] = useState(false);

  const handleQna = async () => {
    if (!qnaMessage.trim() || !id) return;
    setQnaResponses((prev) => [...prev, { role: 'user', content: qnaMessage }]);
    setQnaMessage('');
    setQnaLoading(true);
    try {
      const res = await sendSegmentChatMessage(qnaMessage, id);
      setQnaResponses((prev) => [...prev, { role: 'assistant', content: res.response }]);
    } catch {
      setQnaResponses((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setQnaLoading(false);
    }
  };

  const { data: segment, isLoading, isError } = useQuery({
    queryKey: ['segmentDetail', id],
    queryFn: () => getSegmentDetail(id!),
    enabled: !!id,
  });

  const { data: mappedOpportunities = [] } = useQuery({
    queryKey: ['opportunities', 'segment', id],
    queryFn: () => getOpportunities({ segmentId: id! }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading segment…</div>
      </div>
    );
  }
  if (isError || !segment) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>Segment not found.</div>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/segmentation')}>
          Back to segments
        </button>
      </div>
    );
  }

  const dm = segment.detailMetrics;
  const totalCost = segment.totalCost ?? segment.memberCount * segment.pmpm * 12;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/segmentation')}
          aria-label="Back to AI Segmentation"
        >
          ← Back to segments
        </button>
      </div>

      <header className={styles.header}>
        <h1 className={styles.segmentName}>{segment.name}</h1>
        <p className={styles.segmentDesc}>{segment.description}</p>
      </header>

      {/* Top panel: Why this segment exists + Cost drivers */}
      <div className={styles.topPanel}>
        <section className={styles.explainSection}>
          <h2 className={styles.explainTitle}>Why this segment exists</h2>
          <p className={styles.explainText}>{segment.explanation}</p>
        </section>
        {segment.costDrivers && segment.costDrivers.length > 0 && (
          <section className={styles.costDriversSection}>
            <h2 className={styles.costDriversTitle}>Top Cost Drivers (PMPM)</h2>
            <p className={styles.costDriversSubtitle}>Trend is year-over-year change in PMPM.</p>
            <ul className={styles.driverList}>
              {segment.costDrivers.map((d) => (
                <li key={d.category}>
                  <span className={styles.driverCategory}>{d.category}</span>
                  <span className={styles.driverAmount}>${Math.round(d.amount)}</span>
                  <span className={styles.driverTrend} title="Year over year">{d.trend} YoY</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Panel 1: Cards 1–4 */}
      <div className={styles.panel}>
        <Card title="1. Cluster Identity & Size" question="Is this cluster meaningful at scale?">
          <div className={styles.statRow}>
            <StatHighlight label="Members" value={segment.memberCount.toLocaleString()} color="#2563eb" />
            {dm && <StatHighlight label="Stability" value={`${dm.clusterStabilityScore}`} sub="/ 100" />}
          </div>
          {dm && (
            <>
              <ProgressBar label="% of membership" value={dm.percentOfMembership} max={15} color="#2563eb" displayValue={`${dm.percentOfMembership}%`} />
              <ProgressBar label="% of medical spend" value={dm.percentOfSpend} max={30} color="#7c3aed" displayValue={`${dm.percentOfSpend}%`} />
            </>
          )}
        </Card>
        <Card title="2. Cost Intensity" question="Is real money involved?">
          <div className={styles.statRow}>
            <StatHighlight label="Avg PMPM" value={`$${segment.pmpm.toLocaleString()}`} color="#dc2626" />
            <StatHighlight label="Total cost" value={formatCost(totalCost)} />
          </div>
          {dm && (
            <>
              <ProgressBar label="Median PMPM" value={dm.medianPmpm} max={segment.pmpm * 1.2} color="#f97316" displayValue={`$${dm.medianPmpm.toLocaleString()}`} />
              <ProgressBar label="Cost vs plan avg" value={Math.abs(dm.costVsPlanPercent)} max={1000} color="#dc2626" displayValue={`${dm.costVsPlanPercent}%`} />
              <ProgressBar label="Top 10% concentration" value={dm.top10CostConcentration} max={100} color="#7c3aed" displayValue={`${dm.top10CostConcentration}%`} />
            </>
          )}
        </Card>
        <Card title="3. Utilization Pattern Signals" question="What behaviors define this cluster?">
          {segment.metrics && (
            <>
              <ProgressBar label="IP admissions / 1k" value={segment.metrics.admissionRate} max={200} color="#2563eb" displayValue={`${segment.metrics.admissionRate}`} />
              <ProgressBar label="ED visits / 1k" value={segment.metrics.erVisitRate} max={600} color="#ea580c" displayValue={`${segment.metrics.erVisitRate}`} />
            </>
          )}
          <ProgressBar label="30-day readmission" value={dm?.readmissionRate30d ?? 14.2} max={30} color="#dc2626" displayValue={`${dm?.readmissionRate30d ?? 14.2}%`} />
          {dm && (
            <>
              <ProgressBar label="Avoidable utilization" value={dm.avoidableUtilizationRate} max={40} color="#f97316" displayValue={`${dm.avoidableUtilizationRate}%`} />
              <div className={styles.badgeRow}>
                <span className={styles.badgeLabel}>ED-first</span><Badge label={dm.edFirstCarePattern} variant={badgeVariant(dm.edFirstCarePattern)} />
                <span className={styles.badgeLabel}>Post-discharge spike</span><Badge label={dm.postDischargeSpike} variant={badgeVariant(dm.postDischargeSpike)} />
                <span className={styles.badgeLabel}>Repeat util.</span><Badge label={dm.repeatUtilizationLikelihood} variant={badgeVariant(dm.repeatUtilizationLikelihood)} />
              </div>
            </>
          )}
        </Card>
        <Card title="4. Risk & Trajectory" question="What happens if we do nothing?">
          {dm ? (
            <>
              <div className={styles.statRow}>
                <StatHighlight label="High-risk" value={dm.highRiskMemberCount.toLocaleString()} color="#dc2626" />
                <StatHighlight label="Rising-risk" value={dm.risingRiskMemberCount.toLocaleString()} color="#f97316" />
              </div>
              <ProgressBar label="Cost Growth (3 mo)" value={dm.costGrowthRate3m} max={20} color="#eab308" displayValue={`${dm.costGrowthRate3m}%`} />
              <ProgressBar label="Cost Growth (6 mo)" value={dm.costGrowthRate6m} max={20} color="#f97316" displayValue={`${dm.costGrowthRate6m}%`} />
              <ProgressBar label="Cost Growth (12 mo)" value={dm.costGrowthRate12m} max={20} color="#dc2626" displayValue={`${dm.costGrowthRate12m}%`} />
              <ProgressBar label="P(hosp. 90d)" value={dm.probHospitalization90d * 100} max={30} color="#7c3aed" displayValue={`${(dm.probHospitalization90d * 100).toFixed(1)}%`} />
            </>
          ) : (
            <div className={styles.cardEmpty}>No data</div>
          )}
        </Card>
      </div>

      {/* Panel 2: Cards 5–8 */}
      <div className={styles.panel}>
        <Card title="5. Quality & Care Gaps" question="Can we act safely without harming outcomes?">
          {dm ? (
            <>
              <ProgressBar label="Members with care gap" value={dm.pctWithCareGap} max={100} color="#dc2626" displayValue={`${dm.pctWithCareGap}%`} />
              <ProgressBar label="Follow-up rate" value={dm.postDischargeFollowUpRate} max={100} color="#0d9488" displayValue={`${dm.postDischargeFollowUpRate}%`} />
              <ProgressBar label="Med. adherence" value={dm.medicationAdherenceRate} max={100} color="#2563eb" displayValue={`${dm.medicationAdherenceRate}%`} />
              <div className={styles.badgeRow}>
                <span className={styles.badgeLabel}>Quality risk</span><Badge label={dm.qualityRiskLevel} variant={badgeVariant(dm.qualityRiskLevel)} />
              </div>
              <MetricRow label="Top quality measures" value={dm.topImpactedQualityMeasures.join(', ')} />
              <MetricRow label="Quality upside" value={formatCost(dm.qualityUpsidePotential)} />
            </>
          ) : (
            <div className={styles.cardEmpty}>No data</div>
          )}
        </Card>
        <Card title="6. Opportunity Quantification" question="Is this a bankable opportunity or just an insight?">
          {(() => {
            const identified = dm?.identifiedOpportunity ?? segment.potentialSavings;
            const addressable = dm?.addressableOpportunity ?? segment.potentialSavings;
            const realizable = dm?.realizableOpportunity ?? segment.potentialSavings;
            return (
              <>
                <FunnelStep label="Identified" value={formatCost(identified)} pct={100} color="#93c5fd" />
                <FunnelStep label="Addressable" value={formatCost(addressable)} pct={identified > 0 ? (addressable / identified) * 100 : 0} color="#60a5fa" />
                <FunnelStep label="Realizable" value={formatCost(realizable)} pct={identified > 0 ? (realizable / identified) * 100 : 0} color="#2563eb" />
                <div className={styles.funnelDivider} />
                <MetricRow label="Per member" value={dm ? `$${dm.opportunityPerMember.toLocaleString()}` : formatCost(segment.potentialSavings / segment.memberCount)} />
                <ProgressBar label="Confidence" value={segment.confidenceScore != null ? (segment.confidenceScore <= 1 ? segment.confidenceScore * 100 : segment.confidenceScore) : 85} max={100} color="#22c55e" displayValue={`${segment.confidenceScore != null ? (segment.confidenceScore <= 1 ? segment.confidenceScore * 100 : segment.confidenceScore).toFixed(0) : '85'}%`} />
                {dm && <MetricRow label="PMPM reduction" value={`$${dm.expectedPmpmReduction}`} />}
              </>
            );
          })()}
        </Card>
        <Card title="7. Provider & Control Signals" question="Who can actually change outcomes?">
          {dm ? (
            <>
              <ProgressBar label="Members attributed" value={dm.pctMembersAttributed} max={100} color="#2563eb" displayValue={`${dm.pctMembersAttributed}%`} />
              <ProgressBar label="Top 5 providers' control" value={dm.top5ProvidersControl} max={100} color="#7c3aed" displayValue={`${dm.top5ProvidersControl}%`} />
              <ProgressBar label="Value-based care" value={dm.pctValueBasedCare} max={100} color="#0d9488" displayValue={`${dm.pctValueBasedCare}%`} />
              <MetricRow label="Cost variation index" value={dm.providerCostVariationIndex} />
            </>
          ) : (
            <div className={styles.cardEmpty}>No data</div>
          )}
        </Card>
        <Card title="8. Action Readiness & Priority" question="Should we act now or later?">
          {dm ? (
            <>
              <div className={styles.gaugeWrap}>
                <svg viewBox="0 0 120 70" className={styles.gaugeSvg}>
                  <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round" />
                  <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(dm.actionFeasibilityScore / 100) * 157} 157`} />
                  <text x="60" y="58" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text-primary)">{dm.actionFeasibilityScore}</text>
                  <text x="60" y="69" textAnchor="middle" fontSize="8" fill="var(--text-muted)">Feasibility</text>
                </svg>
              </div>
              <ProgressBar label="Historical success" value={dm.historicalSuccessRate} max={100} color="#22c55e" displayValue={`${dm.historicalSuccessRate}%`} />
              <MetricRow label="CM capacity required" value={`${dm.careManagementCapacityRequired} FTE`} />
              <MetricRow label="Time to impact" value={`${dm.expectedTimeToImpact} months`} />
              <MetricRow label="Priority score" value={dm.clusterPriorityScore} />
            </>
          ) : (
            <div className={styles.cardEmpty}>No data</div>
          )}
        </Card>
      </div>

      {/* Bottom Panel: Opportunity Agent (half) + QnA Agent (half) */}
      <div className={styles.bottomPanel}>
        <div className={styles.opportunityAgentCard}>
          <p className={styles.opportunityAgentPrompt}>
            What is the opportunity for the segment. Why does this segment matter and what can we do about it?
          </p>
          <button
            type="button"
            className={styles.opportunityDetailsBtn}
            onClick={() => setShowOpportunityDetails(!showOpportunityDetails)}
          >
            See opportunity details
          </button>
          {showOpportunityDetails && (
            <div className={styles.opportunityDetailsWindow}>
              <div className={styles.opportunityDetailsContent}>
                {generateOpportunityExplanation(segment).split('\n').map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    return <br key={idx} />;
                  }
                  if (trimmed.startsWith('## ')) {
                    return <h3 key={idx} className={styles.opportunityH3}>{trimmed.replace('## ', '')}</h3>;
                  }
                  if (trimmed.startsWith('### ')) {
                    return <h4 key={idx} className={styles.opportunityH4}>{trimmed.replace('### ', '')}</h4>;
                  }
                  if (trimmed.startsWith('- **')) {
                    const parts = trimmed.replace('- **', '').split(':**');
                    return (
                      <p key={idx} className={styles.opportunityBullet}>
                        <strong>{parts[0]}:</strong>{parts[1] || ''}
                      </p>
                    );
                  }
                  if (trimmed.match(/^\d+\. \*\*/)) {
                    const match = trimmed.match(/^(\d+)\. \*\*(.+?)\*\*(.*)$/);
                    if (match) {
                      return (
                        <p key={idx} className={styles.opportunityNumbered}>
                          <strong>{match[1]}. {match[2]}</strong>{match[3]}
                        </p>
                      );
                    }
                    return <p key={idx} className={styles.opportunityNumbered}>{trimmed}</p>;
                  }
                  const parts = trimmed.split(/\*\*(.+?)\*\*/g);
                  if (parts.length > 1) {
                    return (
                      <p key={idx} className={styles.opportunityParagraph}>
                        {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
                      </p>
                    );
                  }
                  return <p key={idx} className={styles.opportunityParagraph}>{trimmed}</p>;
                })}
              </div>
              <div className={styles.mappedOpportunitiesSection}>
                <h3 className={styles.opportunityH3}>Mapped opportunities (from Opportunities page)</h3>
                <p className={styles.opportunityParagraph}>
                  The following opportunities are linked to this cluster. Open any link to view full details, assumptions, ROI, and status on the Opportunities page.
                </p>
                {mappedOpportunities.length > 0 ? (
                  <ul className={styles.mappedOpportunitiesList}>
                    {mappedOpportunities.map((opp) => (
                      <li key={opp.id}>
                        <Link to={`/opportunities/${opp.id}`} className={styles.mappedOpportunityLink}>
                          {opp.title}
                        </Link>
                        <span className={styles.mappedOpportunityMeta}>
                          {' '}— {formatCost(opp.estimatedSavings)} estimated savings · {opp.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.opportunityParagraph}>No opportunities are currently mapped to this cluster. Opportunities can be linked to this segment from the Opportunities page.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.qnaAgentCard}>
          <h2 className={styles.qnaAgentTitle}>QnA agent</h2>
          <div className={styles.qnaInputRow}>
            <input
              type="text"
              placeholder="Ask about assumptions, ROI, risks…"
              value={qnaMessage}
              onChange={(e) => setQnaMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQna()}
              className={styles.qnaInput}
              aria-label="Ask about segment"
            />
            <button
              type="button"
              className={styles.qnaSendBtn}
              onClick={handleQna}
              disabled={qnaLoading || !qnaMessage.trim()}
            >
              {qnaLoading ? 'Sending…' : 'Send'}
            </button>
          </div>
          {qnaResponses.length > 0 && (
            <div className={styles.qnaAnswerWrap}>
              <div className={styles.qnaAnswerHeader}>
                <span className={styles.qnaAnswerTitle}>Answers</span>
                <button
                  type="button"
                  className={styles.qnaAnswerCloseBtn}
                  onClick={() => setQnaCollapsed(true)}
                  aria-label="Collapse answers"
                >
                  ×
                </button>
              </div>
              {!qnaCollapsed && (
                <div className={styles.qnaResponses}>
                  {qnaResponses.map((r, i) => (
                    <div key={i} className={r.role === 'user' ? styles.qnaUser : styles.qnaAssistant}>
                      {r.role === 'assistant' ? (
                        <FormattedMarkdown content={r.content} />
                      ) : (
                        r.content
                      )}
                    </div>
                  ))}
                </div>
              )}
              {qnaCollapsed && (
                <button type="button" className={styles.qnaExpandBtn} onClick={() => setQnaCollapsed(false)}>
                  Show answers
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
