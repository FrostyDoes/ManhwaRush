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
