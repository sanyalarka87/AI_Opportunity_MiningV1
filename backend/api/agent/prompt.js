import { logAudit } from '../../src/audit.js';
import { getOpportunityById } from '../../src/data/opportunitiesStore.js';
import { getSegmentDetail } from '../../src/data/segmentsStore.js';
import { getDashboardMetrics } from '../../src/data/stubMetrics.js';
import { buildOpportunityQnAResponse, STUB_RESPONSES } from '../../src/serverless/agentShared.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { promptId, promptText, context } = req.body || {};
  const userId = req.headers['x-user-id'] || 'anonymous';
  const role = req.headers['x-user-role'] || 'viewer';

  if (!promptText && !promptId) {
    res.status(400).json({ error: 'promptId or promptText required' });
    return;
  }

  const key = promptText || promptId;
  const responseText = STUB_RESPONSES[key] || STUB_RESPONSES.default;
  logAudit({ action: 'prompt_execution', userId, role, promptId, promptText: promptText || promptId, context });

  res.status(200).json({
    response: responseText,
    confidence: 0.85,
    sources: [],
  });
}

