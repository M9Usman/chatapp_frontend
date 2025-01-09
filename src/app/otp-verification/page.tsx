'use client'

import { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp]
      updatedOtp[index] = value
      setOtp(updatedOtp)

      // Move to the next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = () => {
    const otpValue = otp.join('')
    if (otpValue.length === 6) {
      console.log(`Verifying OTP: ${otpValue}`)
      // Add OTP verification logic here
    } else {
      console.error('Invalid OTP')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <Card className="w-[400px] bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">OTP Verification</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter the 6-digit code sent to your email or phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleBackspace(e, index)}
                maxLength={1}
                className="w-12 h-12 text-center text-xl bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={handleVerify}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            disabled={otp.some((digit) => !digit)}
          >
            Verify OTP
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
