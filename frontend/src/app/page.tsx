"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useToast } from "@/src/components/ui/use-toast";

interface User {
  id: number;
  navn: string;
  bankkontos?: Bankkonto[];
}

interface Bankkonto {
  id: number;
  kontonummer: string;
  saldo: number;
  kontotype?: string;
}

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAccountType, setNewAccountType] = useState("standard");

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
      } catch {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleCreateAccount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/account/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kontotype: newAccountType }),
      });

      const data = await res.json();
      const updatedAccounts = [...(user?.bankkontos || []), data];
      setUser((prev) =>
        prev
          ? {
              ...prev,
              bankkontos: updatedAccounts,
            }
          : null
      );
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      setLoading(false);
    } catch (error) {
      console.error("Account creation error:", error);
      toast({
        title: "destructive",
        description: "Failed to create account",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    }
  };

  if (loading) {
    return <AccountsSkeleton />;
  }

  return (
    <div className="space-y-6 mt-36">
      <div className="flex items-center justify-between m-4">
        <h1 className="text-3xl font-bold">Welcome, {user?.navn}</h1>
        <Button variant="destructive" className="bg-red-400 hover:bg-red-600" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="m-4 bg-gray-800/50 backdrop-blur-lg border border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
            <CardTitle className="text-white">Your Accounts</CardTitle>
            <CardDescription className="text-gray-300">Manage your bank accounts</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={newAccountType} onValueChange={setNewAccountType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="sparekonto">Savings</SelectItem>
                  <SelectItem value="bsu">BSU</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateAccount} className="hover:bg-gray-600/25">
                <FaPlusCircle className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {user?.bankkontos && user.bankkontos.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {user.bankkontos.map((account) => (
                <Card key={account.id} className="bg-gray-800/30 border border-gray-700 text-white hover:bg-gray-800/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-400">
                      {account.kontotype || "Standard Account"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">{account.kontonummer}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Balance</span>
                        <span className="text-lg font-semibold">
                          {isNaN(account.saldo)
                            ? "0.00"
                            : Number(account.saldo).toFixed(2)}{" "}
                          kr
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="secondary" className="bg-blue-600/80 hover:bg-blue-900 border border-blue-500 text-white">
                          <Link
                            href={`/deposit?kontonummer=${account.kontonummer}`}
                          >
                            Deposit
                          </Link>
                        </Button>
                        <Button asChild variant="secondary" className="bg-green-600/80 hover:bg-green-900 border border-green-500 text-white">
                          <Link
                            href={`/withdraw?kontonummer=${account.kontonummer}`}
                          >
                            Withdraw
                          </Link>
                        </Button>
                        <Button asChild variant="secondary" className="bg-purple-600/80 hover:bg-purple-900 border border-purple-500 text-white">
                          <Link
                            href={`/balance?kontonummer=${account.kontonummer}`}
                          >
                            Balance
                          </Link>
                        </Button>
                        <Button asChild variant="secondary" className="bg-pink-600/80 hover:bg-pink-900 border border-pink-500 text-white">
                          <Link
                            href={`/transactions?kontonummer=${account.kontonummer}`}
                          >
                            History
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No bank accounts found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first account to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-[200px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      <Card className="bg-gray-800/30 border border-gray-700 text-white hover:bg-gray-800/50 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-[140px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[140px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-800/30 border border-gray-700 text-white hover:bg-gray-800/50 transition-colors">
                <CardHeader>
                  <Skeleton className="h-5 w-[140px]" />
                  <Skeleton className="h-4 w-[180px]" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[60px]" />
                      <Skeleton className="h-6 w-[100px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
