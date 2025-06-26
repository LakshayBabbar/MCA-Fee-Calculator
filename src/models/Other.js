import mongoose from "mongoose";

const otherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fee: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Other = mongoose.models.Other || mongoose.model("Other", otherSchema);
export default Other;
