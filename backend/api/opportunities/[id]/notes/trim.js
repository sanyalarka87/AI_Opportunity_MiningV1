import {
  getOpportunityById,
  trimCollaborationNotes,
} from '../../../../src/data/opportunitiesStore.js';

export default function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const opp = getOpportunityById(id);
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }

  const keep = Math.max(0, parseInt((req.body && req.body.keep) ?? 0, 10) || 0);
  const notes = trimCollaborationNotes(id, keep);
  res.status(200).json(notes);
}

