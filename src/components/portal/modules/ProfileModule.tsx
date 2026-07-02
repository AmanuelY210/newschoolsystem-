'use client'

import { useState, useEffect } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPut } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { User, Mail, Phone, MapPin, Lock, Save, Calendar, Briefcase, GraduationCap, IdCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { ROLE_LABELS } from '@/lib/nav-config'

export function ProfileModule() {
  const { user, setUser } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [form, setForm] = useState({
    name: '', phone: '', address: '', avatar: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '', newPassword: '', confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const { data, loading, refetch } = useApi<{ user: any; profile: any }>('/api/profile')

  useEffect(() => {
    if (data?.user) {
      setForm({
        name: data.user.name || '',
        phone: data.user.phone || '',
        address: data.user.address || '',
        avatar: data.user.avatar || '',
      })
    }
  }, [data])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await apiPut('/api/profile', form)
      broadcastDataUpdate('profile', 'update')
      // Update Zustand store
      if (user) {
        setUser({
          ...user,
          name: res.user.name,
          avatar: res.user.avatar,
        })
      }
      toast({ title: 'Success', description: 'Profile updated successfully' })
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' })
      return
    }
    setSavingPassword(true)
    try {
      await apiPut('/api/profile', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      toast({ title: 'Success', description: 'Password changed successfully' })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const dbUser = data?.user
  const profile = data?.profile

  // Role-specific info
  const roleSpecificInfo = (() => {
    if (role === 'student' && profile) {
      return [
        { icon: IdCard, label: 'Student ID', value: profile.studentId },
        { icon: GraduationCap, label: 'Grade', value: profile.grade?.name || 'N/A' },
        { icon: User, label: 'Section', value: profile.section?.name || 'N/A' },
        { icon: Calendar, label: 'Enrolled', value: new Date(profile.enrollmentDate).toLocaleDateString() },
      ]
    }
    if (role === 'teacher' && profile) {
      return [
        { icon: IdCard, label: 'Teacher ID', value: profile.teacherId },
        { icon: Briefcase, label: 'Specialization', value: profile.specialization || 'N/A' },
        { icon: GraduationCap, label: 'Qualification', value: profile.qualification || 'N/A' },
        { icon: Calendar, label: 'Joined', value: new Date(profile.joinDate).toLocaleDateString() },
      ]
    }
    if (role === 'finance' && profile) {
      return [
        { icon: IdCard, label: 'Staff ID', value: profile.staffId },
      ]
    }
    if (role === 'library' && profile) {
      return [
        { icon: IdCard, label: 'Staff ID', value: profile.staffId },
      ]
    }
    return []
  })()

  const initials = dbUser?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')?.toUpperCase() || 'U'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Manage your account information</p>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-emerald-800 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{dbUser?.name}</h2>
                <p className="text-teal-100 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  {dbUser?.email}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-0">
                    {ROLE_LABELS[role]}
                  </Badge>
                  <Badge className={
                    dbUser?.active
                      ? 'bg-green-500/30 text-green-100 border-0'
                      : 'bg-red-500/30 text-red-100 border-0'
                  }>
                    {dbUser?.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific info */}
          {roleSpecificInfo.length > 0 && (
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Role Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roleSpecificInfo.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Edit Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        {/* Profile Info Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-10"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email (read-only)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-10 bg-gray-50"
                        value={dbUser?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-10"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar URL</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-10"
                        value={form.avatar}
                        onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-700 hover:bg-teal-800"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Current Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      className="pl-10"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      className="pl-10"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      className="pl-10"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700">
                    Password must be at least 6 characters long. Make sure to use a strong, unique password.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingPassword}
                    className="bg-teal-700 hover:bg-teal-800"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Meta */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="font-medium">
                {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Login</p>
              <p className="font-medium">
                {dbUser?.lastLoginAt ? new Date(dbUser.lastLoginAt).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
