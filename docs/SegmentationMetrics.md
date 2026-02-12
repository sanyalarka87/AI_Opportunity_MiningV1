# Key Metrics for the AI Segmentation / Cluster Page

## Purpose of the Page

The AI Segmentation / Cluster Page is designed to answer one core question:

> **“Is this AI-generated cluster real, important, preventable, and worth acting on now?”**

The metrics on this page must **prove value**, **quantify impact**, and **enable prioritization**.  
They should support decision-making, not exploratory analysis.

---

## 1. Cluster Identity & Size  
**Question answered:** *Is this cluster meaningful at scale?*

### Key Metrics
- **Cluster Name** (AI-generated, user-editable)
- **Number of Members**
- **% of Total Membership**
- **% of Total Medical Spend**
- **Cluster Stability Score**  
  (how consistently this cluster appears over time)

### Why this matters
Small or unstable clusters rarely move MLR meaningfully, even if they look clinically interesting.

---

## 2. Cost Intensity  
**Question answered:** *Is real money involved?*

### Key Metrics
- **Average PMPM**
- **Median PMPM**
- **Total Annual Cost ($)**
- **Cost vs Plan Average (%)**
- **Top 10% Cost Concentration (%)**

### Optional (Advanced)
- Cost distribution (P50 / P75 / P90 / P95)
- Preventable cost PMPM

### Why this matters
Clusters with high average cost and high skew typically have the strongest intervention leverage.

---

## 3. Utilization Pattern Signals  
**Question answered:** *What behaviors define this cluster?*

### Key Metrics
- **Inpatient Admissions per 1,000**
- **Emergency Department Visits per 1,000**
- **30-Day Readmission Rate**
- **Avoidable Utilization Rate (%)**
- **Utilization vs Plan Benchmark**

### AI-Derived Pattern Flags
- ED-first care pattern (Yes / No)
- Post-discharge utilization spike (Yes / No)
- Repeat utilization likelihood (High / Medium / Low)

### Why this matters
AI clusters are valuable because they identify **patterns and sequences**, not just diagnoses.

---

## 4. Risk & Trajectory  
**Question answered:** *What happens if we do nothing?*

### Key Metrics
- **High-Risk Member Count**
- **Rising-Risk Member Count**
- **Cost Growth Rate (3 / 6 / 12 months)**
- **Probability of Hospitalization (Next 90 Days)**

### Why this matters
Clusters with accelerating cost and utilization trends tend to move MLR faster than static high-cost groups.

---

## 5. Quality & Care Gaps  
**Question answered:** *Can we act safely without harming outcomes?*

### Key Metrics
- **% of Members with ≥1 Open Care Gap**
- **Top Impacted Quality Measures**
- **Post-Discharge Follow-Up Rate**
- **Medication Adherence Rate**

### Guardrail Indicators
- **Quality Risk Level:** Low / Medium / High
- **Quality Upside Potential ($)**

### Why this matters
Cost reduction without quality leverage is fragile and often unsustainable.

---

## 6. Opportunity Quantification  
**Question answered:** *Is this a bankable opportunity or just an insight?*

### Key Metrics
- **Identified Opportunity ($)**
- **Addressable Opportunity ($)**
- **Realizable Opportunity ($)**
- **Opportunity per Member ($)**
- **Confidence Score (%)**

### Optional
- Expected PMPM reduction
- Estimated MLR impact
- Time to impact (months)

### Why this matters
Without quantified opportunity and confidence, the cluster cannot be prioritized for action.

---

## 7. Provider & Control Signals  
**Question answered:** *Who can actually change outcomes?*

### Key Metrics
- **% of Members Attributed to Providers**
- **Top 5 Providers’ Control (%)**
- **Provider Cost Variation Index**
- **Providers in Value-Based Care vs Fee-for-Service (%)**

### Why this matters
Clusters without a clear controlling provider or network lever are difficult to operationalize.

---

## 8. Action Readiness & Priority  
**Question answered:** *Should we act now or later?*

### Key Metrics
- **Action Feasibility Score (0–100)**
- **Care Management Capacity Required**
- **Historical Success Rate for Similar Clusters**
- **Expected Time to Impact**

### Composite Metric
- **Cluster Priority Score**  
  (used to rank clusters against one another)

### Why this matters
This section forces the platform to recommend **what to do next**, not just describe the problem.