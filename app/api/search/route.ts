import { NextRequest, NextResponse } from "next/server";

const SEARXNG_URL =
  process.env.SEARXNG_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get("q");
  const category = searchParams.get("category") || "general";

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Search query is required." },
      { status: 400 }
    );
  }

  try {
    const url = new URL("/search", SEARXNG_URL);

    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");

    if (category !== "general") {
      url.searchParams.set("categories", category);
    }

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `SearXNG returned ${response.status}: ${responseText}`,
        },
        { status: response.status }
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error: "SearXNG did not return valid JSON.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      results: data.results || [],
    });
  } catch (error) {
    console.error("SearXNG error:", error);

    return NextResponse.json(
      {
        error:
          "Could not connect to SearXNG. Make sure the SearXNG container is running.",
      },
      { status: 502 }
    );
  }
}