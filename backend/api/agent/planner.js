import { logAudit } from '../../src/audit.js';
import { plannerAnalyze } from '../../src/serverless/agentShared.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message } = req.body || {};
  const userId = req.headers['x-user-id'] || 'demo-user';
  logAudit({ action: 'planner_create', userId, message });

  const suggested = plannerAnalyze(message);
  res.status(200).json({ suggested });
}

