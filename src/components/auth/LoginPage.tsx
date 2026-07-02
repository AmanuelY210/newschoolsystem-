'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { GraduationCap, Eye, EyeOff, ArrowLeft, Shield, Users, BookOpen, DollarSign, Library, UserCog } from 'lucide-react'
import { motion } from 'framer-motion'

const ROLE_CARDS = [
  { role: 'super_admin', label: 'Super Admin', icon: Shield, desc: 'Full system control', color: 'from-purple-500 to-purple-700' },
  { role: 'admin', label: 'Admin', icon: UserCog, desc: 'School administration', color: 'from-teal-500 to-teal-700' },
  { role: 'teacher', label: 'Teacher', icon: BookOpen, desc: 'Academic management', color: 'from-orange-500 to-orange-700' },
  { role: 'student', label: 'Student', icon: Users, desc: 'View academic info', color: 'from-emerald-500 to-emerald-700' },
  { role: 'finance', label: 'Finance', icon: DollarSign, desc: 'Finance management', color: 'from-green-500 to-green-700' },
  { role: 'library', label: 'Library', icon: Library, desc: 'Library management', color: 'from-amber-500 to-amber-700' },
]

const DEMO_ACCOUNTS = [
  { email: 'superadmin@school.edu', role: 'Super Admin' },
  { email: 'admin@school.edu', role: 'Admin' },
  { email: 'teacher@school.edu', role: 'Teacher' },
  { email: 'student@school.edu', role: 'Student' },
  { email: 'finance@school.edu', role: 'Finance' },
  { email: 'library@school.edu', role: 'Library' },
]

export function LoginPage() {
  const { navigateToPublic, navigateToPortal, setUser } = useAppStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {})
  }, [])

  const schoolName = settings.school_name || 'Bright Future Academy'
  const tagline = settings.school_tagline || 'Excellence in Education'
  const portalName = settings.portal_name || 'School Management System'
  const logo = settings.logo || ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please enter email and password', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Login Failed', description: data.error || 'Invalid credentials', variant: 'destructive' })
        return
      }

      setUser(data.user)
      toast({ title: 'Welcome!', description: `Logged in as ${data.user.name}` })
      navigateToPortal('dashboard')
    } catch (error) {
      toast({ title: 'Error', description: 'Login failed. Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Left side - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-emerald-300 blur-3xl" />
        </div>

        <div className="relative z-10">
          <button
            onClick={() => navigateToPublic('home')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Website
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
              {logo ? (
                <img src={logo} alt={schoolName} className="h-10 w-10 object-contain" />
              ) : (
                <GraduationCap className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{schoolName}</h1>
              <p className="text-teal-100 text-sm">{portalName}</p>
            </div>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Welcome to your<br />portal dashboard
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-md">
            Access your personalized dashboard with real-time academic data, finance management, library resources, and more.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            {ROLE_CARDS.map((card) => (
              <div key={card.role} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg p-3">
                <card.icon className="h-5 w-5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{card.label}</p>
                  <p className="text-xs text-teal-100 truncate">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-teal-200 text-sm mt-8">
          © {new Date().getFullYear()} {schoolName}. All rights reserved.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-teal-800">Sign in to your account</CardTitle>
              <CardDescription>Enter your credentials to access your portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" className="text-xs text-teal-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-center text-gray-500 mb-3">Quick demo login (password: password123)</p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => quickLogin(acc.email)}
                      className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors text-xs"
                    >
                      <p className="font-semibold text-gray-700">{acc.role}</p>
                      <p className="text-gray-400 truncate">{acc.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
