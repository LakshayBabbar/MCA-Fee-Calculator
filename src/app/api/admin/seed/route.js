import data from "@/data/stampDutyRates.json";
import { connectToDb } from "@/config/db";
import StampDutyRate from "@/models/stampDuty";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
  try {
    await connectToDb();
    const states = Object.keys(data);
    const bulkData = states.map((state) => {
      const stateData = data[state];
      return {
        state,
        types: {
          "share-capital": stateData["share-capital"],
          "no-share-capital": stateData["no-share-capital"],
          "section-8": stateData["section-8"],
        },
      };
    });

    await StampDutyRate.deleteMany();
    await StampDutyRate.insertMany(bulkData);
    return NextResponse.json(
      {
        message: "Seed data inserted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
};
