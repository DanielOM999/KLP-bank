"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useToast } from "@/src/components/ui/use-toast";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { ChartContainer, ChartTooltip } from "@/src/components/ui/chart";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: string;
  belop: number;
  dato: string;
  nySaldo: number;
}

interface RawTransaction {
  id: string;
  type: string;
  belop: string;
  dato: string;
  nySaldo: string;
  createdAt: string;
  updatedAt: string;
  bankkontoId: string;
}

interface RawBalanceHistoryItem {
  date: string;
  balance: string;
}

export default function TransactionHistoryPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TransactionHistoryContent />
    </Suspense>
  );
}

function TransactionHistoryContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<
    { date: string; balance: number }[]
  >([]);
  // const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const kontonummer = searchParams.get("kontonummer");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, historyRes] = await Promise.all([
          fetch(
            `http://localhost:5000/api/transaction/history/${kontonummer}`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `http://localhost:5000/api/transaction/balance-history/${kontonummer}`,
            {
              credentials: "include",
            }
          ),
        ]);

        if (txRes.status === 401 || historyRes.status === 401) {
          router.push("/login");
          return;
        }

        const txJson = await txRes.json();
        const historyJson = await historyRes.json();

        if (!Array.isArray(txJson)) {
          console.error("Transaction history error:", txJson.error);
          // setLoading(false);
          return;
        }

        if (!Array.isArray(historyJson)) {
          console.error("Balance history error:", historyJson.error);
          // setLoading(false);
          return;
        }

        const txData = txJson.map((tx: RawTransaction) => ({
          ...tx,
          belop: Number(tx.belop),
          nySaldo: Number(tx.nySaldo),
        }));

        const historyData = historyJson.map((item: RawBalanceHistoryItem) => ({
          date: item.date,
          balance: Number(item.balance),
        }));

        if (txData.length === 0 || historyData.length === 0) {
          setNoData(true);
        } else {
          setTransactions(txData);
          setBalanceHistory(historyData);
          setNoData(false);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch transaction history",
        });
        if (error instanceof Error && error.message === "Unauthorized") {
          router.push("/login");
        }
      } finally {
        // setLoading(false);
      }
    };

    if (kontonummer) fetchData();
  }, [kontonummer, router, toast]);

  if (noData) {
    return (
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardHeader>
          <CardTitle>No Transaction History</CardTitle>
          <CardDescription>
            No transactions found for this account
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Balance History</CardTitle>
          <CardDescription className="text-gray-300">
            Account: {kontonummer}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer>
              <LineChart data={balanceHistory}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="#ffffff"
                  tick={{ fill: "#fff" }}
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis
                  stroke="#ffffff"
                  tick={{ fill: "#fff" }}
                  tickFormatter={(value) => `${value.toLocaleString()} kr`}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const date = payload[0]?.payload?.date;
                      const value = payload[0]?.value ?? 0;

                      if (date) {
                        return (
                          <div className="rounded-lg border border-gray-700 bg-gray-900 backdrop-blur-md p-3 shadow-xl">
                            <div className="grid grid-cols-2 gap-2 text-white">
                              <div className="font-semibold">Date:</div>
                              <div className="text-gray-300">
                                {format(new Date(date), "MMM d, yyyy")}
                              </div>
                              <div className="font-semibold">Balance:</div>
                              <div className="text-emerald-400 font-mono">
                                {(value as number).toLocaleString()} kr
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#22c55e",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <CardDescription className="text-gray-300">
            View your transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="border border-gray-700">
            <TableHeader className="bg-gray-900/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="hover:bg-gray-800/30 transition-colors border-b border-gray-800"
                >
                  <TableCell className="text-gray-200">
                    {format(new Date(tx.dato), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="capitalize text-gray-400">
                    {tx.type}
                  </TableCell>
                  <TableCell
                    className={`font-medium ${
                      tx.type === "withdraw"
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    <span className="font-mono">
                      {tx.type === "withdraw" ? "-" : "+"}
                      {Math.abs(tx.belop).toLocaleString()} kr
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-200 font-mono">
                    {tx.nySaldo.toLocaleString()} kr
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardHeader>
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
