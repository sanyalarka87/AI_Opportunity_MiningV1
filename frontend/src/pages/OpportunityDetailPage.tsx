import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOpportunity,
  getDashboardMetrics,
  approveOpportunity,
  declineOpportunity,
  updateOpportunity,
  getOpportunityNotes,
  addOpportunityNote,
  trimOpportunityNotes,
  getOpportunityHistory,
  sendChatWithContext,
  whatIfSimulation,
} from '../api/client';
import type { Opportunity } from '../api/client';
import type { DashboardMetrics } from '../types/dashboard';
import { FormattedMarkdown } from '../components/FormattedMarkdown';
import styles from './OpportunityDetailPage.module.css';

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qnaMessage, setQnaMessage] = useState('');
  const [qnaResponses, setQnaResponses] = useState<{ role: string; content: string }[]>([]);
  const [qnaCollapsed, setQnaCollapsed] = useState(false);
  const [whatIfScenario, setWhatIfScenario] = useState('');
  const [whatIfResult, setWhatIfResult] = useState<unknown>(null);
  const [newNote, setNewNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [explainOpen, setExplainOpen] = useState<Record<string, boolean>>({
    populationSegment: false,
    scale: false,
    financialImpact: false,
    rootCause: false,
    nextBestAction: false,
  });

  const toggleExplain = (key: string) => {
    setExplainOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { data: opp, isLoading, isError, error } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => getOpportunity(id!),
    enabled: !!id && id !== 'new',
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['opportunity-notes', id],
    queryFn: () => getOpportunityNotes(id!),
    enabled: !!id && id !== 'new',
  });

  const { data: history = [] } = useQuery({
    queryKey: ['opportunity-history', id],
    queryFn: () => getOpportunityHistory(id!),
    enabled: !!id && id !== 'new',
  });

  const { data: metrics } = useQuery({
    queryKey: ['dashboardMetrics', {}],
    queryFn: () => getDashboardMetrics({}),
  });

  const impactSummary = useMemo(() => {
    if (!opp || !metrics) return null;
    const m = metrics as DashboardMetrics;
    const org = m.organizational;
    const oppAgg = m.opportunity;
    const realizationRate = oppAgg.addressable > 0 ? oppAgg.realizable / oppAgg.addressable : 0.72;
    const addressableThisOpp = realizationRate > 0 ? opp.estimatedSavings / realizationRate : opp.estimatedSavings;
    const realizableTotal = oppAgg.realizable || 1;
    const affectedMembersTotal = oppAgg.affectedMembers ?? Math.round(org.totalMembers * 0.18);
    const affectedMembersThisOpp = Math.max(1, Math.round(affectedMembersTotal * (opp.estimatedSavings / realizableTotal)));
    const currentPmpm = org.pmpm;
    const reductionPmpm = opp.estimatedSavings / (org.totalMembers * 12);
    const projectedPmpm = Math.max(0, currentPmpm - reductionPmpm);
    const projectedCost = org.totalMedicalCost - opp.estimatedSavings;
    const projectedMlr = org.totalRevenue > 0 ? (projectedCost / org.totalRevenue) * 100 : org.mlr;
    const currentMlr = org.mlr;
    const targetMlr = org.mlrTarget ?? 85;
    const mlrImprovement = currentMlr - projectedMlr;
    return {
      addressableM: addressableThisOpp / 1e6,
      netSavingsM: opp.estimatedSavings / 1e6,
      realizationPct: Math.round(realizationRate * 100),
      affectedMembers: affectedMembersThisOpp,
      currentPmpm,
      projectedPmpm,
      reductionPmpm,
      currentMlr,
      projectedMlr,
      mlrImprovement,
      targetMlr,
    };
  }, [opp, metrics]);

  const approveMutation = useMutation({
    mutationFn: () => approveOpportunity(id!),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (e: Error) => setActionError(`Approve failed: ${e.message}`),
  });

  const declineMutation = useMutation({
    mutationFn: () => declineOpportunity(id!),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (e: Error) => setActionError(`Decline failed: ${e.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Opportunity>) => updateOpportunity(id!, body),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      setEditing(false);
    },
    onError: (e: Error) => setActionError(`Update failed: ${e.message}`),
  });

  const noteMutation = useMutation({
    mutationFn: (text: string) => addOpportunityNote(id!, text),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['opportunity-notes', id] });
      setNewNote('');
    },
    onError: (e: Error) => setActionError(`Add note failed: ${e.message}`),
  });

  const trimNotesMutation = useMutation({
    mutationFn: () => trimOpportunityNotes(id!, 2),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['opportunity-notes', id] });
    },
    onError: (e: Error) => setActionError(`Trim notes failed: ${e.message}`),
  });

  const handleQna = async () => {
    if (!qnaMessage.trim() || !id) return;
    setQnaResponses((prev) => [...prev, { role: 'user', content: qnaMessage }]);
    setQnaMessage('');
    try {
      const res = await sendChatWithContext(qnaMessage, id);
      setQnaResponses((prev) => [...prev, { role: 'assistant', content: res.response }]);
    } catch {
      setQnaResponses((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    }
  };

  const handleWhatIf = async () => {
    if (!id) return;
    setActionError(null);
    try {
      const res = await whatIfSimulation(id, whatIfScenario || undefined);
      setWhatIfResult(res);
    } catch (e) {
      setWhatIfResult({ error: (e as Error).message });
      setActionError(`What-if failed: ${(e as Error).message}`);
    }
  };

  const startEdit = () => {
    if (opp) {
      setEditTitle(opp.title);
      setEditDesc(opp.description);
      setEditing(true);
    }
  };

  const saveEdit = () => {
    updateMutation.mutate({ title: editTitle, description: editDesc });
  };

  const submitForReviewMutation = useMutation({
    mutationFn: () => updateOpportunity(id!, { status: 'under_review' }),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (e: Error) => setActionError(`Submit for review failed: ${e.message}`),
  });

  if (id === 'new') return null;
  if (isLoading) return <div className={styles.loading}>Loading…</div>;
  if (isError || !opp) {
    const errMsg = (error as Error)?.message ?? 'Not found';
    const isNetwork = errMsg.includes('fetch') || errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError');
    return (
      <div className={styles.error}>
        <p>Error: {errMsg}</p>
        {isNetwork && (
          <p className={styles.errorHint}>Make sure the backend is running on port 3001 (e.g. <code>cd backend && npm run dev</code>).</p>
        )}
      </div>
    );
  }

  const canApproveDecline = opp.status === 'under_review' || opp.status === 'identified';
  const canSubmitForReview = opp.status === 'identified';

  return (
    <div className={styles.page}>
      {actionError && (
        <div className={styles.bannerError} role="alert">
          {actionError}
          <button type="button" className={styles.bannerDismiss} onClick={() => setActionError(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      <div className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/opportunities')}>
          ← Opportunities
        </button>
        <div className={styles.titleRow}>
          {!editing ? (
            <>
              <h1 className={styles.title}>{opp.title}</h1>
              <span className={styles[`status_${opp.status}`] ?? styles.status}>{opp.status.replace('_', ' ')}</span>
              {canSubmitForReview && (
                <button
                  type="button"
                  className={styles.submitReviewBtn}
                  onClick={() => submitForReviewMutation.mutate()}
                  disabled={submitForReviewMutation.isPending}
                >
                  Submit for review
                </button>
              )}
              {canApproveDecline && (
                <div className={styles.approveActions}>
                  <button
                    type="button"
                    className={styles.approveBtn}
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className={styles.declineBtn}
                    onClick={() => declineMutation.mutate()}
                    disabled={declineMutation.isPending}
                  >
                    Decline
                  </button>
                </div>
              )}
              <button type="button" className={styles.editBtn} onClick={startEdit}>
                Edit
              </button>
            </>
          ) : (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={styles.editTitle}
                placeholder="Title"
              />
              <button type="button" className={styles.saveBtn} onClick={saveEdit} disabled={updateMutation.isPending}>
                Save
              </button>
              <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
        {!editing && (
          <div className={styles.metaRow}>
            <span className={styles.metaChip}>
              <span className={styles.metaLabel}>Confidence</span>
              <span className={styles.metaValue}>{(opp.confidenceScore * 100).toFixed(0)}%</span>
            </span>
            <span className={styles.metaChip}>
              <span className={styles.metaLabel}>Est. savings</span>
              <span className={styles.metaValue}>${(opp.estimatedSavings / 1e6).toFixed(2)}M</span>
            </span>
            <span className={`${styles.metaChip} ${styles[`metaComplexity_${opp.implementationComplexity}`] || ''}`}>
              <span className={styles.metaLabel}>Complexity</span>
              <span className={styles.metaValue}>{opp.implementationComplexity}</span>
            </span>
            {opp.lob?.length ? (
              <span className={styles.metaChip}>
                <span className={styles.metaLabel}>LOB</span>
                <span className={styles.metaValue}>{opp.lob.join(', ')}</span>
              </span>
            ) : null}
            {opp.tags?.length ? (
              <span className={styles.metaChip}>
                <span className={styles.metaLabel}>Tags</span>
                <span className={styles.metaValue}>{opp.tags.join(', ')}</span>
              </span>
            ) : null}
          </div>
        )}
      </div>

      {impactSummary && (
        <section className={styles.impactSection} aria-label="Opportunity impact metrics">
          <div className={styles.impactGrid}>
            <div className={styles.impactCard}>
              <span className={styles.impactIcon} style={{ background: 'rgba(245, 158, 11, 0.2)' }} aria-hidden>⚡</span>
              <div className={styles.impactValue}>${impactSummary.addressableM.toFixed(2)}M</div>
              <div className={styles.impactLabel}>Addressable opportunity</div>
            </div>
            <div className={styles.impactCard}>
              <span className={styles.impactIcon} style={{ background: 'rgba(22, 163, 74, 0.2)' }} aria-hidden>💵</span>
              <div className={styles.impactValue}>${impactSummary.netSavingsM.toFixed(2)}M</div>
              <div className={styles.impactLabel}>Potential net savings</div>
              <div className={styles.impactSub}>After {impactSummary.realizationPct}% realization rate</div>
            </div>
            <div className={styles.impactCard}>
              <span className={styles.impactIcon} style={{ background: 'rgba(14, 165, 233, 0.2)' }} aria-hidden>👥</span>
              <div className={styles.impactValue}>
                {impactSummary.affectedMembers >= 1000
                  ? `${(impactSummary.affectedMembers / 1000).toFixed(1)}K`
                  : impactSummary.affectedMembers.toLocaleString()}
              </div>
              <div className={styles.impactLabel}>Affected members</div>
            </div>
            <div className={styles.impactCard}>
              <span className={styles.impactIcon} style={{ background: 'rgba(139, 92, 246, 0.2)' }} aria-hidden>📊</span>
              <div className={styles.impactTitle}>PMPM cost impact</div>
              <div className={styles.impactValue}>
                ${impactSummary.currentPmpm.toFixed(2)} → ${impactSummary.projectedPmpm.toFixed(2)}
              </div>
              <div className={styles.impactDelta}>↓ ${impactSummary.reductionPmpm.toFixed(2)} PMPM reduction</div>
            </div>
            <div className={styles.impactCard}>
              <span className={styles.impactIcon} style={{ background: 'rgba(239, 68, 68, 0.2)' }} aria-hidden>📈</span>
              <div className={styles.impactTitle}>MLR impact</div>
              <div className={styles.impactValue}>
                {impactSummary.currentMlr.toFixed(2)}% → {impactSummary.projectedMlr.toFixed(2)}%
              </div>
              <div className={styles.impactDelta}>
                ↓ {impactSummary.mlrImprovement.toFixed(2)}% improvement toward {impactSummary.targetMlr}% target
              </div>
            </div>
          </div>
        </section>
      )}

      <div className={styles.grid}>
        <div className={styles.columnLeft}>
          <section className={styles.section}>
            <h2>Description</h2>
            {editing ? (
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className={styles.textarea} rows={4} />
            ) : (
              <div className={styles.description}><FormattedMarkdown content={opp.description} /></div>
            )}
          </section>

          <section className={styles.section}>
            <h2>What-if scenario</h2>
            <input
              type="text"
              placeholder="Scenario description (optional)"
              value={whatIfScenario}
              onChange={(e) => setWhatIfScenario(e.target.value)}
              className={styles.input}
            />
            <button type="button" className={styles.primaryBtn} onClick={handleWhatIf}>
              Run simulation
            </button>
            {whatIfResult != null ? (
              <div className={styles.resultWrap}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultTitle}>Simulation result</span>
                  <button
                    type="button"
                    className={styles.resultCloseBtn}
                    onClick={() => setWhatIfResult(null)}
                    aria-label="Close simulation result"
                    title="Close"
                  >
                    ×
                  </button>
                </div>
                <div className={styles.result}>
                  {'error' in whatIfResult && typeof (whatIfResult as { error: string }).error === 'string' ? (
                    <p className={styles.whatIfError}>{(whatIfResult as { error: string }).error}</p>
                  ) : 'response' in whatIfResult && typeof (whatIfResult as { response: string }).response === 'string' ? (
                    <FormattedMarkdown content={(whatIfResult as { response: string }).response} />
                  ) : (
                    <pre>{JSON.stringify(whatIfResult, null, 2)}</pre>
                  )}
                </div>
              </div>
            ) : null}
          </section>

          <section className={styles.section}>
            <h2>Collaboration notes</h2>
            {notes.length > 2 && (
              <button
                type="button"
                className={styles.trimNotesBtn}
                onClick={() => trimNotesMutation.mutate()}
                disabled={trimNotesMutation.isPending}
              >
                {trimNotesMutation.isPending ? 'Trimming…' : 'Keep only first 2 notes'}
              </button>
            )}
            <ul className={styles.notesList}>
              {notes.map((n: { id: string; author: string; text: string; createdAt: string }) => (
                <li key={n.id}>
                  <strong>{n.author}</strong> · {new Date(n.createdAt).toLocaleString()}
                  <p>{n.text}</p>
                </li>
              ))}
            </ul>
            <textarea
              placeholder="Add a note…"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className={styles.textarea}
              rows={2}
            />
            <button type="button" className={styles.primaryBtn} onClick={() => noteMutation.mutate(newNote)} disabled={!newNote.trim() || noteMutation.isPending}>
              Add note
            </button>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.section}>
            <h2>Explainability & rationale</h2>
          {opp.explainability ? (
            <div className={styles.explainability}>
              <div className={styles.explainBlock}>
                <button
                  type="button"
                  className={styles.explainBanner}
                  onClick={() => toggleExplain('populationSegment')}
                  aria-expanded={explainOpen.populationSegment}
                >
                  <span className={styles.explainBannerTitle}>Business Rules</span>
                  <span className={styles.explainChevron} aria-hidden>{explainOpen.populationSegment ? '▼' : '▶'}</span>
                </button>
                {explainOpen.populationSegment && (
                  <ul className={styles.explainList}>
                    {opp.explainability.populationSegment.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.explainBlock}>
                <button
                  type="button"
                  className={styles.explainBanner}
                  onClick={() => toggleExplain('scale')}
                  aria-expanded={explainOpen.scale}
                >
                  <span className={styles.explainBannerTitle}>Scale</span>
                  <span className={styles.explainChevron} aria-hidden>{explainOpen.scale ? '▼' : '▶'}</span>
                </button>
                {explainOpen.scale && (
                  <ul className={styles.explainListPlain}>
                    {opp.explainability.scale.map((item, i) => (
                      <li key={i}>
                        <strong>{item.label}:</strong> {item.value}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.explainBlock}>
                <button
                  type="button"
                  className={styles.explainBanner}
                  onClick={() => toggleExplain('financialImpact')}
                  aria-expanded={explainOpen.financialImpact}
                >
                  <span className={styles.explainBannerTitle}>Financial impact</span>
                  <span className={styles.explainChevron} aria-hidden>{explainOpen.financialImpact ? '▼' : '▶'}</span>
                </button>
                {explainOpen.financialImpact && (
                  <ul className={styles.explainListPlain}>
                    {opp.explainability.financialImpact.map((item, i) => {
                      let displayValue: string | number = item.value ?? '—';
                      if (item.value === null && impactSummary) {
                        if (item.label === 'PMPM impact') {
                          displayValue = `$${impactSummary.reductionPmpm.toFixed(2)} PMPM reduction`;
                        } else if (item.label === 'MLR improvement') {
                          displayValue = `${impactSummary.mlrImprovement.toFixed(2)}%`;
                        }
                      }
                      return (
                        <li key={i}>
                          <strong>{item.label}:</strong> {displayValue}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className={styles.explainBlock}>
                <button
                  type="button"
                  className={styles.explainBanner}
                  onClick={() => toggleExplain('rootCause')}
                  aria-expanded={explainOpen.rootCause}
                >
                  <span className={styles.explainBannerTitle}>Root cause / Key drivers</span>
                  <span className={styles.explainChevron} aria-hidden>{explainOpen.rootCause ? '▼' : '▶'}</span>
                </button>
                {explainOpen.rootCause && (
                  <ul className={styles.explainList}>
                    {opp.explainability.rootCauseKeyDrivers.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.explainBlock}>
                <button
                  type="button"
                  className={styles.explainBanner}
                  onClick={() => toggleExplain('nextBestAction')}
                  aria-expanded={explainOpen.nextBestAction}
                >
                  <span className={styles.explainBannerTitle}>Next best action</span>
                  <span className={styles.explainChevron} aria-hidden>{explainOpen.nextBestAction ? '▼' : '▶'}</span>
                </button>
                {explainOpen.nextBestAction && (
                  <p className={styles.nextBestAction}>{opp.explainability.nextBestAction}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className={styles.rationale}>{opp.rationale}</p>
              {opp.supportingAnalytics && Object.keys(opp.supportingAnalytics).length > 0 && (
                <div className={styles.analytics}>
                  <strong>Supporting analytics</strong>
                  <pre>{JSON.stringify(opp.supportingAnalytics, null, 2)}</pre>
                </div>
              )}
            </>
          )}
          </section>

          <section className={styles.section}>
            <h2>QnA (opportunity context)</h2>
            <div className={styles.qnaInput}>
              <input
                type="text"
                placeholder="Ask about assumptions, ROI, risks…"
                value={qnaMessage}
                onChange={(e) => setQnaMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQna()}
                className={styles.input}
              />
              <button type="button" className={styles.primaryBtn} onClick={handleQna}>
                Send
              </button>
            </div>
            {(qnaResponses.length > 0) && (
              <div className={styles.qnaAnswerWrap}>
                <div className={styles.qnaAnswerHeader}>
                  <span className={styles.qnaAnswerTitle}>Answers</span>
                  <button
                    type="button"
                    className={styles.qnaAnswerCloseBtn}
                    onClick={() => setQnaCollapsed(true)}
                    aria-label="Collapse answers"
                    title="Collapse"
                  >
                    ×
                  </button>
                </div>
                {!qnaCollapsed && (
                  <div className={styles.qnaResponses}>
                    {qnaResponses.map((r, i) => (
                      <div key={i} className={r.role === 'user' ? styles.qnaUser : styles.qnaAssistant}>
                        {r.role === 'assistant' ? (
                          <FormattedMarkdown content={r.content} />
                        ) : (
                          r.content
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {qnaCollapsed && (
                  <button
                    type="button"
                    className={styles.qnaExpandBtn}
                    onClick={() => setQnaCollapsed(false)}
                  >
                    Show answers
                  </button>
                )}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2>Version history</h2>
          {history.length === 0 ? (
            <p className={styles.muted}>No prior versions.</p>
          ) : (
            <ul className={styles.historyList}>
              {(history as { version: number; timestamp: string }[]).map((h, i) => (
                <li key={i}>Version {h.version} · {new Date(h.timestamp).toLocaleString()}</li>
              ))}
            </ul>
          )}
          <p className={styles.muted}>Current version: {opp.version}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
