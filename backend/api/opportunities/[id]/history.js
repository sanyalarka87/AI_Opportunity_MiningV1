import { getVersionHistory } from '../../../src/data/opportunitiesStore.js';

export default function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const history = getVersionHistory(id);
  res.status(200).json(history);
}

