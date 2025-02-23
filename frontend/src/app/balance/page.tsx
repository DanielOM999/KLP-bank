"use client";

// Imports type definitions from React for component props.
import type React from "react";

// Imports Suspense for lazy loading fallback, and hooks for state, effects, and routing.
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Imports the back arrow icon from react-icons.
import { IoArrowBackOutline } from "react-icons/io5";

// Imports Next.js Link for navigation.
import Link from "next/link";

// Imports UI components for Card layout, form inputs, buttons, and labels.
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";

// Imports the custom toast hook to display notifications.
import { useToast } from "@/src/components/ui/use-toast";

// Imports a Skeleton component to show a loading state.
import { Skeleton } from "@/src/components/ui/skeleton";

// Defines the User interface to type the logged-in user data.
interface User {
  id: number;
  navn: string;
}

// Exports the BalancePage component which wraps its content in a Suspense fallback.
export default function BalancePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BalanceContent />
    </Suspense>
  );
}

// Defines the main content for the BalancePage.
// Handles fetching authentication, reading search params for the account number,
// fetching the account balance, and displaying the result.
function BalanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [bankkontoId, setBankkontoId] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(false);

  // Sets the account number from the URL search parameters.
  useEffect(() => {
    const kontonummer = searchParams.get("kontonummer");
    if (kontonummer) {
      setBankkontoId(kontonummer);
    }
  }, [searchParams, user]);

  // Checks user authentication by fetching current user data.
  // Redirects to login if not authenticated.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/current", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        if (data.user) {
          setUser({
            id: data.user.id,
            navn: data.user.navn,
          });
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Handles form submission to fetch and display the account balance.
  // Displays errors using the toast notification if the API call fails.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/account/balance/${bankkontoId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to get balance",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to get balance",
      });
      setBalance(null);
    } finally {
      setChecking(false);
    }
  };

  // Renders the balance check form, a back link, and the balance result if available.
  return (
    <div className="flex mt-52 items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-24 p-2 hover:bg-gray-700/50 rounded-full transition-colors"
      >
        <IoArrowBackOutline className="text-white text-2xl" />
      </Link>
      <Card className="bg-gray-800/50 w-full max-w-md mx-auto border border-gray-700">
        <CardHeader>
          <CardTitle>Check Balance</CardTitle>
          <CardDescription>View your account balance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankkontoId">Account Number</Label>
              <Input
                id="bankkontoId"
                type="text"
                value={bankkontoId}
                onChange={(e) => setBankkontoId(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                placeholder="Enter account number"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600/80 hover:bg-green-900 text-white transition-colors"
              disabled={checking}
            >
              {checking ? "Checking..." : "Check Balance"}
            </Button>
          </form>

          {balance !== null && (
            <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-secondary-foreground">
                  Current Balance
                </div>
                <div className="text-3xl font-bold mt-1">
                  {Number.parseFloat(balance).toFixed(2)} kr
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Defines a loading skeleton to display while the main content is being fetched.
function LoadingSkeleton() {
  return (
    <div className="flex mt-52 items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-24 p-2 hover:bg-gray-700/50 rounded-full transition-colors"
      >
        <IoArrowBackOutline className="text-white text-2xl" />
      </Link>
      <Card className="bg-gray-800/50 w-full max-w-md mx-auto border border-gray-700">
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
