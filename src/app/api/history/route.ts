import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user's reading history with manhwa and chapter details
    const { data, error } = await supabase
      .from("reading_history")
      .select(
        `
        id,
        progress,
        last_read_at,
        manhwa:manhwa_id(id, title, cover_image, slug),
        chapter:chapter_id(id, number, title)
      `,
      )
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Error fetching reading history: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ history: data || [] });
  } catch (error: any) {
    console.error("Error fetching reading history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reading history" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { manhwaId, chapterId, chapterNumber, progress } = await req.json();

    if (!manhwaId || !chapterId || progress === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Ensure progress is between 0 and 1
    const normalizedProgress = Math.max(0, Math.min(1, progress));

    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if a reading history record already exists
    const { data: existingRecord } = await supabase
      .from("reading_history")
      .select("id, progress")
      .eq("user_id", user.id)
      .eq("manhwa_id", manhwaId)
      .eq("chapter_id", chapterId)
      .maybeSingle();

    const now = new Date().toISOString();

    if (existingRecord) {
      // Only update if the new progress is greater than the existing progress
      if (normalizedProgress > (existingRecord.progress || 0)) {
        const { error } = await supabase
          .from("reading_history")
          .update({
            progress: normalizedProgress,
            last_read_at: now,
          })
          .eq("id", existingRecord.id);

        if (error) {
          return NextResponse.json(
            { error: `Error updating reading progress: ${error.message}` },
            { status: 500 },
          );
        }
      }
    } else {
      // Create a new reading history record
      const { error } = await supabase.from("reading_history").insert({
        user_id: user.id,
        manhwa_id: manhwaId,
        chapter_id: chapterId,
        progress: normalizedProgress,
        last_read_at: now,
      });

      if (error) {
        return NextResponse.json(
          { error: `Error creating reading progress: ${error.message}` },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      progress: normalizedProgress,
      message: "Reading progress updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating reading progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update reading progress" },
      { status: 500 },
    );
  }
}
