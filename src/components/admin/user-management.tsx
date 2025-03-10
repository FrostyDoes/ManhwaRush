"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Coins, Edit, Search, Shield, User } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Client-side admin functions
const updateUserRole = async (userId: string, role: "admin" | "user") => {
  if (!userId || !role) {
    return { success: false, error: "Missing required parameters" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

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
};

const updateUserCoins = async (userId: string, coins: number) => {
  if (!userId || coins === undefined) {
    return { success: false, error: "Missing required parameters" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

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
};
import { useToast } from "@/components/ui/use-toast";

interface AdminUserManagementProps {
  users: any[];
}

export function AdminUserManagement({ users }: AdminUserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isEditingCoins, setIsEditingCoins] = useState(false);
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [newCoins, setNewCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEditRole = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role || "user");
    setIsEditingRole(true);
  };

  const handleEditCoins = (user: any) => {
    setSelectedUser(user);
    setNewCoins(user.coins || 0);
    setIsEditingCoins(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const result = await updateUserRole(selectedUser.id, newRole);

      if (result.success) {
        toast({
          title: "Role Updated",
          description: `User ${selectedUser.email} is now a ${newRole}`,
        });
        // Update the user in the local state
        selectedUser.role = newRole;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update role",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsEditingRole(false);
    }
  };

  const handleSaveCoins = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const result = await updateUserCoins(selectedUser.id, newCoins);

      if (result.success) {
        toast({
          title: "Coins Updated",
          description: `User ${selectedUser.email} now has ${newCoins} coins`,
        });
        // Update the user in the local state
        selectedUser.coins = newCoins;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update coins",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsEditingCoins(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Coins</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name || user.full_name || "Unknown"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === "admin" ? (
                    <Badge className="bg-primary">
                      <Shield className="h-3 w-3 mr-1" /> Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <User className="h-3 w-3 mr-1" /> User
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{user.coins || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(user)}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Role
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCoins(user)}
                    >
                      <Coins className="h-4 w-4 mr-1" />
                      Coins
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditingRole} onOpenChange={setIsEditingRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select
              value={newRole}
              onValueChange={(value) => setNewRole(value as "user" | "admin")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingRole(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coins Dialog */}
      <Dialog open={isEditingCoins} onOpenChange={setIsEditingCoins}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coin Balance</DialogTitle>
            <DialogDescription>
              Adjust coin balance for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-400" />
              <Input
                type="number"
                value={newCoins}
                onChange={(e) => setNewCoins(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingCoins(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCoins} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
