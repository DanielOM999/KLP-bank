"use client";

import { useState, FormEvent, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [kontonummer, setKontonummer] = useState<string>("");
  const [belop, setBelop] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isOwnAccount = user?.bankkontos?.some(
      (acc) => acc.kontonummer === kontonummer
    );

    if (!isOwnAccount) {
      alert("You can only withdraw from your own accounts");
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
        alert("Withdrawal successful");
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch (error) {
      alert("Withdrawal error");
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div>
      <h1>Withdraw Money</h1>
      <form onSubmit={handleSubmit}>
        <label>Bank Account ID:</label>
        <br />
        <Input
          type="text"
          value={kontonummer}
          onChange={(e) => setKontonummer(e.target.value)}
          className="w-100 bg-white rounded text-black text-xl placeholder:text-gray-600 placeholder:text-lg"
          placeholder="Enter Bank Account ID"
          required
        />
        <br />
        <label>Amount:</label>
        <br />
        <Input
          type="number"
          value={belop}
          onChange={(e) => setBelop(e.target.value)}
          className="w-100 bg-white rounded text-black text-xl placeholder:text-gray-600 placeholder:text-lg"
          placeholder="Enter Amount"
          required
        />
        <br />
        <button type="submit">Withdraw</button>
      </form>
    </div>
  );
};

export default Withdraw;
