import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { updateReadingProgress } from "@/utils/reading-progress";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { manhwaId, chapterId, chapterNumber, progress } =
      await request.json();

    if (!manhwaId || !chapterId || progress === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await updateReadingProgress(
      user.id,
      manhwaId,
      chapterId,
      chapterNumber,
      progress,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const chapterId = url.searchParams.get("chapterId");
    const manhwaId = url.searchParams.get("manhwaId");

    if (!chapterId && !manhwaId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    let query = supabase
      .from("reading_history")
      .select("progress, last_read_at")
      .eq("user_id", user.id);

    if (chapterId) {
      query = query.eq("chapter_id", chapterId);
    } else if (manhwaId) {
      query = query.eq("manhwa_id", manhwaId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Error fetching reading progress: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      progress: data?.progress || 0,
      lastReadAt: data?.last_read_at || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 },
    );
  }
}
