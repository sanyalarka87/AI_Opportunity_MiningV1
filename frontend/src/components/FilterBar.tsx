import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { getFilterOptions } from '../api/client';
import { setFilters } from '../store/dashboardSlice';
import type { RootState } from '../store';
import type { DashboardFilters } from '../store/dashboardSlice';
import styles from './FilterBar.module.css';

export function FilterBar() {
  const dispatch = useDispatch();
  const filters = useSelector((s: RootState) => s.dashboard.filters);
  const { data: options, isLoading } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: getFilterOptions,
  });

  const handleChange = (key: keyof DashboardFilters, value: string) => {
    dispatch(setFilters({ [key]: value }));
  };

  if (isLoading || !options) {
    return (
      <div className={styles.bar}>
        <span className={styles.loading}>Loading filters…</span>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <span className={styles.filtersLabel}>
        <span className={styles.filtersIcon} aria-hidden>☰</span>
        Filters
      </span>
      <label className={styles.label}>
        <span className={styles.labelText}>Start Date</span>
        <input
          type="date"
          className={styles.input}
          value="2024-01-01"
          onChange={() => {}}
        />
      </label>
      <label className={styles.label}>
        <span className={styles.labelText}>End Date</span>
        <input
          type="date"
          className={styles.input}
          value="2024-12-31"
          onChange={() => {}}
        />
      </label>
      <label className={styles.label}>
        <span className={styles.labelText}>Region</span>
        <select
          value={filters.geography}
          onChange={(e) => handleChange('geography', e.target.value)}
          className={styles.select}
        >
          <option value="">All regions</option>
          {options.geography.map((o: string) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className={styles.label}>
        <span className={styles.labelText}>Line of Business</span>
        <select
          value={filters.lob}
          onChange={(e) => handleChange('lob', e.target.value)}
          className={styles.select}
        >
          <option value="">All</option>
          {options.lob.map((o: string) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
