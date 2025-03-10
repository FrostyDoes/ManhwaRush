"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Coins,
  TrendingUp,
  UserCheck,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "../../../supabase/client";

interface AdminDashboardProps {
  users: any[];
}

export function AdminDashboard({ users }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: users.length,
    totalChapters: 0,
    totalCoins: 0,
    totalPurchases: 0,
    activeUsers: 0,
    premiumUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      // Get total chapters
      const { count: chaptersCount } = await supabase
        .from("chapters")
        .select("*", { count: "exact", head: true });

      // Get total coins across all users
      const totalCoins = users.reduce(
        (sum, user) => sum + (user.coins || 0),
        0,
      );

      // Get total purchases
      const { count: purchasesCount } = await supabase
        .from("user_chapter_purchases")
        .select("*", { count: "exact", head: true });

      // Get active users (users who have read something in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: activeUsersCount } = await supabase
        .from("reading_history")
        .select("user_id", { count: "exact", head: true })
        .gt("last_read_at", sevenDaysAgo.toISOString())
        .limit(1000);

      // Get premium users (users who have made at least one purchase)
      const { count: premiumUsersCount } = await supabase
        .from("user_chapter_purchases")
        .select("user_id", { count: "exact", head: true })
        .limit(1000);

      setStats({
        totalUsers: users.length,
        totalChapters: chaptersCount || 0,
        totalCoins: totalCoins,
        totalPurchases: purchasesCount || 0,
        activeUsers: activeUsersCount || 0,
        premiumUsers: premiumUsersCount || 0,
      });
    };

    fetchStats();
  }, [users]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Total Users</CardTitle>
          <CardDescription>All registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary mr-3" />
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Active Users</CardTitle>
          <CardDescription>Users active in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-500 mr-3" />
            <div className="text-3xl font-bold">{stats.activeUsers}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Premium Users</CardTitle>
          <CardDescription>Users who purchased content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-amber-500 mr-3" />
            <div className="text-3xl font-bold">{stats.premiumUsers}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Total Chapters</CardTitle>
          <CardDescription>
            Available chapters across all manhwa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
            <div className="text-3xl font-bold">{stats.totalChapters}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Total Purchases</CardTitle>
          <CardDescription>Chapter purchases made</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-purple-500 mr-3" />
            <div className="text-3xl font-bold">{stats.totalPurchases}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Total Coins</CardTitle>
          <CardDescription>Coins in circulation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-yellow-400 mr-3" />
            <div className="text-3xl font-bold">{stats.totalCoins}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
