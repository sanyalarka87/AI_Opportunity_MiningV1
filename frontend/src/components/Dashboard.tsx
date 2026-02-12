import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getDashboardMetrics } from '../api/client';
import type { DashboardMetrics } from '../types/dashboard';
import styles from './Dashboard.module.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PLAN_NAME = 'Presbyterian Health Plan';

const TEAL = '#0d9488';
const PURPLE = '#7c3aed';
const ORANGE = '#ea580c';
const BLUE = '#38bdf8';

export function Dashboard() {
  const filterState = useSelector((s: RootState) => s.dashboard.filters);
  const queryParams = useMemo(() => ({
    lob: filterState.lob || undefined,
    timePeriod: filterState.timePeriod || undefined,
    geography: filterState.geography || undefined,
    segment: filterState.segment || undefined,
  }), [filterState]);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardMetrics', queryParams],
    queryFn: () => getDashboardMetrics(queryParams as Record<string, string>),
  });

  if (isLoading) return <div className={styles.loading}>Loading dashboard…</div>;
  if (isError) return <div className={styles.error}>Error: {(error as Error).message}</div>;
  if (!data) return null;

  const m = data as DashboardMetrics;
  const org = m.organizational;
  const opp = m.opportunity;
  const trend = m.trend;
  const costDist = m.costDistribution || [];

  const lineData = trend.rolling12MonthMlr.map((v, i) => ({
    month: MONTHS[i],
    mlr: v,
    pmpm: trend.rolling12MonthPmpm[i],
  }));

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>
        Key performance metrics and trends for {PLAN_NAME}
      </h1>

      <section className={styles.kpiSection}>
        <div className={styles.kpiGrid}>
          <KpiCard
            icon="members"
            label="TOTAL MEMBERS"
            value={org.totalMembers.toLocaleString()}
            sub="Enrolled population"
          />
          <KpiCard
            icon="cost"
            label="TOTAL COST"
            value={`$${(org.totalMedicalCost / 1e9).toFixed(2)}B`}
            sub="Annual spend"
            changePercent={org.costChangePercent}
          />
          <KpiCard
            icon="revenue"
            label="TOTAL REVENUE"
            value={`$${(org.totalRevenue / 1e9).toFixed(2)}B`}
            sub="Premium revenue"
            changePercent={org.revenueChangePercent}
          />
          <KpiCard
            icon="pmpm"
            label="AVERAGE PMPM"
            value={`$${org.pmpm}`}
            sub="Per member per month"
            changePercent={org.pmpmChangePercent}
          />
          <KpiCard
            icon="mlr"
            label="MEDICAL LOSS RATIO"
            value={`${org.mlr}%`}
            sub={org.mlrAboveTarget != null && org.mlrTarget != null
              ? `${org.mlrAboveTarget} pts above Target: ${org.mlrTarget}%`
              : 'Target: 85%'}
            subHighlight={!!(org.mlrAboveTarget != null && org.mlrAboveTarget > 0)}
          />
        </div>
      </section>

      <section className={styles.utilizationSection}>
        <div className={styles.utilizationCard}>
          <h3 className={styles.utilizationTitle}>Opportunity Pipeline</h3>
          <div className={styles.utilizationGrid}>
            <div className={styles.utilizationItem}>
              <div className={styles.utilizationValue} style={{ color: TEAL }}>
                ${(opp.totalIdentified / 1e6).toFixed(0)}M
              </div>
              <div className={styles.utilizationLabel}>Total Identified</div>
            </div>
            <div className={styles.utilizationItem}>
              <div className={styles.utilizationValue} style={{ color: BLUE }}>
                ${(opp.addressable / 1e6).toFixed(0)}M
              </div>
              <div className={styles.utilizationLabel}>
                Addressable ({((opp.addressable / opp.totalIdentified) * 100).toFixed(0)}%)
              </div>
            </div>
            <div className={styles.utilizationItem}>
              <div className={styles.utilizationValue} style={{ color: PURPLE }}>
                ${(opp.realizable / 1e6).toFixed(0)}M
              </div>
              <div className={styles.utilizationLabel}>
                Realizable ({((opp.realizable / opp.totalIdentified) * 100).toFixed(0)}%)
              </div>
            </div>
            <div className={styles.utilizationItem}>
              <div className={styles.utilizationValue} style={{ color: ORANGE }}>
                ${(opp.realized / 1e6).toFixed(0)}M
              </div>
              <div className={styles.utilizationLabel}>
                Realized ({((opp.realized / opp.totalIdentified) * 100).toFixed(0)}%)
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.utilizationSection}>
        <div className={styles.utilizationCard}>
          <h3 className={styles.utilizationTitle}>Utilization Metrics</h3>
          <div className={styles.utilizationGrid}>
            <div className={styles.utilizationItem}>
              <div className={styles.utilizationValue} style={{ color: TEAL }}>
                {m.costUtilization.edVisitsPer1000}
              </div>
              <div className={styles.utilizationLabel}>ED Visits per 1,000</div>
            </div>
            <div className={styles.utilizationItem}>
              <div className={styles.utilizationValue} style={{ color: PURPLE }}>
                {m.costUtilization.admissionsPer1000}
              </div>
              <div className={styles.utilizationLabel}>Admissions per 1,000</div>
            </div>
            <div className={styles.utilizationItem}>
              <div className={styles.utilizationValue} style={{ color: ORANGE }}>
                {m.costUtilization.readmissionRate}%
              </div>
              <div className={styles.utilizationLabel}>30-Day Readmission Rate</div>
            </div>
            <div className={styles.utilizationItem}>
              <div className={styles.utilizationValue} style={{ color: BLUE }}>
                {m.costUtilization.avgLengthOfStay}
              </div>
              <div className={styles.utilizationLabel}>Average Length of Stay</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>MLR & PMPM Trends</h2>
          <p className={styles.chartSubtitle}>12-month rolling performance</p>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} domain={[85, 92]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#111827' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="mlr" name="MLR %" stroke={TEAL} strokeWidth={2} dot={{ fill: TEAL }} />
                <Line yAxisId="right" type="monotone" dataKey="pmpm" name="PMPM Cost" stroke={PURPLE} strokeWidth={2} dot={{ fill: PURPLE }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Cost Distribution</h2>
          <p className={styles.chartSubtitle}>By service category</p>
          <div className={styles.chartDonut}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart margin={{ top: 16, right: 80, bottom: 16, left: 80 }}>
                <Pie
                  data={costDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={1}
                  label={({ name, percent }) => (percent != null ? `${name} ${(percent * 100).toFixed(0)}%` : name)}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {costDist.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  changePercent,
  subHighlight,
}: {
  icon: 'members' | 'cost' | 'revenue' | 'pmpm' | 'mlr' | 'opportunities';
  label: string;
  value: string;
  sub: string;
  changePercent?: number;
  subHighlight?: boolean;
}) {
  const iconColor = icon === 'members' ? TEAL : icon === 'cost' ? TEAL : icon === 'revenue' ? '#2563eb' : icon === 'pmpm' ? PURPLE : icon === 'mlr' ? ORANGE : BLUE;
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiCardHeader}>
        <span className={styles.kpiIcon} style={{ background: iconColor }} aria-hidden>
          {icon === 'members' && '👥'}
          {icon === 'cost' && '💰'}
          {icon === 'revenue' && '🏦'}
          {icon === 'pmpm' && '📊'}
          {icon === 'mlr' && '📈'}
          {icon === 'opportunities' && '💡'}
        </span>
        <span className={styles.kpiInfo} title="More information">i</span>
      </div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiSub}>
        {changePercent != null && (
          <span className={changePercent >= 0 ? styles.trendUp : styles.trendDown}>
            {changePercent >= 0 ? '↑' : '↓'} {Math.abs(changePercent)}%
          </span>
        )}{' '}
        <span className={subHighlight ? styles.subHighlight : undefined}>{sub}</span>
      </div>
    </div>
  );
}
