import { NextResponse } from "next/server";

export async function handleResponse<T>(data: T, status: number = 500) {
  return NextResponse.json(data, {
    status,
  });
}
