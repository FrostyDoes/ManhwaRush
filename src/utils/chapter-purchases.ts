import { createClient } from "../../supabase/server";

/**
 * Check if a user has purchased a specific chapter
 * @param userId The user's ID
 * @param chapterId The chapter's ID
 * @returns Boolean indicating if the user has purchased the chapter
 */
export async function hasUserPurchasedChapter(
  userId: string,
  chapterId: string,
): Promise<boolean> {
  if (!userId || !chapterId) return false;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_chapter_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("chapter_id", chapterId)
    .maybeSingle();

  if (error) {
    console.error("Error checking chapter purchase:", error);
    return false;
  }

  return !!data;
}

/**
 * Get all chapters purchased by a user
 * @param userId The user's ID
 * @returns Array of purchased chapter IDs
 */
export async function getUserPurchasedChapters(
  userId: string,
): Promise<string[]> {
  if (!userId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_chapter_purchases")
    .select("chapter_id")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Error fetching purchased chapters:", error);
    return [];
  }

  return data.map((purchase) => purchase.chapter_id);
}

/**
 * Get purchase details for a specific chapter
 * @param userId The user's ID
 * @param chapterId The chapter's ID
 * @returns Purchase details or null if not found
 */
export async function getChapterPurchaseDetails(
  userId: string,
  chapterId: string,
) {
  if (!userId || !chapterId) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_chapter_purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("chapter_id", chapterId)
    .single();

  if (error) {
    console.error("Error fetching chapter purchase details:", error);
    return null;
  }

  return data;
}

/**
 * Get all chapter purchases for a user with chapter details
 * @param userId The user's ID
 * @returns Array of purchases with chapter details
 */
export async function getUserPurchaseHistory(userId: string) {
  if (!userId) return [];

  const supabase = await createClient();

  // This assumes you have a chapters table with these fields
  // Adjust the query based on your actual database schema
  const { data, error } = await supabase
    .from("user_chapter_purchases")
    .select(
      `
      id,
      chapter_id,
      coins_spent,
      purchased_at,
      manhwa:manhwa_id(*),
      chapter:chapter_id(*)
    `,
    )
    .eq("user_id", userId)
    .order("purchased_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching purchase history:", error);
    return [];
  }

  return data;
}
