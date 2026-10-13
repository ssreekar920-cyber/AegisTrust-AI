import mongoose from "mongoose";

const threatLogSchema = new mongoose.Schema(
  {
    ts: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sessionId: {
      type: String,
      default: "default-session",
    },
    clientIp: {
      type: String,
      default: "127.0.0.1",
    },
    channel: {
      type: String,
      enum: ["chat", "file", "tool", "audit"],
      required: true,
    },
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      default: "inbound",
    },
    attackType: {
      type: String,
      enum: [
        "prompt_injection",
        "system_prompt_leak",
        "sensitive_data",
        "improper_output",
        "excessive_agency",
        "benign",
      ],
      required: true,
    },
    owaspId: {
      type: String,
      default: null,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    score: {
      type: Number,
      default: 0,
    },
    action: {
      type: String,
      enum: ["allow", "masked", "sanitized", "blocked"],
      required: true,
    },
    payloadRedacted: {
      type: String,
      maxlength: 500,
      default: "",
    },
    payloadHash: {
      type: String,
      default: "",
    },
    piiEntities: [
      {
        type: { type: String },
        count: { type: Number, default: 1 },
      },
    ],
    matchedRules: [
      {
        type: String,
      },
    ],
    llmCalled: {
      type: Boolean,
      default: false,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      default: null,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ["live", "seed"],
      default: "live",
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

threatLogSchema.index({ ts: -1 });
threatLogSchema.index({ severity: 1, ts: -1 });
threatLogSchema.index({ attackType: 1 });

export const ThreatLog = mongoose.model("ThreatLog", threatLogSchema);
export default ThreatLog;
