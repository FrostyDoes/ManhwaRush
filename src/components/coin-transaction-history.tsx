"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Calendar,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  reference_id?: string;
  metadata?: any;
}

interface CoinTransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function CoinTransactionHistory({
  transactions,
  isLoading = false,
}: CoinTransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions based on search term and type
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.transaction_type
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || transaction.transaction_type === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Get transaction type badge variant
  const getTransactionTypeVariant = (type: string) => {
    switch (type) {
      case "purchase":
      case "credit":
      case "admin_credit":
        return "success";
      case "spend":
        return "default";
      case "refund":
        return "outline";
      case "admin_adjustment":
        return "secondary";
      default:
        return "default";
    }
  };

  // Format transaction type for display
  const formatTransactionType = (type: string) => {
    switch (type) {
      case "purchase":
        return "Purchase";
      case "credit":
        return "Credit";
      case "spend":
        return "Spend";
      case "refund":
        return "Refund";
      case "admin_adjustment":
        return "Admin Adjustment";
      case "admin_credit":
        return "Admin Credit";
      default:
        return type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    }
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    if (
      type === "purchase" ||
      type === "credit" ||
      type === "admin_credit" ||
      type === "refund"
    ) {
      return (
        <ArrowUpRight
          className={`h-4 w-4 ${type === "refund" ? "text-blue-500" : "text-green-500"}`}
        />
      );
    } else {
      return <ArrowDownLeft className="h-4 w-4 text-primary" />;
    }
  };

  // Format amount with sign
  const formatAmount = (amount: number, type: string) => {
    if (
      type === "purchase" ||
      type === "credit" ||
      type === "admin_credit" ||
      type === "refund"
    ) {
      return `+${amount}`;
    } else {
      return `-${amount}`;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View your coin transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-2">
              <Coins className="h-10 w-10 animate-pulse text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading transactions...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View your coin transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <Coins className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No transactions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your coin transaction history will appear here
            </p>
            <Button className="mt-6" asChild>
              <a href="/coins">Purchase Coins</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your coin transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="spend">Spending</SelectItem>
                <SelectItem value="credit">Credits</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
                <SelectItem value="admin_adjustment">
                  Admin Adjustments
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" title="Export transactions">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No transactions found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transaction.description}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {transaction.id.substring(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(transaction.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getTransactionTypeVariant(
                            transaction.transaction_type,
                          ) as any
                        }
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        {getTransactionIcon(transaction.transaction_type)}
                        <span>
                          {formatTransactionType(transaction.transaction_type)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`flex items-center justify-end font-medium ${transaction.transaction_type === "spend" ? "text-primary" : "text-green-500"}`}
                      >
                        <Coins className="h-3 w-3 mr-1" />
                        {formatAmount(
                          transaction.amount,
                          transaction.transaction_type,
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredTransactions.length,
              )}{" "}
              of {filteredTransactions.length} transactions
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8"
                  >
                    {page}
                  </Button>
                ),
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
