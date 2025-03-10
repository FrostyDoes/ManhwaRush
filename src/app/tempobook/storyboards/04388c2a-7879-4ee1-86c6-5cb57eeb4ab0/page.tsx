import { AdminUserManagement } from "@/components/admin/user-management";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminUserManagementStoryboard() {
  // Sample user data for the storyboard
  const sampleUsers = [
    {
      id: "1",
      email: "admin@example.com",
      name: "Admin User",
      full_name: "Admin User",
      role: "admin",
      coins: 500,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      email: "user1@example.com",
      name: "Regular User",
      full_name: "Regular User",
      role: "user",
      coins: 100,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      email: "user2@example.com",
      name: "Premium User",
      full_name: "Premium User",
      role: "user",
      coins: 250,
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      email: "user3@example.com",
      name: "New User",
      full_name: "New User",
      role: "user",
      coins: 0,
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user roles, coin balances, and view reading history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminUserManagement users={sampleUsers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
