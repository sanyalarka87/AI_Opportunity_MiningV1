import { logAudit } from '../../src/audit.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = req.headers['x-user-id'] || 'anonymous';
  const role = req.headers['x-user-role'] || 'viewer';
  const { title, slides } = req.body || {};

  logAudit({ action: 'export_ppt', userId, role, title });

  res.status(200).json({
    success: true,
    message:
      'PPT export requested. In production, use a server-side PPT generator (e.g., pptxgenjs or Office Open XML).',
    payload: { title, slideCount: Array.isArray(slides) ? slides.length : 0 },
  });
}

