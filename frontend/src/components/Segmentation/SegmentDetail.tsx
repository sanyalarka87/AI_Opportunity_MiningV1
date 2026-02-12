import React, { useEffect, useState } from 'react';
import { Segment, getSegmentDetail, sendSegmentChatMessage } from '../../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import styles from './SegmentDetail.module.css';

export const SegmentDetail: React.FC = () => {
  const selectedSegmentId = useSelector((state: RootState) => state.segmentation.selectedSegmentId);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [loading, setLoading] = useState(false);
  const [qnaQuery, setQnaQuery] = useState('');
  const [qnaResponse, setQnaResponse] = useState<string | null>(null);
  const [qnaLoading, setQnaLoading] = useState(false);

  useEffect(() => {
    if (selectedSegmentId) {
      setLoading(true);
      setQnaResponse(null);
      setQnaQuery('');
      getSegmentDetail(selectedSegmentId)
        .then(setSegment)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setSegment(null);
    }
  }, [selectedSegmentId]);

  const handleQnA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaQuery.trim() || !segment) return;
    setQnaLoading(true);
    try {
      const res = await sendSegmentChatMessage(qnaQuery, segment.id);
      setQnaResponse(res.response);
    } catch (err) {
      console.error(err);
      setQnaResponse('Failed to get answer. Please try again.');
    } finally {
      setQnaLoading(false);
    }
  };

  if (!selectedSegmentId) {
    return (
      <div className={styles.placeholder}>
        <svg
          className={styles.placeholderIcon}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className={styles.placeholderText}>Select a segment to view detailed analysis and AI insights</p>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.loading}>Loading details…</div>;
  }
  if (!segment) {
    return <div className={styles.error}>Segment not found</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.segmentName}>{segment.name}</h2>
        <div className={styles.headerMeta}>
          <span>PMPM: <strong>${segment.pmpm}</strong></span>
          <span>Opp. value: <strong className={styles.savingsHighlight}>${(segment.potentialSavings / 1000000).toFixed(1)}M</strong></span>
        </div>
      </div>

      <div className={styles.scrollArea}>
        {/* Explainability */}
        <section className={styles.section}>
          <div className={styles.explainBox}>
            <h3 className={styles.explainTitle}>
              <span aria-hidden>👥</span>
              Why this segment exists
            </h3>
            <p className={styles.explainText}>{segment.explanation}</p>
          </div>
        </section>

        {/* Cost Drivers */}
        {segment.costDrivers && segment.costDrivers.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Top Cost Drivers</h3>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segment.costDrivers} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" width={90} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toFixed(0)}`, 'PMPM']}
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {segment.costDrivers.map((_, index) => (
                      <Cell key={index} fill={index === 0 ? '#dc2626' : 'var(--accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Interventions */}
        {segment.interventionOpportunities && segment.interventionOpportunities.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Recommended Interventions</h3>
            <div className={styles.interventionList}>
              {segment.interventionOpportunities.map((opp) => (
                <div key={opp.id} className={styles.interventionCard}>
                  <div>
                    <p className={styles.interventionName}>{opp.name}</p>
                    <span className={`${styles.impactBadge} ${opp.impact === 'High' ? styles.impactHigh : styles.impactMedium}`}>
                      {opp.impact} impact
                    </span>
                  </div>
                  <div className={styles.interventionRight}>
                    <div className={styles.interventionSavings}>{opp.savings}</div>
                    <a href="#" className={styles.interventionLink} onClick={(e) => e.preventDefault()}>
                      View details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* QnA */}
        <section className={`${styles.section} ${styles.qnaSection}`}>
          <h3 className={styles.sectionTitle}>Ask about this segment</h3>
          <div className={styles.qnaBox}>
            {qnaResponse && (
              <div className={styles.qnaResponse}>
                <p className={styles.qnaResponseLabel}>AI Response</p>
                {qnaResponse}
              </div>
            )}
            <form onSubmit={handleQnA} className={styles.qnaForm}>
              <input
                type="text"
                value={qnaQuery}
                onChange={(e) => setQnaQuery(e.target.value)}
                placeholder="E.g., What are the key risk factors?"
                className={styles.qnaInput}
                aria-label="Question about segment"
              />
              <button type="submit" disabled={qnaLoading} className={styles.qnaSubmit}>
                {qnaLoading ? 'Asking…' : 'Ask'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
