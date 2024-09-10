import { auth } from "@/firebase/server";
import dbConnect from "@/lib/db_connect";
import User from "@/models/User";
import { handleResponse } from "../../util";
import { serialize } from "cookie";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    await dbConnect();
    const { idToken, email } = await request.json();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // Set session expiration as needed

    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return handleResponse({ message: "Invalide Email or Password" }, 401);

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Serialize the cookie
    const cookie = serialize("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      path: "/",
    });

    return NextResponse.json(
      {},
      {
        headers: {
          ...request.headers,
          "Set-Cookie": cookie,
        },
        status: 200,
      }
    );

    // Set the cookie in the response header
  } catch (error) {
    console.error("Failed to create session:", error);
    handleResponse({ message: "Intenal Server Error!" });
  }
};
