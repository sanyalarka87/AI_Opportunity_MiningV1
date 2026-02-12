import { getAuditLog } from '../../src/audit.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, action, limit } = req.query || {};
  const entries = getAuditLog({ userId, action, limit });
  res.status(200).json(entries);
}

