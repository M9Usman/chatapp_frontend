'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function WelcomePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleJoin = () => {
    // Implement join logic here
    console.log(`Joining as: ${name} with email: ${email}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-cover bg-center" 
      style={{ backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/002/099/717/non_2x/mountain-beautiful-landscape-background-design-illustration-free-vector.jpg')" }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000E0] to-[#00000040] opacity-100" />

      {/* Content */}
      <Card className="w-[350px] bg-black/10 backdrop-blur-md border-gray-100/20 z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome to ChatApp</CardTitle>
          <CardDescription className="text-center text-gray-200">Join the conversation!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/80 border-gray-200/20 text-black placeholder-black"
            />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/80 border-gray-200/20 text-black placeholder-black"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleJoin} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={!name.trim() || !email.trim()}
          >
            Join ChatApp
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
