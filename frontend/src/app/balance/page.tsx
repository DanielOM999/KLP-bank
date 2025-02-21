"use client";

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/components/ui/use-toast"
import { Skeleton } from "@/src/components/ui/skeleton"

interface User {
  id: number;
  navn: string;
}

const Balance: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [bankkontoId, setBankkontoId] = useState("")
  const [balance, setBalance] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const kontonummer = searchParams.get('kontonummer');
    if (kontonummer) {
      setBankkontoId(kontonummer);
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
          setLoading(false);
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true)
    
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
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get balance",
      })
      setBalance(null)
    } finally {
      setChecking(false)
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
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
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
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
              placeholder="Enter account number"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={checking}>
            {checking ? "Checking..." : "Check Balance"}
          </Button>
        </form>

        {balance !== null && (
          <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium text-secondary-foreground">Current Balance</div>
              <div className="text-3xl font-bold mt-1">{Number.parseFloat(balance).toFixed(2)} kr</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Balance;
