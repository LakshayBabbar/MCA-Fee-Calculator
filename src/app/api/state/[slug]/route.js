import { NextResponse } from "next/server";
import { connectToDb } from "@/config/db";
import StampDutyRate from "@/models/stampDuty";

export const GET = async (req, { params }) => {
  try {
    const state = params.slug;
    await connectToDb();
    const rate = await StampDutyRate.findOne({ state })
      .populate()
      .lean();
    if (!rate)
      return NextResponse.json({ message: "State not found" }, { status: 404 });
    return NextResponse.json(rate);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
