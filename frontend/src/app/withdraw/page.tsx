"use client";

// Imports type definitions from React to type component props.
import type React from "react";

// Imports Suspense for fallback rendering during lazy loading,
// and hooks (useState, useEffect) along with Next.js navigation hooks.
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Imports the back arrow icon from react-icons and Next.js Link for client-side navigation.
import { IoArrowBackOutline } from "react-icons/io5";
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

// Imports the Skeleton component for displaying a loading state.
import { Skeleton } from "@/src/components/ui/skeleton";

// Defines the User and Bankkonto interfaces for typing user data and bank account details.
interface User {
  id: number;
  navn: string;
  bankkontos?: Bankkonto[];
}

interface Bankkonto {
  id: number;
  kontonummer: string;
  saldo: number;
}

// Exports the WithdrawPage component that wraps its content in a Suspense fallback.
export default function WithdrawPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WithdrawContent />
    </Suspense>
  );
}

// Defines the main content for the withdrawal page.
// Manages state for account number, withdrawal amount, user data, and submission state.
// Checks user authentication and ensures the withdrawal is only made from the user's own account.
function WithdrawContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [kontonummer, setKontonummer] = useState("");
  const [belop, setBelop] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Retrieves the account number from URL search parameters.
  useEffect(() => {
    const kontonummer = searchParams.get("kontonummer");
    if (kontonummer) {
      setKontonummer(kontonummer);
    }
  }, [searchParams, user]);

  // Checks authentication by fetching the current user data.
  // If the user is not authenticated, redirects to the login page.
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
            bankkontos: data.user.Bankkontos,
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

  // Handles form submission for withdrawing funds.
  // Verifies that the account belongs to the current user and sends a POST request to perform the withdrawal.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Checks if the provided account number exists in the user's own bank accounts.
    const isOwnAccount = user?.bankkontos?.some(
      (acc) => acc.kontonummer === kontonummer
    );

    if (!isOwnAccount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You can only withdraw from your own accounts",
      });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/transaction/withdraw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ kontonummer, belop }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "success",
          description: "Withdrawal successful",
        });
        setBelop("");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Withdrawal failed",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Withdrawal failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Renders the withdrawal form, back navigation link, and displays the form within a styled Card.
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
          <CardTitle>Withdraw Money</CardTitle>
          <CardDescription>Withdraw funds from your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kontonummer">Account Number</Label>
              <Input
                id="kontonummer"
                type="text"
                value={kontonummer}
                onChange={(e) => setKontonummer(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="belop">Amount</Label>
              <Input
                id="belop"
                type="number"
                value={belop}
                onChange={(e) => setBelop(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-yellow-600/80 hover:bg-yellow-900 text-white transition-colors"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Withdraw"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Defines a loading skeleton to display while the withdrawal page content loads.
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
