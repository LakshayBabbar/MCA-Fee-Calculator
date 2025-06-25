import mongoose from "mongoose";

const aoaSchema = new mongoose.Schema(
  {
    type: String,
    rate: Number,
    max: Number,
    min: Number,
    per: Number,
    condition: Number,
    below: Number,
    above: Number,
    tiers: [{ max: Number, rate: Number, above: Number }],
  },
  { _id: false }
);

const companyTypeSchema = new mongoose.Schema(
  {
    spice: Number,
    moa: mongoose.Schema.Types.Mixed,
    aoa: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const stampDutySchema = new mongoose.Schema(
  {
    state: { type: String, unique: true },
    "share-capital": companyTypeSchema,
    "no-share-capital": companyTypeSchema,
    "section-8": companyTypeSchema,
  },
  { timestamps: true }
);

export default mongoose.models.StampDuty ||
  mongoose.model("StampDuty", stampDutySchema);
