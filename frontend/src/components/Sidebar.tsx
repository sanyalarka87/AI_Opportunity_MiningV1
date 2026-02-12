import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setChatOverlayOpen, setPromptPanelOpen } from '../store/dashboardSlice';
import { ExportActions } from './ExportActions';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { id: string; path: string; label: string; sub: string; icon: string }[] = [
  { id: 'dashboard', path: '/', label: 'Executive Dashboard', sub: 'Key metrics & trends', icon: 'grid' },
  { id: 'opportunities', path: '/opportunities', label: 'Opportunities', sub: 'Margin improvement pipeline', icon: 'bulb' },
  { id: 'segmentation', path: '/segmentation', label: 'AI Segmentation', sub: 'Population & risk groups', icon: 'users' },
];

function Icon({ name }: { name: string }) {
  if (name === 'grid') {
    return (
      <span className={styles.iconGrid} aria-hidden>
        <span /><span /><span /><span />
      </span>
    );
  }
  if (name === 'bulb') return <span className={styles.iconBulb} aria-hidden>💡</span>;
  if (name === 'users') return <span className={styles.iconUsers} aria-hidden>👥</span>;
  return <span aria-hidden>•</span>;
}

export function Sidebar({ memberCount = '652,847', lastUpdated = 'Jan 15, 2025' }: { memberCount?: string; lastUpdated?: string }) {
  const dispatch = useDispatch();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => (isActive ? styles.navItemActive : styles.navItem)}
            end={item.path === '/'}
          >
            <Icon name={item.icon} />
            <div className={styles.navText}>
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navSub}>{item.sub}</span>
            </div>
          </NavLink>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.sidebarBtn} onClick={() => dispatch(setPromptPanelOpen(true))}>
          Prompt Library
        </button>
        <button type="button" className={styles.sidebarBtnPrimary} onClick={() => dispatch(setChatOverlayOpen(true))}>
          AI Assistant
        </button>
        <ExportActions />
      </div>

      <div className={styles.footer}>
        <div className={styles.dataCoverage}>
          <span className={styles.dataLabel}>Data Coverage</span>
          <span className={styles.dataValue}>{memberCount} Members</span>
          <span className={styles.dataUpdated}>Last updated: {lastUpdated}</span>
        </div>
      </div>
    </aside>
  );
}
