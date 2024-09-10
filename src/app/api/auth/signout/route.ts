import { NextResponse } from "next/server";
import dbConnect from "@/lib/db_connect";
import { handleResponse } from "../../util";

export const POST = async (request: Request) => {
  try {
    await dbConnect();

    return NextResponse.json(
      {},
      {
        headers: {
          ...request.headers,
          "Set-Cookie": "session=; Max-Age=0; Path=/; HttpOnly",
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return handleResponse({ message: "Internal Server Error!" });
  }
};
