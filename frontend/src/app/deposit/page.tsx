"use client";

import { useState, FormEvent } from 'react';
import { Input } from "@/src/components/ui/input"

const Deposit: React.FC = () => {
  const [kontonummer, setKontonummer] = useState<string>('');
  const [belop, setBelop] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/transaction/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ kontonummer, belop })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Deposit successful');
      } else {
        alert(data.error || 'Deposit failed');
      }
    } catch (error) {
      alert('Deposit error');
    }
  };

  return (
    <div>
      <h1>Deposit Money</h1>
      <form onSubmit={handleSubmit}>
        <label>Bank Account ID:</label>
        <br />
        <Input
          type="text"
          value={kontonummer}
          onChange={(e) => setKontonummer(e.target.value)}
          className='w-100 bg-white rounded text-black text-xl placeholder:text-gray-600 placeholder:text-lg'
          placeholder='Enter Bank Account ID'
          required
        />
        <br />
        <label>Amount:</label>
        <br />
        <Input
          type="number"
          value={belop}
          onChange={(e) => setBelop(e.target.value)}
          className='w-100 bg-white rounded text-black text-xl placeholder:text-gray-600 placeholder:text-lg'
          placeholder='Enter Amount'
          required
        />
        <br />
        <button type="submit">Deposit</button>
      </form>
    </div>
  );
};

export default Deposit;
