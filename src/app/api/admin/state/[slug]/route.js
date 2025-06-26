import { connectToDb } from "@/config/db";
import StampDutyRate from "@/models/stampDuty";
import { NextResponse } from "next/server";

export const PUT = async (req, { params }) => {
  const state = params.slug;
  await connectToDb();
  const body = await req.json();
  try {
    const updated = await StampDutyRate.findOneAndUpdate({ state }, body, {
      new: true,
      upsert: true,
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
};
