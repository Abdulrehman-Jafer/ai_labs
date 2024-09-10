import { auth } from "@/firebase/server";
import dbConnect from "@/lib/db_connect";
import User from "@/models/User";
import { handleResponse } from "../../util";

export const POST = async (request: Request) => {
  try {
    await dbConnect();
    const { email, password, display_name } = await request.json();

    if (!email || !password || !display_name)
      return handleResponse({ message: "Missing form data" }, 400);

    console.log({ email, password, display_name });

    await User.create({
      email,
      password,
      display_name,
      timestamp: Date.now(),
    });

    await auth.createUser({
      email,
      password,
      displayName: display_name,
    });

    return handleResponse({ message: "Missing form data" }, 201);
  } catch (error: any) {
    if (error.errorInfo?.code === "auth/email-already-exists") {
      return handleResponse({ message: "Email already exists!" }, 409);
    } else {
      console.error("Error creating user:", error);
      return handleResponse({ message: "Internal Server Error!" });
    }
  }
};
