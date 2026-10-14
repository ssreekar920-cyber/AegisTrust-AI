import ThreatLog from "../models/threatLog.model.js";
import Incident from "../models/incident.model.js";

/**
 * Trust Score calculation formula per spec:
 * trust = clamp(100 - 100 * sum(weights) / max(totalRequests, 1), 0, 100)
 * weights: critical 1.0, high 0.75, medium 0.5, low 0.25
 */
export function calculateTrustScore(threats, totalRequests) {
  if (totalRequests === 0) return 100;

  const weights = {
    critical: 1.0,
    high: 0.75,
    medium: 0.5,
    low: 0.25,
  };

  let weightedSum = 0;
  for (const t of threats) {
    if (t.attackType !== "benign") {
      weightedSum += weights[t.severity] || 0.25;
    }
  }

  const rawScore = 100 - (100 * weightedSum) / Math.max(totalRequests, 1);
  const clamped = Math.max(0, Math.min(100, rawScore));
  return Math.round(clamped * 10) / 10;
}

export async function getSummary(hours = 24) {
  const now = new Date();
  const currentWindowStart = new Date(now.getTime() - hours * 60 * 60 * 1000);
  const prevWindowStart = new Date(now.getTime() - 2 * hours * 60 * 60 * 1000);

  // Current window data
  const currentThreats = await ThreatLog.find({
    ts: { $gte: currentWindowStart },
  }).lean();

  const totalRequests = currentThreats.length;
  const attacksBlocked = currentThreats.filter(
    (t) => t.action === "blocked" || (t.attackType !== "benign" && t.action === "sanitized")
  ).length;

  let piiTokenized = 0;
  for (const t of currentThreats) {
    if (t.piiEntities && t.piiEntities.length > 0) {
      for (const ent of t.piiEntities) {
        piiTokenized += ent.count || 1;
      }
    }
  }

  const trustScore = calculateTrustScore(currentThreats, totalRequests);

  // Previous window data for deltas
  const prevThreats = await ThreatLog.find({
    ts: { $gte: prevWindowStart, $lt: currentWindowStart },
  }).lean();

  const prevTotalRequests = prevThreats.length;
  const prevAttacksBlocked = prevThreats.filter(
    (t) => t.action === "blocked" || (t.attackType !== "benign" && t.action === "sanitized")
  ).length;

  const reqDelta =
    prevTotalRequests === 0
      ? 0
      : Math.round(((totalRequests - prevTotalRequests) / prevTotalRequests) * 100);
  const attackDelta =
    prevAttacksBlocked === 0
      ? 0
      : Math.round(((attacksBlocked - prevAttacksBlocked) / prevAttacksBlocked) * 100);

  return {
    totalRequests,
    attacksBlocked,
    piiTokenized,
    trustScore,
    deltas: {
      requests: reqDelta,
      attacks: attackDelta,
    },
  };
}

export async function getTimeseries(hours = 24) {
  const now = new Date();
  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

  const logs = await ThreatLog.find({
    ts: { $gte: startTime },
  })
    .sort({ ts: 1 })
    .lean();

  // Bucket by hour
  const buckets = {};
  for (let i = 0; i < hours; i++) {
    const bucketTime = new Date(startTime.getTime() + i * 60 * 60 * 1000);
    const key = bucketTime.toISOString().slice(0, 13) + ":00";
    buckets[key] = {
      ts: key,
      requests: 0,
      attacks: 0,
    };
  }

  for (const log of logs) {
    const key = new Date(log.ts).toISOString().slice(0, 13) + ":00";
    if (!buckets[key]) {
      buckets[key] = { ts: key, requests: 0, attacks: 0 };
    }
    buckets[key].requests++;
    if (log.attackType !== "benign") {
      buckets[key].attacks++;
    }
  }

  return Object.values(buckets);
}

export async function getCategories() {
  const categoryLabels = {
    prompt_injection: { label: "Prompt Injection", owaspId: "LLM01" },
    system_prompt_leak: { label: "System Prompt Leakage", owaspId: "LLM07" },
    sensitive_data: { label: "Sensitive Data Leak", owaspId: "LLM02" },
    excessive_agency: { label: "Excessive Agency", owaspId: "LLM06" },
    improper_output: { label: "Improper Output", owaspId: "LLM05" },
  };

  const allThreats = await ThreatLog.find();
  const counts = {};
  for (const t of allThreats) {
    if (t.attackType && t.attackType !== "benign") {
      counts[t.attackType] = (counts[t.attackType] || 0) + 1;
    }
  }

  const results = [];
  for (const [attackType, count] of Object.entries(counts)) {
    const info = categoryLabels[attackType] || {
      label: attackType,
      owaspId: "LLMXX",
    };
    results.push({
      owaspId: info.owaspId,
      label: info.label,
      count,
    });
  }

  // Ensure all 5 main categories appear even if count is 0
  for (const [key, info] of Object.entries(categoryLabels)) {
    if (!results.some((r) => r.label === info.label)) {
      results.push({
        owaspId: info.owaspId,
        label: info.label,
        count: 0,
      });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}

export async function getThreats({
  page = 1,
  limit = 20,
  severity,
  category,
  action,
}) {
  const query = {};
  if (severity) query.severity = severity;
  if (category) query.attackType = category;
  if (action) query.action = action;

  const skip = (Math.max(1, page) - 1) * Math.min(50, Math.max(1, limit));
  const safeLimit = Math.min(50, Math.max(1, limit));

  const [items, total] = await Promise.all([
    ThreatLog.find(query)
      .sort({ ts: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    ThreatLog.countDocuments(query),
  ]);

  return {
    items: items.map((item) => ({
      id: item._id.toString(),
      ts: item.ts,
      attackType: item.attackType,
      owaspId: item.owaspId,
      severity: item.severity,
      score: item.score,
      action: item.action,
      payloadRedacted: item.payloadRedacted,
      source: item.source,
      channel: item.channel,
      incidentId: item.incidentId ? item.incidentId.toString() : null,
    })),
    page: Number(page),
    limit: safeLimit,
    total,
  };
}

export async function getThreatById(id) {
  const threat = await ThreatLog.findById(id).lean();
  if (!threat) return null;

  let incident = null;
  if (threat.incidentId) {
    incident = await Incident.findById(threat.incidentId).lean();
  } else {
    // Search if an incident points to this threat
    incident = await Incident.findOne({ threatLogId: threat._id }).lean();
  }

  return {
    threat: {
      ...threat,
      id: threat._id.toString(),
    },
    incident: incident
      ? {
          ...incident,
          id: incident._id.toString(),
        }
      : null,
  };
}

export default {
  calculateTrustScore,
  getSummary,
  getTimeseries,
  getCategories,
  getThreats,
  getThreatById,
};
