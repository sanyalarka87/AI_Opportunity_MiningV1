import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setPanelVisible, resetExecution } from '../store/promptSlice';
import styles from './PromptExecutionPanel.module.css';

export function PromptExecutionPanel() {
  const dispatch = useDispatch();
  const { status, request, response, error, visible } = useSelector((s: RootState) => s.prompt);

  if (!visible && status === 'idle') return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Prompt execution</h3>
        <button type="button" className={styles.closeBtn} onClick={() => dispatch(setPanelVisible(false))} aria-label="Close">
          ×
        </button>
      </div>
      <div className={styles.body}>
        {request && (
          <div className={styles.section}>
            <strong>Request</strong>
            <pre className={styles.pre}>{request.promptText}</pre>
          </div>
        )}
        {status === 'loading' && (
          <div className={styles.loading}>Running prompt…</div>
        )}
        {status === 'error' && error && (
          <div className={styles.section}>
            <strong className={styles.errorLabel}>Error</strong>
            <p className={styles.error}>{error}</p>
          </div>
        )}
        {status === 'success' && response && (
          <div className={styles.section}>
            <strong>Response</strong>
            <div className={styles.response}>{response}</div>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <button type="button" className={styles.btnSecondary} onClick={() => dispatch(resetExecution())}>
          Clear
        </button>
      </div>
    </div>
  );
}
