"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaPlusCircle } from "react-icons/fa";

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
      } catch (error) {
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
      setUser(prev =>
        prev
          ? {
              ...prev,
              bankkontos: updatedAccounts,
            }
          : null
      );
      setLoading(false);
    } catch (error) {
      console.error("Account creation error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Welcome to KLP Bank</h1>
      <p className="mt-4">
        Create a profile, deposit money, withdraw funds, and check your account
        balance.
      </p>
      {user && (
        <span className="ml-4 text-xl">
          <p className="text-3xl mb-2">{`Welcome, ${user.navn}`}</p>
          <div className="bg-black/25 p-6 rounded-lg shadow-md">
            <div className="flex justify-between mx-4">
              <h2 className="text-2xl font-semibold mb-4 mt-2">
                Your Bank Accounts
              </h2>
              <div className="flex flex-col">
                <label htmlFor="accountType" className="mb-1">
                  Select Account Type:
                </label>
                <select
                  id="accountType"
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="mb-2 p-2 rounded bg-gray-700"
                >
                  <option value="standard">Standard</option>
                  <option value="sparekonto">Sparekonto</option>
                  <option value="bsu">BSU</option>
                </select>
                <button
                  onClick={handleCreateAccount}
                  className="bg-green-500 hover:bg-green-700 rounded p-2 m-2 inline-flex"
                >
                  <FaPlusCircle className="mr-1 mt-1" />
                  Create
                </button>
              </div>
            </div>
            {user.bankkontos && user.bankkontos.length > 0 ? (
              <ul className="space-y-3">
                {user.bankkontos.map((account) => (
                  <li key={account.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Account Number: {account.kontonummer}
                      </span>
                      <span className="font-medium ml-4">
                        Type: {account.kontotype || "standard"}
                      </span>
                      <span className="text-gray-400">
                        <Link
                          href={`/balance?kontonummer=${account.kontonummer}`}
                          className="px-4 py-2 bg-green-600 hover:bg-green-800 text-white rounded"
                        >
                          See balance
                        </Link>
                        <Link
                          href={`/deposit?kontonummer=${account.kontonummer}`}
                          className="px-4 py-2 bg-green-600 hover:bg-green-800 text-white rounded"
                        >
                          Deposit
                        </Link>
                        <Link
                          href={`/withdraw?kontonummer=${account.kontonummer}`}
                          className="px-4 py-2 bg-green-600 hover:bg-green-800 text-white rounded"
                        >
                          Withdraw
                        </Link>
                      </span>
                      <span className="text-gray-400">
                        <Link
                          href={`/transactions?kontonummer=${account.kontonummer}`}
                          className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded"
                        >
                          View History
                        </Link>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No bank accounts found</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-800 text-white rounded"
          >
            Logout
          </button>
        </span>
      )}
    </div>
  );
}
