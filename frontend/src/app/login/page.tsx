"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/src/components/ui/input"

const Login: React.FC = () => {
  const [navn, setNavn] = useState<string>('');
  const [passord, setPassord] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ navn, passord })
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login error');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <br />
        <Input
          type="text"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          className='w-100 bg-white rounded text-black text-xl placeholder:text-gray-600 placeholder:text-lg'
          placeholder='Enter Name'
          required
        />
        <br />
        <label>Password:</label>
        <br />
        <Input
          type="password"
          value={passord}
          onChange={(e) => setPassord(e.target.value)}
          className='w-100 bg-white rounded text-black text-xl placeholder:text-gray-600 placeholder:text-lg'
          placeholder='Enter Password'
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
