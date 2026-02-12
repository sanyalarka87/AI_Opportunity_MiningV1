import {
  getOpportunityById,
  updateOpportunity,
} from '../../src/data/opportunitiesStore.js';

export default function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method === 'GET') {
    const opp = getOpportunityById(id);
    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    res.status(200).json(opp);
    return;
  }

  if (method === 'PATCH') {
    const opp = updateOpportunity(id, req.body || {});
    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    res.status(200).json(opp);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

