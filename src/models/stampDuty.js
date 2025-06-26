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
    tiers: [
      {
        max: Number,
        rate: Number,
        above: Number,
      },
    ],
  },
  { _id: false }
);

const feeDetailSchema = new mongoose.Schema(
  {
    spice: Number,
    moa: mongoose.Schema.Types.Mixed,
    aoa: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const stampDutyRateSchema = new mongoose.Schema(
  {
    state: { type: String, required: true, unique: true },
    types: {
      "share-capital": feeDetailSchema,
      "no-share-capital": feeDetailSchema,
      "section-8": feeDetailSchema,
    },
  },
  { timestamps: true }
);

const StampDutyRate =
  mongoose.models.StampDutyRate ||
  mongoose.model("StampDutyRate", stampDutyRateSchema);

export default StampDutyRate;
