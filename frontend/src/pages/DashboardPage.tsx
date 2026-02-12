import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { FilterBar } from '../components/FilterBar';
import { Dashboard } from '../components/Dashboard';
import { PromptLibrary } from '../components/PromptLibrary';
import styles from '../App.module.css';

export function DashboardPage() {
  const promptPanelOpen = useSelector((s: RootState) => s.dashboard.promptPanelOpen);

  return (
    <>
      <FilterBar />
      <main className={styles.main}>
        <Dashboard />
        {promptPanelOpen && (
          <aside className={styles.promptLibrary}>
            <PromptLibrary />
          </aside>
        )}
      </main>
    </>
  );
}
