import { Router } from 'express';
import { getPopulationMetrics, getSegmentsList, getSegmentDetail } from '../data/segmentsStore.js';

export const segmentsRouter = Router();

// Get overall population metrics
segmentsRouter.get('/population', (req, res) => {
  const { lob, timePeriod, geography } = req.query;
  const filters = { lob, timePeriod, geography };
  const data = getPopulationMetrics(filters);
  res.json(data);
});

// Get list of AI-generated segments
segmentsRouter.get('/list', (req, res) => {
  const { lob, timePeriod, geography } = req.query;
  const filters = { lob, timePeriod, geography };
  const data = getSegmentsList(filters);
  res.json(data);
});

// Get details for a specific segment
segmentsRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const data = getSegmentDetail(id);
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'Segment not found' });
  }
});
