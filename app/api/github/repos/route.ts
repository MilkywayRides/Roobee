import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "GitHub access token not found" },
        { status: 401 }
      );
    }

    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=all", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();
    return NextResponse.json(repos);
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}