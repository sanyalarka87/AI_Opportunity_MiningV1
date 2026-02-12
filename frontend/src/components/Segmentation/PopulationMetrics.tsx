import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PopulationMetrics as PopulationMetricsType, getPopulationMetrics, getDashboardMetrics } from '../../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import type { DashboardMetrics } from '../../types/dashboard';
import styles from './PopulationMetrics.module.css';

export const PopulationMetrics: React.FC = () => {
  const filters = useSelector((state: RootState) => state.segmentation.filters);
  const [data, setData] = useState<PopulationMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboardMetrics', {}],
    queryFn: () => getDashboardMetrics({}),
  });

  useEffect(() => {
    setLoading(true);
    getPopulationMetrics(filters as Record<string, string>)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) {
    return <div className={styles.loading}>Loading metrics…</div>;
  }
  if (!data) {
    return <div className={styles.empty}>No data available</div>;
  }

  /* Align with backend: use same totals as dashboard (652847, cost % from stubMetrics) */
  const riskData = data.riskDistribution?.length
    ? data.riskDistribution
    : [
        { name: 'Low Risk', value: Math.round((data.totalMembers || 652847) * 0.45), color: '#22c55e' },
        { name: 'Medium Risk', value: Math.round((data.totalMembers || 652847) * 0.30), color: '#eab308' },
        { name: 'High Risk', value: Math.round((data.totalMembers || 652847) * 0.15), color: '#f97316' },
        { name: 'Very High Risk', value: Math.round((data.totalMembers || 652847) * 0.10), color: '#ef4444' },
      ];
  const org = (dashboardData as DashboardMetrics | undefined)?.organizational;
  const totalMembers = org?.totalMembers ?? data.totalMembers;
  const totalCost = org?.totalMedicalCost;

  const risingRiskMembers = Math.round(totalMembers * 0.23);
  const risingRiskPercent =
    totalMembers > 0 ? (risingRiskMembers / totalMembers) * 100 : 0;

  const sdohMembers = Math.round(totalMembers * 0.51);
  const sdohPercent =
    totalMembers > 0 ? (sdohMembers / totalMembers) * 100 : 0;

  const riskChartData = riskData.map((d) => ({
    ...d,
    percent: totalMembers > 0 ? (d.value / totalMembers) * 100 : 0,
  }));

  // Allocate cost across risk tiers with increasing per-member cost by risk
  const riskCostWeights: Record<string, number> = {
    'Low Risk': 1,
    'Medium Risk': 2,
    'High Risk': 3,
    'Very High Risk': 4,
  };
  const totalWeightedMembers = riskData.reduce(
    (sum, d) => sum + d.value * (riskCostWeights[d.name] ?? 1),
    0
  );
  const totalCostValue = typeof totalCost === 'number' ? totalCost : 0;
  const riskCostData = riskData.map((d) => {
    const weight = riskCostWeights[d.name] ?? 1;
    const share =
      totalWeightedMembers > 0 ? (d.value * weight) / totalWeightedMembers : 0;
    const cost = totalCostValue * share;
    return {
      ...d,
      cost,
      costPercent: share * 100,
    };
  });

  const riskCombinedData = riskData.map((d) => {
    const memberPercent =
      totalMembers > 0 ? (d.value / totalMembers) * 100 : 0;
    const costEntry = riskCostData.find((c) => c.name === d.name);
    const costVal = costEntry?.cost ?? 0;
    const members = d.value || 1;
    const pmpm = members > 0 ? costVal / members / 12 : 0;
    return {
      name: d.name,
      color: d.color,
      members: d.value,
      membersPercent: memberPercent,
      cost: costVal,
      costPercent: costEntry?.costPercent ?? 0,
      pmpm,
    };
  });

  const pmpmChartData = riskCombinedData.map((d) => ({
    name: d.name,
    color: d.color,
    pmpm: d.pmpm,
  }));

  const costData = data.costDistribution?.length
    ? data.costDistribution
    : [
        { name: 'Inpatient', value: 38, color: '#0d9488' },
        { name: 'Outpatient', value: 28, color: '#7c3aed' },
        { name: 'Professional', value: 18, color: '#ea580c' },
        { name: 'Pharmacy', value: 12, color: '#eab308' },
        { name: 'Emergency', value: 8, color: '#38bdf8' },
        { name: 'Other', value: 6, color: '#a78bfa' },
      ];

  const totalCostForCategories = typeof totalCost === 'number' ? totalCost : 0;
  const costByCategoryData = costData.map((c) => {
    const percent = c.value;
    const amount = totalCostForCategories * (percent / 100);
    return {
      ...c,
      amount,
      percent,
    };
  });

  /* Bar fill: scale value into 55–100% of track so bars look long and comparable */
  const getBarWidth = (value: number, max: number, minPercent = 55): string => {
    if (value == null || value <= 0 || !max || max <= 0) return '0%';
    const fraction = Math.min(value / max, 1);
    const width = minPercent + fraction * (100 - minPercent);
    return `${Math.round(width)}%`;
  };

  return (
    <section className={styles.section}>
      <div className={styles.topRow}>
        {/* Members analyzed */}
        <div className={styles.statCard}>
          <div className={styles.statMain}>
            <div className={styles.statTitle}>Members Analyzed</div>
            <div className={styles.statValue}>{totalMembers.toLocaleString()}</div>
            <div className={styles.statSub}>8 AI clusters</div>
          </div>
          <div className={styles.statIconWrap} aria-hidden>
            <span className={styles.statIcon}>👥</span>
          </div>
        </div>

        {/* Rising risk members */}
        <div className={styles.risingCard}>
          <div className={styles.risingMain}>
            <div className={styles.risingTitle}>Rising Risk Members</div>
            <div className={styles.risingValue}>{risingRiskMembers.toLocaleString()}</div>
            <div className={styles.risingSub}>{risingRiskPercent.toFixed(0)}% of population</div>
            <div className={styles.risingChip}>
              <span className={styles.risingChipIcon} aria-hidden>↗</span>
              <span>Requires attention</span>
            </div>
          </div>
          <div className={styles.risingIconWrap} aria-hidden>
            <span className={styles.risingIcon}>↗</span>
          </div>
        </div>

        {/* SDOH impacted members */}
        <div className={styles.statCard}>
          <div className={styles.statMain}>
            <div className={styles.statTitle}>SDOH Impacted</div>
            <div className={styles.statValue}>{sdohMembers.toLocaleString()}</div>
            <div className={styles.statSub}>{sdohPercent.toFixed(0)}% with social needs</div>
          </div>
          <div className={styles.statIconWrap} aria-hidden>
            <span className={styles.statIcon}>🏠</span>
          </div>
        </div>

        {/* Utilization Metrics in top panel */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Utilization</h3>
          <div className={styles.utilList}>
            <div className={styles.utilRow}>
              <div className={styles.utilLabel}>
                <span>Admissions / 1k</span>
                <span className={styles.utilValue}>{data.utilizationPatterns.admissionsPer1000}</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: getBarWidth(
                      data.utilizationPatterns.admissionsPer1000,
                      120
                    ),
                    backgroundColor: 'var(--accent)'
                  }}
                />
              </div>
            </div>
            <div className={styles.utilRow}>
              <div className={styles.utilLabel}>
                <span>ED Visits / 1k</span>
                <span className={styles.utilValue}>{data.utilizationPatterns.erVisitsPer1000}</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: getBarWidth(
                      data.utilizationPatterns.erVisitsPer1000,
                      600
                    ),
                    backgroundColor: '#ea580c'
                  }}
                />
              </div>
            </div>
            <div className={styles.utilRow}>
              <div className={styles.utilLabel}>
                <span>Readmission Rate</span>
                <span className={styles.utilValue}>{data.utilizationPatterns.readmissionRate}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: getBarWidth(
                      data.utilizationPatterns.readmissionRate,
                      25,
                      35
                    ),
                    backgroundColor: '#dc2626'
                  }}
                />
              </div>
            </div>
            <div className={styles.utilRow}>
              <div className={styles.utilLabel}>
                <span>Average Length of Stay</span>
                <span className={styles.utilValue}>
                  {typeof data.utilizationPatterns.avgLengthOfStay === 'number'
                    ? data.utilizationPatterns.avgLengthOfStay
                    : '4.3'}
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: getBarWidth(
                      typeof data.utilizationPatterns.avgLengthOfStay === 'number'
                        ? data.utilizationPatterns.avgLengthOfStay
                        : 4.3,
                      8
                    ),
                    backgroundColor: '#2563eb'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Risk Distribution */}
        <div className={styles.card}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>Total members</div>
              <div className={styles.summaryValue}>{totalMembers.toLocaleString()}</div>
            </div>
            {typeof totalCost === 'number' && (
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Total cost</div>
                <div className={styles.summaryValue}>${(totalCost / 1e9).toFixed(2)}B</div>
              </div>
            )}
          </div>
          <div className={styles.chartWrapCombined}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskCombinedData}
                margin={{ top: 8, right: 8, left: 8, bottom: 32 }}
                barCategoryGap="20%"
                barSize={40}
              >
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tick={{ fill: 'var(--text-muted)' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  width={70}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  width={70}
                  tickFormatter={(val: number) => `$${(val / 1e6).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val: number, name: string, props) => {
                    const payload = props?.payload as {
                      membersPercent?: number;
                      costPercent?: number;
                    };
                    if (name === 'members') {
                      const pct = payload?.membersPercent ?? 0;
                      return [`${val.toLocaleString()} members (${pct.toFixed(1)}%)`, 'Members'];
                    }
                    const pct = payload?.costPercent ?? 0;
                    return [`$${(val / 1e6).toFixed(1)}M (${pct.toFixed(1)}%)`, 'Cost'];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="members"
                  radius={[4, 4, 0, 0]}
                  label={({ x, y, width, height, value, index }) => {
                    const pct = riskCombinedData[index].membersPercent ?? 0;
                    const centerX = (x ?? 0) + (width ?? 0) / 2;
                    const topY = (y ?? 0) - 6;
                    const insideY = (y ?? 0) + (height ?? 0) / 2;
                    return (
                      <>
                        <text
                          x={centerX}
                          y={topY}
                          textAnchor="middle"
                          fill="#374151"
                          fontSize={10}
                        >
                          {`${pct.toFixed(1)}%`}
                        </text>
                        <text
                          x={centerX}
                          y={insideY}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={10}
                        >
                          {Number(value).toLocaleString()}
                        </text>
                      </>
                    );
                  }}
                >
                  {riskCombinedData.map((entry, index) => (
                    <Cell key={`members-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar
                  yAxisId="right"
                  dataKey="cost"
                  radius={[4, 4, 0, 0]}
                  opacity={0.7}
                  label={({ x, y, width, height, value, index }) => {
                    const pct = riskCombinedData[index].costPercent ?? 0;
                    const centerX = (x ?? 0) + (width ?? 0) / 2;
                    const topY = (y ?? 0) - 6;
                    const insideY = (y ?? 0) + (height ?? 0) / 2;
                    return (
                      <>
                        <text
                          x={centerX}
                          y={topY}
                          dy={-10}
                          textAnchor="middle"
                          fill="#6b7280"
                          fontSize={10}
                        >
                          {`${pct.toFixed(1)}%`}
                        </text>
                        <text
                          x={centerX}
                          y={insideY}
                          dy={10}
                          textAnchor="middle"
                          fill="#111827"
                          fontSize={10}
                        >
                          {`$${(Number(value) / 1e6).toFixed(1)}M`}
                        </text>
                      </>
                    );
                  }}
                >
                  {riskCombinedData.map((entry, index) => (
                    <Cell key={`cost-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartCaption}>
            Member and cost distribution across risk categories
          </div>
          <div className={styles.legend}>
            {riskData.map((d) => (
              <div key={d.name} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Cost across service categories – horizontal bar */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Cost across service categories</h3>
          <div className={styles.chartWrapHoriz}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={costByCategoryData}
                margin={{ top: 4, right: 60, left: 4, bottom: 4 }}
              >
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <XAxis type="number" hide />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val: number, _name, props) => {
                    const pct = (props?.payload as { percent?: number })?.percent ?? 0;
                    return [`$${(val / 1e6).toFixed(1)}M (${pct}%)`, 'Cost'];
                  }}
                />
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 4, 4]}
                  barSize={16}
                  label={({ x, y, width, height, value, index }) => {
                    const pct = costByCategoryData[index].percent ?? 0;
                    const labelX = (x ?? 0) + (width ?? 0) + 6;
                    const labelY = (y ?? 0) + (height ?? 0) / 2 + 4;
                    return (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="start"
                        fill="#374151"
                        fontSize={11}
                        fontWeight={500}
                      >
                        {`$${(Number(value) / 1e6).toFixed(0)}M · ${pct}%`}
                      </text>
                    );
                  }}
                >
                  {costByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PMPM across risk categories – horizontal bar */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>PMPM across risk categories</h3>
          <div className={styles.chartWrapHorizSmall}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={pmpmChartData}
                margin={{ top: 4, right: 60, left: 4, bottom: 4 }}
              >
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <XAxis type="number" hide />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, 'PMPM']}
                />
                <Bar
                  dataKey="pmpm"
                  radius={[4, 4, 4, 4]}
                  barSize={18}
                  label={({ x, y, width, height, value }) => {
                    const labelX = (x ?? 0) + (width ?? 0) + 8;
                    const labelY = (y ?? 0) + (height ?? 0) / 2 + 4;
                    return (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="start"
                        fill="#374151"
                        fontSize={12}
                        fontWeight={600}
                      >
                        {`$${Number(value).toFixed(0)}`}
                      </text>
                    );
                  }}
                >
                  {pmpmChartData.map((entry, index) => (
                    <Cell key={`pmpm-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
