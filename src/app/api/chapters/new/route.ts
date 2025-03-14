import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const manhwaId = url.searchParams.get("manhwaId");

    if (!manhwaId) {
      return NextResponse.json({ error: "Missing manhwa ID" }, { status: 400 });
    }

    const supabase = await createClient();

    // Calculate the date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Query for chapters created within the last 3 days
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("manhwa_id", manhwaId)
      .gte("created_at", threeDaysAgo.toISOString())
      .order("number", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Error fetching new chapters: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ newChapters: data || [] });
  } catch (error: any) {
    console.error("Error in new chapters route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch new chapters" },
      { status: 500 },
    );
  }
}
