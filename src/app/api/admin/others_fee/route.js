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

export const POST = async (req) => {
  try {
    const body = await req.json();

    await connectToDb();

    const existingFee = await Other.find({ name: body.name });
    if (existingFee.length > 0) {
      return NextResponse.json(
        { error: "Fee with this name already exists" },
        { status: 400 }
      );
    }
    const newFee = new Other({
      name: body.name,
      fee: body.fee,
    });
    await newFee.save();
    return NextResponse.json(
      { message: "New fee added successfully", fee: newFee },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req) => {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json(
        { error: "Fee ID is required" },
        { status: 400 }
      );
    }
    await connectToDb();

    const deletedFee = await Other.findByIdAndDelete(body.id);
    if (!deletedFee) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Fee deleted successfully", fee: deletedFee },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
