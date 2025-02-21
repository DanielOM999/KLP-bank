"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/components/ui/use-toast"

export default function Login() {
  const [navn, setNavn] = useState("")
  const [passord, setPassord] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ navn, passord }),
      })

      const data = await res.json()
      if (res.ok) {
        router.push("/")
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Registration failed",
        })
        setLoading(false)
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid username or password",
      })
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex mt-52 items-center justify-center">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-white">Login</CardTitle>
          <CardDescription className="text-gray-300">Enter your credentials to access your account</CardDescription>
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
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                placeholder="Enter your username"
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
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                placeholder="Enter your password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}