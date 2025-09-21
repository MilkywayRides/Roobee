import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { path } = await params;
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "GitHub access token not found" },
        { status: 401 }
      );
    }

    const [owner, repo, ...filePath] = path;
    const githubPath = filePath.join("/");
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GitHub content:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository content" },
      { status: 500 }
    );
  }
}