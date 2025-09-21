import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    session,
    hasAccessToken: !!session?.accessToken,
    accessToken: session?.accessToken ? "Present" : "Missing"
  });
}