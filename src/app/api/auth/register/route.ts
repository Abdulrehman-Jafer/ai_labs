import { auth } from "@/firebase/server";
import { handleResponse } from "../../util";

export const POST = async (request: Request) => {
  try {
    const { email, password, display_name } = await request.json();

    if (!email || !password || !display_name)
      return handleResponse({ message: "Invalid credentials" }, 400);

    await auth.createUser({
      email,
      password,
      displayName: display_name,
    });

    return handleResponse({}, 201);
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.errorInfo?.code === "auth/email-already-exists")
      return handleResponse({ message: "Email already exists!" }, 409);

    return handleResponse({ message: "Internal Server Error!" });
  }
};
