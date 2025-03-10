import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "../../../supabase/server";

async function isUserAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=admin");
  }

  // Check if user is an admin
  const isAdmin = await isUserAdmin(user.id);

  if (!isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}
