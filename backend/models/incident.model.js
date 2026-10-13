import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    threatLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreatLog",
      index: true,
      default: null,
    },
    source: {
      type: String,
      enum: ["chat", "file", "tool", "email", "integration"],
      required: true,
    },
    payloadRedacted: {
      type: String,
      default: "",
    },
    threatVector: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 90,
    },
    status: {
      type: String,
      enum: ["open", "patched", "dismissed"],
      default: "open",
    },
    patch: {
      systemPrompt: { type: String, default: null },
      rationale: [{ type: String }],
      appliedAt: { type: Date, default: null },
      version: { type: String, default: null },
    },
    createdAt: {
      type: Date,
      default: Date.now,
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

export const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;
