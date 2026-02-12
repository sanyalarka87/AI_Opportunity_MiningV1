import { Router } from 'express';
import { getDashboardMetrics } from '../data/stubMetrics.js';

export const metricsRouter = Router();

metricsRouter.get('/dashboard', (req, res) => {
  const { lob, timePeriod, geography, segment } = req.query;
  const filters = { lob, timePeriod, geography, segment };
  const data = getDashboardMetrics(filters);
  res.json(data);
});

metricsRouter.get('/filters', (_req, res) => {
  res.json({
    lob: ['Medicare', 'Medicaid', 'Commercial'],
    timePeriod: ['MTD', 'QTD', 'YTD', 'Rolling 12M'],
    geography: ['National', 'Northeast', 'South', 'Midwest', 'West'],
    segment: ['All', 'High Risk', 'Chronic', 'Healthy', 'Rising Risk'],
  });
});
