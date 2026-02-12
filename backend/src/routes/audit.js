import { Router } from 'express';
import { getAuditLog } from '../audit.js';

export const auditRouter = Router();

auditRouter.get('/', (req, res) => {
  const { userId, action, limit } = req.query;
  const entries = getAuditLog({ userId, action, limit });
  res.json(entries);
});
