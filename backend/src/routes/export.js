import { Router } from 'express';
import { logAudit } from '../audit.js';

export const exportRouter = Router();

exportRouter.post('/pdf', (req, res) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const role = req.headers['x-user-role'] || 'viewer';
  const { title, html } = req.body;

  logAudit({ action: 'export_pdf', userId, role, title });

  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'PDF export requested. In production, use a server-side PDF generator (e.g., Puppeteer, jsPDF server).',
    payload: { title, snippet: (html || '').slice(0, 200) },
  });
});

exportRouter.post('/ppt', (req, res) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const role = req.headers['x-user-role'] || 'viewer';
  const { title, slides } = req.body;

  logAudit({ action: 'export_ppt', userId, role, title });

  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'PPT export requested. In production, use a server-side PPT generator (e.g., pptxgenjs or Office Open XML).',
    payload: { title, slideCount: Array.isArray(slides) ? slides.length : 0 },
  });
});
