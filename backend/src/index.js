import express from 'express';
import cors from 'cors';
import { metricsRouter } from './routes/metrics.js';
import { agentRouter } from './routes/agent.js';
import { exportRouter } from './routes/export.js';
import { auditRouter } from './routes/audit.js';
import { authRouter } from './routes/auth.js';
import { opportunitiesRouter } from './routes/opportunities.js';
import { segmentsRouter } from './routes/segments.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-opportunity-mining-backend' });
});

app.use('/api/metrics', metricsRouter);
app.use('/api/agent', agentRouter);
app.use('/api/export', exportRouter);
app.use('/api/audit', auditRouter);
app.use('/api/auth', authRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/segments', segmentsRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running at http://0.0.0.0:${PORT}`);
});
