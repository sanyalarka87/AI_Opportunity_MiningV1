import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, Treemap } from 'recharts';
import { getOpportunities, getDashboardMetrics } from '../api/client';
import type { Opportunity } from '../api/client';
import type { DashboardMetrics } from '../types/dashboard';
import styles from './OpportunitiesListPage.module.css';

const LIGHT_FILLS = ['#fee2e2', '#ffedd5', '#ede9fe', '#e0f2fe', '#dcfce7', '#f3f4f6'];

function CustomTreemapContent(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  fill?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', value = 0, fill = '#f3f4f6' } = props;
  if (width <= 0 || height <= 0) return null;
  const valueNum = typeof value === 'number' ? value : Number(value);
  const textColor = '#111827';
  const textStyle = { fill: textColor, stroke: 'none', strokeWidth: 0 };
  return (
    <g fill="none" stroke="none">
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#e5e7eb" strokeWidth={1} />
      <text
        x={x + width / 2}
        y={y + height / 2 - 10}
        textAnchor="middle"
        fill={textColor}
        stroke="none"
        strokeWidth={0}
        style={textStyle}
        fontSize={12}
        fontWeight={600}
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 8}
        textAnchor="middle"
        fill={textColor}
        stroke="none"
        strokeWidth={0}
        style={textStyle}
        fontSize={13}
      >
        {`$${valueNum.toFixed(2)}M`}
      </text>
    </g>
  );
}

const STATUS_OPTIONS = ['', 'identified', 'under_review', 'approved', 'declined', 'in_execution'];
const PRIORITY_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All priorities' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];
const LOB_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All LOBs' },
  { value: 'Medicare Advantage', label: 'Medicare Advantage' },
  { value: 'Medicaid', label: 'Medicaid' },
  { value: 'Commercial', label: 'Commercial' },
];

type Priority = 'High' | 'Medium' | 'Low';

const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

function getPriority(confidenceScore: number, estimatedSavings: number): Priority {
  const highConfidence = confidenceScore >= 0.8;
  const highSavings = estimatedSavings >= 1_500_000; // $1.5M+
  const lowConfidence = confidenceScore < 0.75;
  const lowSavings = estimatedSavings < 1_000_000;  // under $1M
  if (highConfidence && highSavings) return 'High';
  if (lowConfidence || lowSavings) return 'Low';
  return 'Medium';
}

const SUMMARY_CARD_ICONS = {
  identified: '💰',
  addressable: '⚡',
  savings: '💵',
  members: '👥',
  mlr: '📈',
} as const;

export function OpportunitiesListPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [lobFilter, setLobFilter] = useState('');
  const { data: rawList = [], isLoading, isError, error } = useQuery({
    queryKey: ['opportunities', status, search],
    queryFn: () => getOpportunities({ status: status || undefined, search: search || undefined }),
  });
  const { data: metrics } = useQuery({
    queryKey: ['dashboardMetrics', {}],
    queryFn: () => getDashboardMetrics({}),
  });

  const summary = useMemo(() => {
    if (!metrics) return null;
    const m = metrics as DashboardMetrics;
    const org = m.organizational;
    const opp = m.opportunity;
    const projectedCost = org.totalMedicalCost - opp.realizable;
    const projectedMlr = org.totalRevenue > 0 ? (projectedCost / org.totalRevenue) * 100 : org.mlr;
    const addressablePct = opp.totalIdentified > 0 ? ((opp.addressable / opp.totalIdentified) * 100).toFixed(0) : '80';
    const realizationPct = opp.addressable > 0 ? ((opp.realizable / opp.addressable) * 100).toFixed(0) : '50';
    return {
      identifiedM: opp.totalIdentified / 1e6,
      addressableM: opp.addressable / 1e6,
      savingsM: opp.realizable / 1e6,
      affectedMembers: opp.affectedMembers ?? Math.round(org.totalMembers * 0.15),
      projectedMlr,
      currentMlr: org.mlr,
      targetMlr: org.mlrTarget ?? 85,
      addressablePct,
      realizationPct,
    };
  }, [metrics]);

  const list = useMemo(() => {
    let filtered = rawList;
    if (priorityFilter) {
      filtered = filtered.filter(
        (o) => getPriority(o.confidenceScore, o.estimatedSavings) === priorityFilter
      );
    }
    if (lobFilter) {
      filtered = filtered.filter((o) => o.lob?.includes(lobFilter));
    }
    return [...filtered].sort((a, b) => {
      const orderA = PRIORITY_ORDER[getPriority(a.confidenceScore, a.estimatedSavings)];
      const orderB = PRIORITY_ORDER[getPriority(b.confidenceScore, b.estimatedSavings)];
      return orderA - orderB;
    });
  }, [rawList, priorityFilter, lobFilter]);

  const heatmapData = useMemo(
    () =>
      list.map((o, i) => ({
        name: o.title,
        value: o.estimatedSavings / 1e6,
        fill: LIGHT_FILLS[i % LIGHT_FILLS.length],
      })),
    [list]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Opportunities</h1>
        <p className={styles.subtitle}>Margin improvement pipeline</p>
        <div className={styles.actions}>
          <input
            type="search"
            placeholder="Search opportunities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.select}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by priority"
          >
            {PRIORITY_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={lobFilter}
            onChange={(e) => setLobFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by LOB"
          >
            {LOB_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Link to="/opportunities/new" className={styles.createBtn}>
            Create opportunity
          </Link>
        </div>
      </div>

      {summary && (
        <section className={styles.summarySection} aria-label="Opportunity summary">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <span className={styles.summaryIcon} style={{ background: 'rgba(22, 163, 74, 0.2)' }} aria-hidden>
                  {SUMMARY_CARD_ICONS.identified}
                </span>
                <span className={styles.summaryInfo} title="Total identified opportunity">i</span>
              </div>
              <div className={styles.summaryValue}>${summary.identifiedM.toFixed(1)}M</div>
              <div className={styles.summaryLabel}>Identified opportunity</div>
              <div className={styles.summarySub}>Total pipeline in $M</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <span className={styles.summaryIcon} style={{ background: 'rgba(245, 158, 11, 0.2)' }} aria-hidden>
                  {SUMMARY_CARD_ICONS.addressable}
                </span>
                <span className={styles.summaryInfo} title="Addressable share of identified">i</span>
              </div>
              <div className={styles.summaryValue}>${summary.addressableM.toFixed(2)}M</div>
              <div className={styles.summaryLabel}>Addressable opportunity</div>
              <div className={styles.summarySub}>{summary.addressablePct}% of identified</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <span className={styles.summaryIcon} style={{ background: 'rgba(22, 163, 74, 0.2)' }} aria-hidden>
                  {SUMMARY_CARD_ICONS.savings}
                </span>
                <span className={styles.summaryInfo} title="After realization rate">i</span>
              </div>
              <div className={styles.summaryValue}>${summary.savingsM.toFixed(1)}M</div>
              <div className={styles.summaryLabel}>Potential net savings</div>
              <div className={styles.summarySub}>After realization rate ({summary.realizationPct}%)</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <span className={styles.summaryIcon} style={{ background: 'rgba(14, 165, 233, 0.2)' }} aria-hidden>
                  {SUMMARY_CARD_ICONS.members}
                </span>
                <span className={styles.summaryInfo} title="Unique members with opportunities">i</span>
              </div>
              <div className={styles.summaryValue}>
                {summary.affectedMembers >= 1000
                  ? `${(summary.affectedMembers / 1000).toFixed(0)}K`
                  : summary.affectedMembers.toLocaleString()}
              </div>
              <div className={styles.summaryLabel}>Affected members</div>
              <div className={styles.summarySub}>Unique members with opportunities</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <span className={styles.summaryIcon} style={{ background: 'rgba(234, 88, 12, 0.2)' }} aria-hidden>
                  {SUMMARY_CARD_ICONS.mlr}
                </span>
                <span className={styles.summaryInfo} title="If estimated savings realized">i</span>
              </div>
              <div className={styles.summaryValue}>{summary.projectedMlr.toFixed(1)}%</div>
              <div className={styles.summaryLabel}>Projected MLR</div>
              <div className={styles.summarySub}>
                Current: {summary.currentMlr}% | Target: {summary.targetMlr}%
              </div>
            </div>
          </div>
        </section>
      )}

      {heatmapData.length > 0 && (
        <section className={styles.heatmapSection} aria-label="Opportunity heatmap by savings">
          <h2 className={styles.heatmapTitle}>Opportunity Heatmap by Savings</h2>
          <div className={styles.heatmapWrap}>
            <ResponsiveContainer width="100%" height={320}>
              <Treemap
                data={heatmapData}
                dataKey="value"
                nameKey="name"
                type="flat"
                stroke="#e5e7eb"
                strokeWidth={1}
                content={<CustomTreemapContent />}
              />
            </ResponsiveContainer>
          </div>
          <div className={styles.heatmapLegend}>
            {heatmapData.map((item) => (
              <span
                key={item.name}
                className={styles.heatmapLegendItem}
                style={{ borderColor: item.fill, backgroundColor: item.fill, color: '#000' }}
              >
                {item.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {isLoading && <div className={styles.loading}>Loading…</div>}
      {isError && <div className={styles.error}>Error: {(error as Error).message}</div>}
      {!isLoading && !isError && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>LOB</th>
                <th>Confidence</th>
                <th>Est. savings</th>
                <th>Complexity</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((o: Opportunity) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/opportunities/${o.id}`} className={styles.link}>
                      {o.title}
                    </Link>
                  </td>
                  <td>
                    <span className={styles[`priority_${getPriority(o.confidenceScore, o.estimatedSavings).toLowerCase()}`] ?? styles.priority}>
                      {getPriority(o.confidenceScore, o.estimatedSavings)}
                    </span>
                  </td>
                  <td>
                    {o.lob && o.lob.length > 0 ? (
                      <span className={styles.lobList}>
                        {o.lob.join(', ')}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{(o.confidenceScore * 100).toFixed(0)}%</td>
                  <td>${(o.estimatedSavings / 1e6).toFixed(2)}M</td>
                  <td>{o.implementationComplexity}</td>
                  <td>
                    <span className={styles[`status_${o.status}`] ?? styles.status}>{o.status.replace('_', ' ')}</span>
                  </td>
                  <td>{new Date(o.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/opportunities/${o.id}`} className={styles.viewLink}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <p className={styles.empty}>No opportunities match your filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
