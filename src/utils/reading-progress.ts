import { createClient } from "../../supabase/server";

/**
 * Update a user's reading progress for a specific chapter
 * @param userId The user's ID
 * @param manhwaId The manhwa ID
 * @param chapterId The chapter ID
 * @param chapterNumber The chapter number
 * @param progress The reading progress (0.0 to 1.0)
 * @returns Success status and any error message
 */
export async function updateReadingProgress(
  userId: string,
  manhwaId: string,
  chapterId: string,
  chapterNumber: number,
  progress: number,
) {
  if (!userId || !manhwaId || !chapterId) {
    return { success: false, error: "Missing required parameters" };
  }

  // Ensure progress is between 0 and 1
  progress = Math.max(0, Math.min(1, progress));

  const supabase = await createClient();

  try {
    // Check if a reading history record already exists
    const { data: existingRecord } = await supabase
      .from("reading_history")
      .select("id, progress")
      .eq("user_id", userId)
      .eq("manhwa_id", manhwaId)
      .eq("chapter_id", chapterId)
      .maybeSingle();

    const now = new Date().toISOString();

    if (existingRecord) {
      // Only update if the new progress is greater than the existing progress
      if (progress > (existingRecord.progress || 0)) {
        const { error } = await supabase
          .from("reading_history")
          .update({
            progress,
            last_read_at: now,
          })
          .eq("id", existingRecord.id);

        if (error) throw error;
      }
    } else {
      // Create a new reading history record
      const { error } = await supabase.from("reading_history").insert({
        user_id: userId,
        manhwa_id: manhwaId,
        chapter_id: chapterId,
        progress,
        last_read_at: now,
      });

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating reading progress:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a user's reading progress for a specific chapter
 * @param userId The user's ID
 * @param chapterId The chapter ID
 * @returns The reading progress or null if not found
 */
export async function getReadingProgress(userId: string, chapterId: string) {
  if (!userId || !chapterId) return null;

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("reading_history")
      .select("progress, last_read_at")
      .eq("user_id", userId)
      .eq("chapter_id", chapterId)
      .single();

    if (error) return null;

    return data;
  } catch (error) {
    console.error("Error fetching reading progress:", error);
    return null;
  }
}

/**
 * Get a user's reading history for all manhwa
 * @param userId The user's ID
 * @returns Array of reading history records
 */
export async function getUserReadingHistory(userId: string) {
  if (!userId) return [];

  const supabase = await createClient();

  try {
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
      .eq("user_id", userId)
      .order("last_read_at", { ascending: false });

    if (error || !data) return [];

    return data;
  } catch (error) {
    console.error("Error fetching reading history:", error);
    return [];
  }
}
