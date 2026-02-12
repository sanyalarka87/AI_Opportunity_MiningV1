import { logAudit } from '../../src/audit.js';
import { getOpportunityById } from '../../src/data/opportunitiesStore.js';
import { getSegmentDetail } from '../../src/data/segmentsStore.js';
import { buildOpportunityQnAResponse, STUB_RESPONSES } from '../../src/serverless/agentShared.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, sessionId, opportunityId, segmentId } = req.body || {};
  const userId = req.headers['x-user-id'] || 'anonymous';
  const role = req.headers['x-user-role'] || 'viewer';

  if (!message) {
    res.status(400).json({ error: 'message required' });
    return;
  }

  const messageTrimmed = (message || '').trim();
  let responseText =
    STUB_RESPONSES[message] || STUB_RESPONSES[messageTrimmed] || STUB_RESPONSES.default;

  if (opportunityId) {
    const opp = getOpportunityById(opportunityId);
    if (opp) {
      const detailedQnA = buildOpportunityQnAResponse(opp, messageTrimmed);
      if (detailedQnA) {
        responseText = detailedQnA;
      } else {
        responseText = `[QnA in context of: "${opp.title}"] ${responseText} For this opportunity: estimated savings $${(opp.estimatedSavings / 1e6).toFixed(2)}M, confidence ${(opp.confidenceScore * 100).toFixed(0)}%. Risks and dependencies would be assessed by the full QnA agent in production.`;
      }
    }
  } else if (segmentId) {
    const seg = getSegmentDetail(segmentId);
    if (seg) {
      responseText = `[QnA in context of Segment: "${seg.name}"] ${responseText} This segment represents ${seg.memberCount.toLocaleString()} members. Key risk: ${seg.riskCharacteristics[0]}.`;
    }
  }

  logAudit({ action: 'chat', userId, role, message, sessionId, opportunityId, segmentId });

  res.status(200).json({
    response: responseText,
    sessionId: sessionId || `sess-${Date.now()}`,
    confidence: 0.85,
  });
}

