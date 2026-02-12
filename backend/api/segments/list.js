import { getSegmentsList } from '../../src/data/segmentsStore.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { lob, timePeriod, geography } = req.query || {};
  const filters = { lob, timePeriod, geography };
  const data = getSegmentsList(filters);

  res.status(200).json(data);
}

