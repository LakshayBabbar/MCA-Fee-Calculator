import { connectToDb } from "@/config/db";
import Other from "@/models/Other";
import { NextResponse } from "next/server";

export const PUT = async (req) => {
  try {
    const body = await req.json();

    await connectToDb();

    const results = await Promise.all(
      body.map((fee) =>
        Other.findOneAndUpdate(
          { name: fee.name },
          { $set: { fee: fee.fee } },
          { new: true }
        )
      )
    );

    return NextResponse.json(
      { message: "Other fees updated successfully", updated: results },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
