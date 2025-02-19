"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/src/components/ui/input"

const Register: React.FC = () => {
  const [navn, setNavn] = useState<string>('');
  const [passord, setPassord] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ navn, passord })
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/login');
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Registration error');
    }
  };

  return (
    <div>
      <h1>Register</h1>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
