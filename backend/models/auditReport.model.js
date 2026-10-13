import mongoose from "mongoose";

const auditReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetPromptRedacted: {
      type: String,
      default: "",
    },
    templateId: {
      type: String,
      default: null,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "F"],
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    categories: [
      {
        name: { type: String, required: true },
        score: { type: Number, required: true },
        passed: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    vectors: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        attackRedacted: { type: String, default: "" },
        resisted: { type: Boolean, required: true },
        severity: { type: String, default: "high" },
        why: { type: String, default: "" },
      },
    ],
    recommendations: [
      {
        type: String,
      },
    ],
    model: {
      type: String,
      default: "gemini-2.5-flash",
    },
    durationMs: {
      type: Number,
      default: 0,
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

export const AuditReport = mongoose.model("AuditReport", auditReportSchema);
export default AuditReport;
