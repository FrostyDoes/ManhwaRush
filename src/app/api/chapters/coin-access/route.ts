import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const chapterId = url.searchParams.get("chapterId");
    const manhwaId = url.searchParams.get("manhwaId");
    const chapterNumber = url.searchParams.get("chapterNumber");

    if (!chapterId && (!manhwaId || !chapterNumber)) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    let query = supabase.from("chapters").select("*");

    if (chapterId) {
      query = query.eq("id", chapterId);
    } else {
      query = query
        .eq("manhwa_id", manhwaId)
        .eq("number", parseInt(chapterNumber!));
    }

    const { data, error } = await query.single();

    if (error) {
      return NextResponse.json(
        { error: `Error fetching chapter: ${error.message}` },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      manhwaId: data.manhwa_id,
      number: data.number,
      title: data.title,
      isFree: data.is_free,
      coinPrice: data.coin_price,
      isPremium: data.is_premium,
      createdAt: data.created_at,
    });
  } catch (error: any) {
    console.error("Error in coin access route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chapter access information" },
      { status: 500 },
    );
  }
}
