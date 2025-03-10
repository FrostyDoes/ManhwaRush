import { createClient } from "@supabase/supabase-js";

/**
 * Check if a user has an active subscription
 * @param userId The user's ID
 * @returns Boolean indicating if the user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}

/**
 * Get a user's subscription details
 * @param userId The user's ID
 * @returns The subscription details or null if not found
 */
export async function getUserSubscription(userId: string) {
  if (!userId) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}
