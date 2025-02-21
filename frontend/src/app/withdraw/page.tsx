"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  bankkontos?: Bankkonto[];
}

interface Bankkonto {
  id: number;
  kontonummer: string;
  saldo: number;
}

const Withdraw: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [kontonummer, setKontonummer] = useState("");
  const [belop, setBelop] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
            bankkontos: data.user.Bankkontos,
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
    setSubmitting(true);

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
          title: "Success",
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
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
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
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Processing..." : "Withdraw"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Withdraw;
