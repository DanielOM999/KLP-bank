"use client";
// Imports Suspense for lazy loading fallback and hooks for state, effect, and navigation.
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Imports chart components from 'recharts' for rendering the balance history.
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// Imports the back arrow icon from react-icons.
import { IoArrowBackOutline } from "react-icons/io5";

// Imports Next.js Link for navigation.
import Link from "next/link";

// Imports UI components for Card layout.
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

// Imports the custom toast hook for notifications.
import { useToast } from "@/src/components/ui/use-toast";

// Imports the Skeleton component for loading state.
import { Skeleton } from "@/src/components/ui/skeleton";

// Imports table components for displaying recent transactions.
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

// Imports custom chart components for containing the chart and displaying tooltips.
import { ChartContainer, ChartTooltip } from "@/src/components/ui/chart";

// Imports the date formatting function.
import { format } from "date-fns";

// Defines interfaces for transaction data and raw API responses.
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

// Exports the TransactionHistoryPage component wrapped in a Suspense fallback.
export default function TransactionHistoryPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TransactionHistoryContent />
    </Suspense>
  );
}

// Defines the main content for displaying transaction history and balance history.
// Fetches transaction and balance history data from the API and displays them in a chart and table.
function TransactionHistoryContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<
    { date: string; balance: number }[]
  >([]);
  const [noData, setNoData] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const kontonummer = searchParams.get("kontonummer");

  // Fetches both transaction and balance history data from the API.
  // Maps raw string data to the appropriate number types and sets state accordingly.
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
          return;
        }

        if (!Array.isArray(historyJson)) {
          console.error("Balance history error:", historyJson.error);
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
      }
    };

    if (kontonummer) fetchData();
  }, [kontonummer, router, toast]);

  // If no data is found, renders a Card informing the user.
  if (noData) {
    return (
      <Card className="bg-gray-800/50 border border-gray-700 mt-36">
        <Link
          href="/"
          className="absolute left-4 top-24 p-2 hover:bg-gray-700/50 rounded-full transition-colors"
        >
          <IoArrowBackOutline className="text-white text-2xl" />
        </Link>
        <CardHeader>
          <CardTitle>No Transaction History</CardTitle>
          <CardDescription>
            No transactions found for this account
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Renders the balance history chart and recent transactions table.
  return (
    <div className="space-y-6 mt-36">
      <Link
        href="/"
        className="absolute left-4 top-24 p-2 hover:bg-gray-700/50 rounded-full transition-colors"
      >
        <IoArrowBackOutline className="text-white text-2xl" />
      </Link>
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

// Defines a loading skeleton to display while transaction history data is being fetched.
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="absolute left-4 top-24 p-2 hover:bg-gray-700/50 rounded-full transition-colors"
      >
        <IoArrowBackOutline className="text-white text-2xl" />
      </Link>
      <Card className="bg-gray-800/50 mt-36 border border-gray-700">
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
