import {
  getOpportunityById,
  getCollaborationNotes,
  addCollaborationNote,
} from '../../../src/data/opportunitiesStore.js';

export default function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method === 'GET') {
    const notes = getCollaborationNotes(id);
    res.status(200).json(notes);
    return;
  }

  if (method === 'POST') {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const { text } = req.body || {};
    if (!text) {
      res.status(400).json({ error: 'text required' });
      return;
    }
    const opp = getOpportunityById(id);
    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    const note = addCollaborationNote(id, userId, text);
    res.status(201).json(note);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

