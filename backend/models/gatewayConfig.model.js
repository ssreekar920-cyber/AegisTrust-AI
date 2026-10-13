import mongoose from "mongoose";
import { DEFAULT_HARDENED_SYSTEM_PROMPT } from "../data/prompts.js";

const historyItemSchema = new mongoose.Schema(
  {
    version: { type: String, required: true },
    systemPrompt: { type: String, required: true },
    reason: { type: String, default: "" },
    source: {
      type: String,
      enum: ["initial", "auto-patch"],
      default: "auto-patch",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const gatewayConfigSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: "singleton",
    },
    systemPrompt: {
      type: String,
      default: DEFAULT_HARDENED_SYSTEM_PROMPT,
    },
    version: {
      type: String,
      default: "v1",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    history: [historyItemSchema],
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Gets or initializes the singleton gateway config
 */
gatewayConfigSchema.statics.getSingleton = async function () {
  let config = await this.findById("singleton");
  if (!config) {
    config = await this.create({
      _id: "singleton",
      systemPrompt: DEFAULT_HARDENED_SYSTEM_PROMPT,
      version: "v1",
      history: [
        {
          version: "v1",
          systemPrompt: DEFAULT_HARDENED_SYSTEM_PROMPT,
          reason: "Initial baseline hardened security prompt.",
          source: "initial",
          createdAt: new Date(),
        },
      ],
    });
  }
  return config;
};

export const GatewayConfig = mongoose.model("GatewayConfig", gatewayConfigSchema);
export default GatewayConfig;
