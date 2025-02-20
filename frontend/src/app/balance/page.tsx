"use client";

import { useRouter, useSearchParams  } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/src/components/ui/input";

interface User {
  id: number;
  navn: string;
}

const Balance: React.FC = () => {
  const [bankkontoId, setBankkontoId] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
        alert(data.error || "Failed to get balance");
      }
    } catch (error) {
      alert("Error fetching balance");
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div>
      <h1>Check Account Balance</h1>
      <form onSubmit={handleSubmit}>
        <label>Bank Account ID:</label>
        <br />
        <Input
          type="text"
          value={bankkontoId}
          onChange={(e) => setBankkontoId(e.target.value)}
          className="w-100 bg-white rounded text-black text-xl placeholder:text-gray-600 placeholder:text-lg"
          placeholder="Enter Bank Account ID"
          required
        />
        <br />
        <button type="submit">Get Balance</button>
      </form>
      {balance !== null && (
        <div>
          <h2>Balance: {balance}</h2>
        </div>
      )}
    </div>
  );
};

export default Balance;
