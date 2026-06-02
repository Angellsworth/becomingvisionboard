"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useYear } from "@/components/year-provider"

export default function SignUpSuccessPage() {
  const { year } = useYear()
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-paper">
      <div className="w-full max-w-md">
        <Card className="border-silver/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Check Your Email</CardTitle>
            <CardDescription className="text-muted">
              We&apos;ve sent you a confirmation link to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground/80">
              Please check your email and click the confirmation link to activate your account. Once confirmed, you can
              sign in and start your Becoming {year} journey.
            </p>
            <Button asChild className="w-full bg-pacific hover:bg-pacific/90">
              <Link href="/auth/login">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
