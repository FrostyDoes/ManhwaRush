import { createClient } from "../../supabase/server";

/**
 * Check if a user has admin role
 * @param userId The user's ID
 * @returns Boolean indicating if the user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) return false;

    return data.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get all users with their details
 * @returns Array of user objects
 */
export async function getAllUsers() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Update a user's role
 * @param userId The user's ID
 * @param role The new role ('admin' or 'user')
 * @returns Success status and any error message
 */
export async function updateUserRole(userId: string, role: "admin" | "user") {
  if (!userId || !role) {
    return { success: false, error: "Missing required parameters" };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a user's coin balance
 * @param userId The user's ID
 * @param coins The new coin balance
 * @returns Success status and any error message
 */
export async function updateUserCoins(userId: string, coins: number) {
  if (!userId || coins === undefined) {
    return { success: false, error: "Missing required parameters" };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("users")
      .update({ coins })
      .eq("id", userId);

    if (error) throw error;

    // Record the transaction
    await supabase.from("coin_transactions").insert({
      user_id: userId,
      amount: coins,
      transaction_type: "admin_adjustment",
      description: "Admin balance adjustment",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user coins:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all manhwa with their details
 * @returns Array of manhwa objects
 */
export async function getAllManhwa() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("manhwa")
      .select("*")
      .order("title", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching manhwa:", error);
    return [];
  }
}

/**
 * Get all chapters for a specific manhwa
 * @param manhwaId The manhwa ID
 * @returns Array of chapter objects
 */
export async function getManhwaChapters(manhwaId: string) {
  if (!manhwaId) return [];

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("manhwa_id", manhwaId)
      .order("number", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
}

/**
 * Update a chapter's details
 * @param chapterId The chapter ID
 * @param data The updated chapter data
 * @returns Success status and any error message
 */
export async function updateChapter(chapterId: string, data: any) {
  if (!chapterId) {
    return { success: false, error: "Missing chapter ID" };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("chapters")
      .update(data)
      .eq("id", chapterId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating chapter:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new chapter
 * @param data The chapter data
 * @returns Success status and any error message
 */
export async function createChapter(data: any) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("chapters").insert(data);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error creating chapter:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a chapter
 * @param chapterId The chapter ID
 * @returns Success status and any error message
 */
export async function deleteChapter(chapterId: string) {
  if (!chapterId) {
    return { success: false, error: "Missing chapter ID" };
  }

  const supabase = await createClient();

  try {
    // First delete any reading history for this chapter
    await supabase.from("reading_history").delete().eq("chapter_id", chapterId);

    // Then delete any purchases for this chapter
    await supabase
      .from("user_chapter_purchases")
      .delete()
      .eq("chapter_id", chapterId);

    // Finally delete the chapter itself
    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting chapter:", error);
    return { success: false, error: error.message };
  }
}
