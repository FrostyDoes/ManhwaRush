"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Coins,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface CoinManagementDashboardProps {
  totalCoins: number;
  users: any[];
  transactionStats: {
    totalPurchased: number;
    totalSpent: number;
    purchaseCount: number;
    spendCount: number;
  };
}

export function CoinManagementDashboard({
  totalCoins,
  users,
  transactionStats,
}: CoinManagementDashboardProps) {
  // Calculate users with coins
  const usersWithCoins = users.filter((user) => (user.coins || 0) > 0).length;

  // Calculate average coins per user
  const averageCoins =
    users.length > 0 ? Math.round(totalCoins / usersWithCoins) : 0;

  // Calculate distribution data for pie chart
  const distributionData = [
    { name: "In Circulation", value: totalCoins - transactionStats.totalSpent },
    { name: "Spent", value: transactionStats.totalSpent },
  ];

  // Calculate transaction data for bar chart
  const transactionData = [
    {
      name: "Purchases",
      count: transactionStats.purchaseCount,
      amount: transactionStats.totalPurchased,
    },
    {
      name: "Spending",
      count: transactionStats.spendCount,
      amount: transactionStats.totalSpent,
    },
  ];

  // User distribution by coin balance
  const userDistribution = [
    {
      name: "0 coins",
      value: users.filter((user) => (user.coins || 0) === 0).length,
    },
    {
      name: "1-100 coins",
      value: users.filter(
        (user) => (user.coins || 0) > 0 && (user.coins || 0) <= 100,
      ).length,
    },
    {
      name: "101-500 coins",
      value: users.filter(
        (user) => (user.coins || 0) > 100 && (user.coins || 0) <= 500,
      ).length,
    },
    {
      name: "501-1000 coins",
      value: users.filter(
        (user) => (user.coins || 0) > 500 && (user.coins || 0) <= 1000,
      ).length,
    },
    {
      name: ">1000 coins",
      value: users.filter((user) => (user.coins || 0) > 1000).length,
    },
  ];

  // Colors for charts
  const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6"];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-yellow-400 mr-3" />
              <div className="text-3xl font-bold">
                {totalCoins.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total coins in circulation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Users with Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary mr-3" />
              <div className="text-3xl font-bold">{usersWithCoins}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Out of {users.length} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Average Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-green-500 mr-3" />
              <div className="text-3xl font-bold">{averageCoins}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average coins per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Transaction Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpRight className="h-6 w-6 text-green-500 mr-2" />
                <div className="text-xl font-bold">
                  {transactionStats.purchaseCount}
                </div>
              </div>
              <div className="flex items-center">
                <ArrowDownLeft className="h-6 w-6 text-primary mr-2" />
                <div className="text-xl font-bold">
                  {transactionStats.spendCount}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Purchases vs. Spending transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coin Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} coins`, "Amount"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userDistribution}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                  <Legend />
                  <Bar dataKey="value" name="Users" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionData}>
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
                  <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Transaction Count"
                    fill="#6366f1"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="amount"
                    name="Coin Amount"
                    fill="#f43f5e"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
