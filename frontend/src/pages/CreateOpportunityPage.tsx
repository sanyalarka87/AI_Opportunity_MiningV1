import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { plannerSuggest, createOpportunity } from '../api/client';
import { FormattedMarkdown } from '../components/FormattedMarkdown';
import styles from './CreateOpportunityPage.module.css';

type PlannerSuggested = {
  title?: string;
  description?: string;
  analysisDescription?: string | null;
  estimatedSavings?: number;
  implementationComplexity?: string;
  confidenceScore?: number;
  tags?: string[];
  lob?: string[];
};

export function CreateOpportunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [plannerMessage, setPlannerMessage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [analysisDescription, setAnalysisDescription] = useState('');
  const [editAnalysisRaw, setEditAnalysisRaw] = useState(false);
  const [editDescriptionRaw, setEditDescriptionRaw] = useState(false);
  const [estimatedSavings, setEstimatedSavings] = useState('');
  const [complexity, setComplexity] = useState('medium');

  const suggestMutation = useMutation({
    mutationFn: () => plannerSuggest(plannerMessage || 'Suggest a new margin improvement opportunity'),
    onSuccess: (data: { suggested?: PlannerSuggested }) => {
      const s = data.suggested;
      if (s) {
        setTitle(s.title ?? '');
        const desc = s.description ?? '';
        setDescription(desc);
        setAnalysisDescription(s.analysisDescription ?? desc);
        if (s.estimatedSavings != null) setEstimatedSavings(String(s.estimatedSavings));
        if (s.implementationComplexity) setComplexity(s.implementationComplexity);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createOpportunity({
        title: title || 'Untitled opportunity',
        description,
        estimatedSavings: parseInt(estimatedSavings, 10) || 0,
        implementationComplexity: complexity,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      navigate(`/opportunities/${data.id}`);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/opportunities')}>
          ← Opportunities
        </button>
        <h1 className={styles.title}>Create opportunity</h1>
        <p className={styles.subtitle}>Use the Planner to suggest an opportunity, or fill the form manually.</p>
      </div>

      <section className={styles.section}>
        <h2>Planner (guided)</h2>
        <input
          type="text"
          placeholder="Describe the opportunity you have in mind…"
          value={plannerMessage}
          onChange={(e) => setPlannerMessage(e.target.value)}
          className={styles.input}
        />
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => suggestMutation.mutate()}
          disabled={suggestMutation.isPending}
        >
          {suggestMutation.isPending ? 'Asking Planner…' : 'Get suggestion from Planner'}
        </button>
        {analysisDescription && (
          <label className={styles.label}>
            Analysis description
            {editAnalysisRaw ? (
              <>
                <textarea
                  value={analysisDescription}
                  onChange={(e) => {
                    setAnalysisDescription(e.target.value);
                    setDescription(e.target.value);
                  }}
                  className={styles.textarea}
                  rows={16}
                  placeholder="AI analysis (Markdown supported)."
                />
                <button type="button" className={styles.editToggle} onClick={() => setEditAnalysisRaw(false)}>
                  Show formatted
                </button>
              </>
            ) : (
              <>
                <div className={styles.formattedBox}><FormattedMarkdown content={analysisDescription} /></div>
                <button type="button" className={styles.editToggle} onClick={() => setEditAnalysisRaw(true)}>
                  Edit raw text
                </button>
              </>
            )}
          </label>
        )}
      </section>

      <section className={styles.section}>
        <h2>Opportunity details</h2>
        <label className={styles.label}>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="Title"
          />
        </label>
        <label className={styles.label}>
          Description
          {editDescriptionRaw ? (
            <>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                rows={12}
                placeholder="Description (Markdown supported)."
              />
              <button type="button" className={styles.editToggle} onClick={() => setEditDescriptionRaw(false)}>
                Show formatted
              </button>
            </>
          ) : (
            <>
              {description ? (
                <div className={styles.formattedBox}><FormattedMarkdown content={description} /></div>
              ) : (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Description"
                />
              )}
              {description && (
                <button type="button" className={styles.editToggle} onClick={() => setEditDescriptionRaw(true)}>
                  Edit raw text
                </button>
              )}
            </>
          )}
        </label>
        <label className={styles.label}>
          Estimated savings ($)
          <input
            type="number"
            value={estimatedSavings}
            onChange={(e) => setEstimatedSavings(e.target.value)}
            className={styles.input}
            placeholder="e.g. 500000"
          />
        </label>
        <label className={styles.label}>
          Implementation complexity
          <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className={styles.select}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button
          type="button"
          className={styles.createBtn}
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending || !title.trim()}
        >
          {createMutation.isPending ? 'Creating…' : 'Create opportunity'}
        </button>
        {createMutation.isError && (
          <p className={styles.error}>{(createMutation.error as Error).message}</p>
        )}
      </section>
    </div>
  );
}
