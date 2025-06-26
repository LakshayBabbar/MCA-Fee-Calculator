import { NextResponse } from "next/server";
import { connectToDb } from "@/config/db";
import StampDutyRate from "@/models/stampDuty";

export const POST = async (req, res) => {
  await connectToDb();
  try {
    const data = await req.json();
    const newRate = new StampDutyRate(data);
    await newRate.save();
    return NextResponse.json(newRate, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const data = await StampDutyRate.find().lean();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
