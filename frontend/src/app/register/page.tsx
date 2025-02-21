"use client";

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/components/ui/use-toast"

const Register: React.FC = () => {
  const [navn, setNavn] = useState<string>('')
  const [passord, setPassord] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ navn, passord })
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/login');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Registration failed",
        })
        setLoading(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid username or password",
      })
      setLoading(false)
    }
  };

  return (
    <div className="flex mt-52 items-center justify-center">
      <Card className="w-full max-w-md bg-white/45 text-black">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Enter some credentials and make your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="navn">Username</Label>
              <Input
                id="navn"
                type="text"
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                className="text-white"
                placeholder="Enter a new username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passord">Password</Label>
              <Input
                id="passord"
                type="password"
                value={passord}
                onChange={(e) => setPassord(e.target.value)}
                className="text-white"
                placeholder="Enter a new password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-sm text-center text-gray-400">
              Have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
