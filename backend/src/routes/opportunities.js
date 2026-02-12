import { Router } from 'express';
import { logAudit } from '../audit.js';
import {
  listOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  setOpportunityStatus,
  getVersionHistory,
  getCollaborationNotes,
  addCollaborationNote,
  trimCollaborationNotes,
} from '../data/opportunitiesStore.js';

export const opportunitiesRouter = Router();

opportunitiesRouter.get('/', (req, res) => {
  const { status, search, tags, segmentId } = req.query;
  const list = listOpportunities({ status, search, tags, segmentId });
  res.json(list);
});

opportunitiesRouter.post('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const opp = createOpportunity({ ...req.body, createdBy: userId });
  logAudit({ action: 'opportunity_create', userId, entityType: 'opportunity', entityId: opp.id });
  res.status(201).json(opp);
});

// Nested routes first so /:id does not consume e.g. "opp-1/approve"
opportunitiesRouter.post('/:id/approve', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const result = setOpportunityStatus(req.params.id, 'approved', userId);
  if (!result) return res.status(404).json({ error: 'Opportunity not found' });
  logAudit({
    action: 'opportunity_approve',
    userId,
    entityType: 'opportunity',
    entityId: req.params.id,
    payload: { previousStatus: result.previousStatus },
  });
  res.json(result.opportunity);
});

opportunitiesRouter.post('/:id/decline', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const result = setOpportunityStatus(req.params.id, 'declined', userId);
  if (!result) return res.status(404).json({ error: 'Opportunity not found' });
  logAudit({
    action: 'opportunity_decline',
    userId,
    entityType: 'opportunity',
    entityId: req.params.id,
    payload: { previousStatus: result.previousStatus },
  });
  res.json(result.opportunity);
});

opportunitiesRouter.get('/:id/history', (req, res) => {
  const history = getVersionHistory(req.params.id);
  res.json(history);
});

opportunitiesRouter.get('/:id/notes', (req, res) => {
  const notes = getCollaborationNotes(req.params.id);
  res.json(notes);
});

opportunitiesRouter.post('/:id/notes', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const opp = getOpportunityById(req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  const note = addCollaborationNote(req.params.id, userId, text);
  res.status(201).json(note);
});

opportunitiesRouter.post('/:id/notes/trim', (req, res) => {
  const opp = getOpportunityById(req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  const keep = Math.max(0, parseInt(req.body.keep, 10) || 0);
  const notes = trimCollaborationNotes(req.params.id, keep);
  res.json(notes);
});

opportunitiesRouter.get('/:id', (req, res) => {
  const opp = getOpportunityById(req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  res.json(opp);
});

opportunitiesRouter.patch('/:id', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const opp = updateOpportunity(req.params.id, req.body);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  logAudit({ action: 'opportunity_update', userId, entityType: 'opportunity', entityId: opp.id });
  res.json(opp);
});
