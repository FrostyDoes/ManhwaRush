import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Coins, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  reference_id?: string;
}

interface CoinHistoryProps {
  transactions: Transaction[];
}

export function CoinHistory({ transactions }: CoinHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Coins className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No transactions yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your coin transaction history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                transaction.transaction_type === "purchase" ||
                transaction.transaction_type === "credit"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {transaction.transaction_type === "purchase" ||
              transaction.transaction_type === "credit" ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownLeft className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.created_at
                  ? formatDistanceToNow(new Date(transaction.created_at), {
                      addSuffix: true,
                    })
                  : "Unknown date"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                transaction.transaction_type === "purchase" ||
                transaction.transaction_type === "credit"
                  ? "default"
                  : "destructive"
              }
              className="flex items-center gap-1"
            >
              <Coins className="h-3 w-3" />
              {transaction.transaction_type === "purchase" ||
              transaction.transaction_type === "credit"
                ? "+"
                : "-"}
              {transaction.amount}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
