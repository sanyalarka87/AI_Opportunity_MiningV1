import {
  listOpportunities,
  createOpportunity,
} from '../../src/data/opportunitiesStore.js';
import { logAudit } from '../../src/audit.js';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { status, search, tags, segmentId } = req.query || {};
    const list = listOpportunities({ status, search, tags, segmentId });
    res.status(200).json(list);
    return;
  }

  if (req.method === 'POST') {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const opp = createOpportunity({ ...(req.body || {}), createdBy: userId });
    logAudit({ action: 'opportunity_create', userId, entityType: 'opportunity', entityId: opp.id });
    res.status(201).json(opp);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

