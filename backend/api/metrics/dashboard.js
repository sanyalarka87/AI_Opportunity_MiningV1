import { getDashboardMetrics } from '../../src/data/stubMetrics.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { lob, timePeriod, geography, segment } = req.query || {};
  const filters = { lob, timePeriod, geography, segment };
  const data = getDashboardMetrics(filters);

  res.status(200).json(data);
}

