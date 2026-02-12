import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Segment, getSegmentsList, getDashboardMetrics } from '../../api/client';
import type { DashboardMetrics } from '../../types/dashboard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleComparedSegment } from '../../store/segmentationSlice';
import styles from './SegmentsList.module.css';

function formatCost(dollars: number): string {
  if (dollars >= 1e6) return `$${(dollars / 1e6).toFixed(1)}M`;
  if (dollars >= 1e3) return `$${(dollars / 1e3).toFixed(0)}k`;
  return `$${Math.round(dollars)}`;
}

type PriorityTier = 'High' | 'Medium' | 'Low';

function computePriorityTier(rank: number, total: number): PriorityTier {
  const third = Math.ceil(total / 3);
  if (rank < third) return 'High';
  if (rank < third * 2) return 'Medium';
  return 'Low';
}

export const SegmentsList: React.FC = () => {
  const navigate = useNavigate();
  const filters = useSelector((state: RootState) => state.segmentation.filters);
  const comparisonMode = useSelector((state: RootState) => state.segmentation.comparisonMode);
  const comparedSegmentIds = useSelector((state: RootState) => state.segmentation.comparedSegmentIds);
  const dispatch = useDispatch();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboardMetrics', {}],
    queryFn: () => getDashboardMetrics({}),
  });
  const planPmpm = (dashboardData as DashboardMetrics | undefined)?.organizational?.pmpm ?? 920;

  useEffect(() => {
    setLoading(true);
    getSegmentsList(filters as Record<string, string>)
      .then(setSegments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const handleClick = (segmentId: string) => {
    if (comparisonMode) {
      dispatch(toggleComparedSegment(segmentId));
    } else {
      navigate(`/segmentation/segment/${segmentId}`);
    }
  };

  const sortedSegmentsWithPriority = useMemo(() => {
    const confidence = (s: Segment) => s.confidenceScore ?? 0.5;
    const score = (s: Segment) => s.potentialSavings * confidence(s);
    const sorted = [...segments].sort((a, b) => score(b) - score(a));
    return sorted.map((segment, index) => ({
      segment,
      priority: computePriorityTier(index, sorted.length),
    }));
  }, [segments]);

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loading}>Loading segments…</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>AI Identified Segments</h2>
        <p className={styles.subtitle}>Segments prioritized by risk and opportunity</p>
      </div>
      <ul className={styles.list}>
        {sortedSegmentsWithPriority.map(({ segment, priority }) => {
          const isCompared = comparedSegmentIds.includes(segment.id);

          return (
            <li
              key={segment.id}
              className={styles.item}
              onClick={() => handleClick(segment.id)}
            >
              <div className={styles.itemContent}>
                <div className={styles.itemMain}>
                  {comparisonMode && (
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isCompared}
                      onChange={() => dispatch(toggleComparedSegment(segment.id))}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Compare ${segment.name}`}
                    />
                  )}
                  <div className={styles.itemMainContent}>
                    <h3 className={styles.itemName}>{segment.name}</h3>
                    <p className={styles.itemDesc}>{segment.description}</p>
                    <div className={styles.tags}>
                      {segment.riskCharacteristics.slice(0, 2).map((rc) => (
                        <span key={rc} className={styles.tag}>
                          {rc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.itemMeta}>
                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <label>Members</label>
                      <div className={styles.metaValue}>{segment.memberCount.toLocaleString()}</div>
                    </div>
                    <div className={styles.metaItem}>
                      <label>Total cost</label>
                      <div className={styles.metaValue}>
                        {formatCost(segment.totalCost ?? segment.memberCount * segment.pmpm * 12)}
                      </div>
                    </div>
                    <div className={styles.metaItem}>
                      <label>Cluster PMPM vs plan PMPM</label>
                      <div className={styles.metaValue}>
                        ${segment.pmpm.toLocaleString()} vs ${planPmpm.toLocaleString()}
                      </div>
                    </div>
                    <div className={styles.metaItem}>
                      <label>Est. net savings</label>
                      <div className={`${styles.metaValue} ${styles.savings}`}>
                        {formatCost(segment.potentialSavings)}
                      </div>
                    </div>
                    <div className={styles.metaItem}>
                      <label>Priority</label>
                      <div className={`${styles.metaValue} ${styles[`priority${priority}`]}`}>
                        {priority}
                      </div>
                    </div>
                    <div className={styles.metaItem}>
                      <label>Confidence score</label>
                      <div className={styles.metaValue}>
                        {segment.confidenceScore != null
                          ? `${(segment.confidenceScore <= 1 ? segment.confidenceScore * 100 : segment.confidenceScore).toFixed(0)}%`
                          : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
