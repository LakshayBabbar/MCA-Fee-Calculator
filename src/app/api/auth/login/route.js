import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const POST = async (req, res) => {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    const token = await generateToken(
      { id: user._id, email: user.email },
      process.env.ACCESS_SECRET_KEY
    );
    const res = NextResponse.json({
      message: "Logged in Successfully",
    });
    res.cookies.set("token", token.toString(), {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
    });
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
