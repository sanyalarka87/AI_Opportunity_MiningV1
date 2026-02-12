import { setOpportunityStatus } from '../../../src/data/opportunitiesStore.js';
import { logAudit } from '../../../src/audit.js';

export default function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = req.headers['x-user-id'] || 'demo-user';
  const result = setOpportunityStatus(id, 'approved', userId);
  if (!result) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }

  logAudit({
    action: 'opportunity_approve',
    userId,
    entityType: 'opportunity',
    entityId: id,
    payload: { previousStatus: result.previousStatus },
  });

  res.status(200).json(result.opportunity);
}

