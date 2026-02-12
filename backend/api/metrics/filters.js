export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json({
    lob: ['Medicare', 'Medicaid', 'Commercial'],
    timePeriod: ['MTD', 'QTD', 'YTD', 'Rolling 12M'],
    geography: ['National', 'Northeast', 'South', 'Midwest', 'West'],
    segment: ['All', 'High Risk', 'Chronic', 'Healthy', 'Rising Risk'],
  });
}

