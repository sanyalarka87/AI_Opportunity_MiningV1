import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSegmentationFilters } from '../store/segmentationSlice';
import { FilterBar } from '../components/FilterBar';
import { PopulationMetrics } from '../components/Segmentation/PopulationMetrics';
import { SegmentsList } from '../components/Segmentation/SegmentsList';
import { RootState } from '../store';
import styles from './SegmentationPage.module.css';

export const SegmentationPage: React.FC = () => {
  const dispatch = useDispatch();
  const dashboardFilters = useSelector((state: RootState) => state.dashboard.filters);

  useEffect(() => {
    dispatch(setSegmentationFilters({
      lob: dashboardFilters.lob,
      geography: dashboardFilters.geography,
      timePeriod: dashboardFilters.timePeriod
    }));
  }, [dispatch, dashboardFilters]);

  return (
    <>
      <FilterBar />
      <div className={styles.page}>
        <main className={styles.main}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>AI Segmentation</h1>
            <p className={styles.pageSubtitle}>Population & risk groups — explore AI-identified segments and metrics</p>
          </header>
          <div className={styles.metricsSection}>
            <PopulationMetrics />
          </div>
          <div className={styles.listSection}>
            <SegmentsList />
          </div>
        </main>
      </div>
    </>
  );
};
