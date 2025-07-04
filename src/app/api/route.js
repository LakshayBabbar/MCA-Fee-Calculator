import { NextResponse } from "next/server";
import Other from "@/models/Other";
import { connectToDb } from "@/config/db";
import StampDutyRate from "@/models/stampDuty";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const otherFee = await Other.find();
    const data = await StampDutyRate.find().sort({ state: 1 }).lean();
    return NextResponse.json(
      {
        otherFee: otherFee,
        stampDutyRate: data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
