"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSearchParams } from 'next/navigation';

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

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<{ date: string; balance: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const kontonummer = searchParams.get('kontonummer');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, historyRes] = await Promise.all([
          fetch(`http://localhost:5000/api/transaction/history/${kontonummer}`, {
            credentials: 'include'
          }),
          fetch(`http://localhost:5000/api/transaction/balance-history/${kontonummer}`, {
            credentials: 'include'
          })
        ]);

        const txData = (await txRes.json() as RawTransaction[]).map((tx: RawTransaction) => ({
          ...tx,
          belop: Number(tx.belop),
          nySaldo: Number(tx.nySaldo)
        }));
        
        const historyData = (await historyRes.json() as RawBalanceHistoryItem[]).map((item: RawBalanceHistoryItem) => ({
          date: item.date,
          balance: Number(item.balance)
        }));
        
        setTransactions(txData);
        setBalanceHistory(historyData);
        setLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    if (kontonummer) fetchData();
  }, [kontonummer]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Transaction History for {kontonummer}</h2>
      
      <div className="mb-8 bg-black/25 p-4 rounded-lg shadow">
        <h3 className="text-xl mb-4">Balance Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-black/25 p-4 rounded-lg shadow">
        <h3 className="text-xl mb-4">Recent Transactions</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Type</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b">
                <td className="py-2">{new Date(tx.dato).toLocaleDateString()}</td>
                <td className="py-2 capitalize">{tx.type}</td>
                <td className={`py-2 ${tx.type === 'withdraw' ? 'text-red-500' : 'text-green-500'}`}>
                  {tx.type === 'withdraw' ? '-' : '+'}{tx.belop.toFixed(2)}
                </td>
                <td className="py-2">{tx.nySaldo.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}