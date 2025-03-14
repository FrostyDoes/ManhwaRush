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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
import { Coins, Search, Plus, Minus, History, Loader2 } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  coins: number;
}

interface AdminUserCoinAdjustmentProps {
  users: User[];
}

export function AdminUserCoinAdjustment({
  users,
}: AdminUserCoinAdjustmentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAdjustingBalance, setIsAdjustingBalance] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">(
    "add",
  );
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    return (
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle adjusting user's coin balance
  const handleAdjustBalance = (user: User) => {
    setSelectedUser(user);
    setAdjustmentAmount(0);
    setAdjustmentType("add");
    setAdjustmentReason("");
    setIsAdjustingBalance(true);
  };

  // Submit balance adjustment
  const submitBalanceAdjustment = async () => {
    if (!selectedUser || adjustmentAmount <= 0) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/adjust-user-coins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: adjustmentAmount,
          transactionType:
            adjustmentType === "add" ? "admin_credit" : "admin_adjustment",
          description:
            adjustmentReason ||
            `Admin ${adjustmentType === "add" ? "added" : "subtracted"} ${adjustmentAmount} coins`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to adjust balance");
      }

      // Update the user in the local state
      const updatedUsers = users.map((user) => {
        if (user.id === selectedUser.id) {
          return { ...user, coins: data.newBalance };
        }
        return user;
      });

      // This won't actually update the parent component's state,
      // but it's useful for the next render if we need it
      users = updatedUsers;

      // Update the selected user
      if (selectedUser) {
        selectedUser.coins = data.newBalance;
      }

      toast({
        title: "Balance Adjusted",
        description: `Successfully ${adjustmentType === "add" ? "added" : "subtracted"} ${adjustmentAmount} coins for ${selectedUser.email}`,
      });

      setIsAdjustingBalance(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              <TableHead>Coin Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No users found matching your search
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || user.full_name || "Unknown"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
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
                        onClick={() => handleAdjustBalance(user)}
                      >
                        <Coins className="h-4 w-4 mr-1" />
                        Adjust Balance
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}/transactions`}>
                          <History className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Adjust Balance Dialog */}
      <Dialog open={isAdjustingBalance} onOpenChange={setIsAdjustingBalance}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Coin Balance</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <span>Adjust coin balance for {selectedUser.email}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Balance:</span>
              <div className="flex items-center">
                <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-bold">{selectedUser?.coins || 0}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Adjustment Type</label>
              <Select
                value={adjustmentType}
                onValueChange={(value) =>
                  setAdjustmentType(value as "add" | "subtract")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-green-500" />
                      Add Coins
                    </div>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <div className="flex items-center">
                      <Minus className="h-4 w-4 mr-2 text-primary" />
                      Subtract Coins
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="flex items-center">
                <Coins className="h-4 w-4 text-yellow-400 mr-2" />
                <Input
                  type="number"
                  min={1}
                  value={adjustmentAmount}
                  onChange={(e) =>
                    setAdjustmentAmount(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (Optional)</label>
              <Input
                placeholder="Reason for adjustment"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Balance:</span>
                <div className="flex items-center">
                  <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-bold">
                    {adjustmentType === "add"
                      ? (selectedUser?.coins || 0) + adjustmentAmount
                      : Math.max(
                          0,
                          (selectedUser?.coins || 0) - adjustmentAmount,
                        )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdjustingBalance(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={submitBalanceAdjustment}
              disabled={isLoading || adjustmentAmount <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Adjustment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
