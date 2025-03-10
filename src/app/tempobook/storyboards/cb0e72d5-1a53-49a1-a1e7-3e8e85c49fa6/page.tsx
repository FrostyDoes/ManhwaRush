import { AdminDashboard } from "@/components/admin/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, BookOpen, Shield, Users } from "lucide-react";

export default function AdminDashboardStoryboard() {
  // Sample user data for the storyboard
  const sampleUsers = [
    {
      id: "1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      coins: 500,
    },
    {
      id: "2",
      email: "user1@example.com",
      name: "Regular User",
      role: "user",
      coins: 100,
    },
    {
      id: "3",
      email: "user2@example.com",
      name: "Premium User",
      role: "user",
      coins: 250,
    },
  ];

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
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
            <AdminDashboard users={sampleUsers} />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>User management interface would appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chapters">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Chapter management interface would appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
