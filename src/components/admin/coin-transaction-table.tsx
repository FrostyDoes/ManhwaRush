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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Download,
  Filter,
  Coins,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CoinTransactionTableProps {
  transactions: any[];
}

export function CoinTransactionTable({
  transactions,
}: CoinTransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const itemsPerPage = 10;

  // Filter transactions based on search term and type
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.transaction_type
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.user?.full_name
        ?.toLowerCase()
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

  // Export transactions as CSV
  const exportTransactions = () => {
    const headers = ["ID", "User", "Type", "Amount", "Description", "Date"];
    const csvData = filteredTransactions.map((t) => [
      t.id,
      t.user?.email || "Unknown",
      formatTransactionType(t.transaction_type),
      t.amount,
      t.description,
      t.created_at ? formatDate(t.created_at) : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `coin-transactions-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View transaction details
  const viewTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions or users..."
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
              <SelectItem value="admin_credit">Admin Credits</SelectItem>
              <SelectItem value="admin_adjustment">
                Admin Adjustments
              </SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            title="Export transactions"
            onClick={exportTransactions}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
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
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No transactions found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => viewTransactionDetails(transaction)}
                >
                  <TableCell>
                    <div className="font-medium">
                      {transaction.user?.email || "Unknown User"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.user?.name ||
                        transaction.user?.full_name ||
                        ""}
                    </div>
                  </TableCell>
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
                        {transaction.created_at
                          ? formatDate(transaction.created_at)
                          : "Unknown"}
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
                      className={`flex items-center justify-end font-medium ${
                        transaction.transaction_type === "spend"
                          ? "text-primary"
                          : "text-green-500"
                      }`}
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
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}{" "}
            of {filteredTransactions.length} transactions
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-8 h-8"
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Details Dialog */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Transaction ID
                  </h3>
                  <p className="text-sm font-mono">{selectedTransaction.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Date
                  </h3>
                  <p className="text-sm">
                    {selectedTransaction.created_at
                      ? formatDate(selectedTransaction.created_at)
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  User
                </h3>
                <p className="text-sm font-medium">
                  {selectedTransaction.user?.email || "Unknown User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedTransaction.user?.name ||
                    selectedTransaction.user?.full_name ||
                    ""}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Type
                  </h3>
                  <Badge
                    variant={
                      getTransactionTypeVariant(
                        selectedTransaction.transaction_type,
                      ) as any
                    }
                    className="mt-1 flex items-center gap-1 w-fit"
                  >
                    {getTransactionIcon(selectedTransaction.transaction_type)}
                    <span>
                      {formatTransactionType(
                        selectedTransaction.transaction_type,
                      )}
                    </span>
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Amount
                  </h3>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      selectedTransaction.transaction_type === "spend"
                        ? "text-primary"
                        : "text-green-500"
                    }`}
                  >
                    {formatAmount(
                      selectedTransaction.amount,
                      selectedTransaction.transaction_type,
                    )}{" "}
                    coins
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="text-sm">{selectedTransaction.description}</p>
              </div>

              {selectedTransaction.reference_id && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Reference ID
                  </h3>
                  <p className="text-sm font-mono break-all">
                    {selectedTransaction.reference_id}
                  </p>
                </div>
              )}

              {selectedTransaction.metadata && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Metadata
                  </h3>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-32">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
