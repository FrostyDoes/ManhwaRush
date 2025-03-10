import { SiteHeader } from "@/components/site-header";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "../../../supabase/server";

// Client-compatible admin functions
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

async function getAllUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminUserManagement } from "@/components/admin/user-management";
import { AdminChapterManagement } from "@/components/admin/chapter-management";
import { AdminDashboard } from "@/components/admin/dashboard";
import { Shield, Users, BookOpen, BarChart } from "lucide-react";

export default async function AdminPage() {
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

  // Get all users for the admin dashboard
  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2"
              >
                <BarChart className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>User Management</span>
              </TabsTrigger>
              <TabsTrigger value="chapters" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Chapter Management</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AdminDashboard users={users} />
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user roles, coin balances, and view reading history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminUserManagement users={users} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chapters">
              <Card>
                <CardHeader>
                  <CardTitle>Chapter Management</CardTitle>
                  <CardDescription>
                    Add, edit, or remove chapters for manhwa series
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminChapterManagement />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
