import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { executePrompt } from '../api/client';
import { startExecution, executionSuccess, executionError } from '../store/promptSlice';
import { setPromptPanelOpen } from '../store/dashboardSlice';
import { PROMPTS, PROMPT_CATEGORIES, type PromptItem } from '../types/dashboard';
import styles from './PromptLibrary.module.css';

const CATEGORY_ORDER: (keyof typeof PROMPT_CATEGORIES)[] = ['financial', 'opportunity', 'provider', 'executive'];

export function PromptLibrary() {
  const dispatch = useDispatch();
  const mutation = useMutation({
    mutationFn: (payload: { promptId: string; promptText: string }) =>
      executePrompt({ promptId: payload.promptId, promptText: payload.promptText }),
    onMutate: (vars) => {
      dispatch(startExecution({ promptId: vars.promptId, promptText: vars.promptText }));
    },
    onSuccess: (data) => {
      dispatch(executionSuccess(data.response ?? ''));
    },
    onError: (err: Error) => {
      dispatch(executionError(err.message));
    },
  });

  const runPrompt = (item: PromptItem) => {
    mutation.mutate({ promptId: item.id, promptText: item.promptText });
  };

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: PROMPT_CATEGORIES[cat],
    prompts: PROMPTS.filter((p) => p.category === cat),
  }));

  const closePanel = () => dispatch(setPromptPanelOpen(false));

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.panelTitle}>Prompt Library</h2>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={closePanel}
          aria-label="Close prompt library"
          title="Close"
        >
          ×
        </button>
      </div>
      <p className={styles.hint}>Click a prompt to run it. Results appear in the execution panel below.</p>
      {byCategory.map(({ category, label, prompts }) => (
        <div key={category} className={styles.category}>
          <h3 className={styles.categoryTitle}>{label}</h3>
          <ul className={styles.list}>
            {prompts.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.promptBtn}
                  onClick={() => runPrompt(item)}
                  disabled={mutation.isPending}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
