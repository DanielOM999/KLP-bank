"use client";

import type React from "react";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
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
import { useToast } from "@/src/components/ui/use-toast";
import { Skeleton } from "@/src/components/ui/skeleton";

interface User {
  id: number;
  navn: string;
}

export default function DepositPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DepositContent />
    </Suspense>
  );
}

function DepositContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [kontonummer, setKontonummer] = useState("");
  const [belop, setBelop] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const kontonummer = searchParams.get("kontonummer");
    if (kontonummer) {
      setKontonummer(kontonummer);
    }
  }, [searchParams, user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/transaction/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ kontonummer, belop }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: "Deposit successful",
        });
        setBelop("");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Deposit failed",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Deposit failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
          <CardTitle className="text-white">Deposit Money</CardTitle>
          <CardDescription className="text-gray-300">
            Add funds to your account
          </CardDescription>
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
              {submitting ? "Processing..." : "Deposit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

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
