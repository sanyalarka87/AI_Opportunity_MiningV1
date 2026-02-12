import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { setChatOverlayOpen } from './store/dashboardSlice';
import { Sidebar } from './components/Sidebar';
import { ChatOverlay } from './components/ChatOverlay';
import { PromptExecutionPanel } from './components/PromptExecutionPanel';
import { DashboardPage } from './pages/DashboardPage';
import { OpportunitiesListPage } from './pages/OpportunitiesListPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { CreateOpportunityPage } from './pages/CreateOpportunityPage';
import { SegmentationPage } from './pages/SegmentationPage';
import { SegmentDetailPage } from './pages/SegmentDetailPage';
import styles from './App.module.css';

function App() {
  const dispatch = useDispatch();
  const chatOverlayOpen = useSelector((s: RootState) => s.dashboard.chatOverlayOpen);

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.content}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/opportunities" element={<OpportunitiesListPage />} />
          <Route path="/opportunities/new" element={<CreateOpportunityPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="/segmentation" element={<SegmentationPage />} />
          <Route path="/segmentation/segment/:id" element={<SegmentDetailPage />} />
        </Routes>
      </div>

      {chatOverlayOpen && (
        <ChatOverlay onClose={() => dispatch(setChatOverlayOpen(false))} />
      )}

      <PromptExecutionPanel />
    </div>
  );
}

export default App;
