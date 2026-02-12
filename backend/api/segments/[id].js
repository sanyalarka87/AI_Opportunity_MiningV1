import { getSegmentDetail } from '../../src/data/segmentsStore.js';

export default function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const data = getSegmentDetail(id);
  if (!data) {
    res.status(404).json({ error: 'Segment not found' });
    return;
  }

  res.status(200).json(data);
}

