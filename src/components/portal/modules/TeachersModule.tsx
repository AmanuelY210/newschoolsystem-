'use client'

import { useState, useMemo } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import {
  Plus, Search, Edit, Trash2, Eye, Phone, Mail, MapPin, GraduationCap,
  Award, Briefcase, Key, Lock, Unlock, BookOpen, X, CheckCircle2,
  UserCog, Calendar, Building2,
} from 'lucide-react'
import { motion } from 'framer-motion'

const emptyTeacher = {
  email: '', password: 'password123', firstName: '', lastName: '', gender: 'male',
  qualification: '', specialization: '', experience: 0, phone: '', address: '',
  salary: 0, photoUrl: '', academicYear: '', campus: '', status: 'active',
}

const SPECIALIZATIONS = [
  'Mathematics', 'Science', 'English', 'Social Studies', 'Amharic', 'Physics',
  'Chemistry', 'Biology', 'Computer Science', 'Physical Education', 'Arts', 'Music',
]

type StatusOption = { value: string; label: string; color: string }

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'locked', label: 'Locked', color: 'bg-red-100 text-red-700 border-red-200' },
]

const currentYear = new Date().getFullYear()
const DEFAULT_ACADEMIC_YEAR = `${currentYear}-${currentYear + 1}`

function statusBadge(status: string) {
  const opt = STATUS_OPTIONS.find((o) => o.value === status)
  if (opt) {
    return (
      <Badge variant="outline" className={opt.color}>
        {opt.label}
      </Badge>
    )
  }
  // Fallback for legacy statuses like "on_leave"
  return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">{status}</Badge>
}

export function TeachersModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [search, setSearch] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('profile')
  const [viewTeacher, setViewTeacher] = useState<any>(null)
  const [editTeacher, setEditTeacher] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(emptyTeacher)
  const [submitting, setSubmitting] = useState(false)

  // Assignment management state (working copy used while editing)
  const [assignments, setAssignments] = useState<any[]>([])
  const [newAssignment, setNewAssignment] = useState<{
    gradeId: string
    sectionId: string
    subjectId: string
    academicYear: string
  }>({ gradeId: '', sectionId: 'all', subjectId: '', academicYear: DEFAULT_ACADEMIC_YEAR })

  // Password reset state
  const [resetPasswordTeacher, setResetPasswordTeacher] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  const queryString = new URLSearchParams({
    ...(search && { search }),
  }).toString()

  const { data, loading, refetch } = useApi<{ teachers: any[] }>(
    `/api/teachers${queryString ? `?${queryString}` : ''}`
  )

  // Grades (include sections array; subjects are fetched separately by gradeId)
  const { data: gradesData } = useApi<{ grades: any[] }>('/api/grades')
  // Subjects dynamically filtered by selected grade in the "add assignment" form
  const { data: subjectsData } = useApi<{ subjects: any[] }>(
    newAssignment.gradeId ? `/api/subjects?gradeId=${newAssignment.gradeId}` : null
  )

  const allTeachers = data?.teachers || []
  const teachers = specializationFilter === 'all'
    ? allTeachers
    : allTeachers.filter((t) => t.specialization === specializationFilter)

  const grades = gradesData?.grades || []
  const subjects = subjectsData?.subjects || []

  // Sections available for the currently selected grade in the new assignment form
  const selectedGradeSections = useMemo(() => {
    const g = grades.find((gr) => gr.id === newAssignment.gradeId)
    return g?.sections || []
  }, [grades, newAssignment.gradeId])

  // Permission flags
  const canCreate = hasPermission(role, 'teacher.create') || role === 'super_admin'
  const canEdit = hasPermission(role, 'teacher.edit') || role === 'super_admin'
  const canDelete = role === 'super_admin'
  // Assignments / password / status management: admin + super_admin only
  const canManage = role === 'admin' || role === 'super_admin'

  const openCreate = () => {
    setForm(emptyTeacher)
    setEditTeacher(null)
    setAssignments([])
    setNewAssignment({ gradeId: '', sectionId: 'all', subjectId: '', academicYear: DEFAULT_ACADEMIC_YEAR })
    setActiveTab('profile')
    setDialogOpen(true)
  }

  const openEdit = (teacher: any, tab: string = 'profile') => {
    setForm({
      email: teacher.user?.email || '',
      password: '',
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      gender: teacher.gender || 'male',
      qualification: teacher.qualification || '',
      specialization: teacher.specialization || '',
      experience: teacher.experience || 0,
      phone: teacher.phone || teacher.user?.phone || '',
      address: teacher.address || '',
      salary: teacher.salary || 0,
      photoUrl: teacher.photoUrl || '',
      academicYear: teacher.academicYear || '',
      campus: teacher.campus || '',
      status: teacher.status || 'active',
    })
    setEditTeacher(teacher)
    // Build a working copy of the assignments list (with display names)
    setAssignments(
      (teacher.teacherAssignments || []).map((a: any) => ({
        gradeId: a.gradeId,
        sectionId: a.sectionId || 'all',
        subjectId: a.subjectId,
        academicYear: a.academicYear || DEFAULT_ACADEMIC_YEAR,
        _gradeName: a.grade?.name,
        _sectionName: a.section?.name,
        _subjectName: a.subject?.name,
      }))
    )
    setNewAssignment({ gradeId: '', sectionId: 'all', subjectId: '', academicYear: DEFAULT_ACADEMIC_YEAR })
    setActiveTab(tab)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: any = { ...form }
      if (editTeacher) {
        delete payload.password
        delete payload.email
        // Admins can replace the full assignment list when saving
        if (canManage) {
          payload.assignments = assignments.map((a) => ({
            gradeId: a.gradeId,
            sectionId: a.sectionId === 'all' ? null : a.sectionId,
            subjectId: a.subjectId,
            academicYear: a.academicYear || null,
          }))
        } else {
          // Non-admins cannot change status / salary / assignments
          delete payload.status
          delete payload.salary
        }
        await apiPut(`/api/teachers/${editTeacher.id}`, payload)
        toast({ title: 'Success', description: 'Teacher updated successfully' })
      } else {
        // Create: API ignores status/assignments sent in POST (defaults applied)
        await apiPost('/api/teachers', payload)
        toast({ title: 'Success', description: 'Teacher created successfully' })
      }
      broadcastDataUpdate('teacher', editTeacher ? 'update' : 'create')
      setDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await apiDelete(`/api/teachers/${deleteId}`)
      broadcastDataUpdate('teacher', 'delete')
      toast({ title: 'Success', description: 'Teacher deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  // --- Assignment management handlers ---
  const handleGradeChange = (gradeId: string) => {
    // Reset dependent selections when grade changes
    setNewAssignment({ ...newAssignment, gradeId, sectionId: 'all', subjectId: '' })
  }

  const handleAddAssignment = () => {
    if (!newAssignment.gradeId || !newAssignment.subjectId) {
      toast({ title: 'Warning', description: 'Please select a grade and a subject', variant: 'destructive' })
      return
    }
    // Prevent duplicates (same grade + section + subject)
    const isDup = assignments.some(
      (a) =>
        a.gradeId === newAssignment.gradeId &&
        a.sectionId === newAssignment.subjectId &&
        a.subjectId === newAssignment.subjectId &&
        (a.sectionId || 'all') === (newAssignment.sectionId || 'all')
    )
    if (isDup) {
      toast({ title: 'Warning', description: 'This assignment already exists', variant: 'destructive' })
      return
    }
    const grade = grades.find((g) => g.id === newAssignment.gradeId)
    const section = selectedGradeSections.find((s) => s.id === newAssignment.sectionId)
    const subject = subjects.find((s) => s.id === newAssignment.subjectId)
    setAssignments([
      ...assignments,
      {
        ...newAssignment,
        _gradeName: grade?.name,
        _sectionName: section?.name,
        _subjectName: subject?.name,
      },
    ])
    // Reset the form but keep the selected grade for faster bulk entry
    setNewAssignment({
      gradeId: newAssignment.gradeId,
      sectionId: 'all',
      subjectId: '',
      academicYear: newAssignment.academicYear,
    })
  }

  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index))
  }

  // --- Password reset ---
  const openResetPassword = (teacher: any) => {
    setResetPasswordTeacher(teacher)
    setNewPassword('')
  }

  const handleResetPassword = async () => {
    if (!resetPasswordTeacher || !newPassword) return
    if (newPassword.length < 6) {
      toast({ title: 'Warning', description: 'Password must be at least 6 characters', variant: 'destructive' })
      return
    }
    setResettingPassword(true)
    try {
      await apiPut(`/api/teachers/${resetPasswordTeacher.id}`, { resetPassword: newPassword })
      toast({
        title: 'Password Reset',
        description: `New password for ${resetPasswordTeacher.firstName}: ${newPassword}`,
      })
      setResetPasswordTeacher(null)
      setNewPassword('')
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setResettingPassword(false)
    }
  }

  // --- Status change (immediate action from view dialog) ---
  const handleStatusChange = async (teacher: any, status: string) => {
    try {
      await apiPut(`/api/teachers/${teacher.id}`, { status })
      toast({ title: 'Success', description: `Teacher status changed to "${status}"` })
      broadcastDataUpdate('teacher', 'update')
      // Reflect the change in the open view dialog
      setViewTeacher({ ...teacher, status })
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  // --- Render helpers ---
  const profileFields = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name *</Label>
          <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Last Name *</Label>
          <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editTeacher} />
        </div>
        {!editTeacher && (
          <div className="space-y-2">
            <Label>Password *</Label>
            <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Experience (years)</Label>
          <Input
            type="number"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
            min={0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Specialization</Label>
          <Select value={form.specialization} onValueChange={(v) => setForm({ ...form, specialization: v })}>
            <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Qualification</Label>
          <Input
            placeholder="e.g. MSc, BEd"
            value={form.qualification}
            onChange={(e) => setForm({ ...form, qualification: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        {canManage && (
          <div className="space-y-2">
            <Label>Salary (ETB)</Label>
            <Input
              type="number"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
              min={0}
            />
          </div>
        )}
      </div>

      {/* Academic Year & Campus */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Academic Year</Label>
          <Input
            placeholder={DEFAULT_ACADEMIC_YEAR}
            value={form.academicYear}
            onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Campus</Label>
          <Input
            placeholder="e.g. Main Campus"
            value={form.campus}
            onChange={(e) => setForm({ ...form, campus: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
    </>
  )

  const assignmentsTab = (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-teal-700" />
          Current Assignments
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          These grade/section/subject combinations will replace all existing assignments when you click
          <span className="font-medium text-teal-700"> Update Teacher</span>.
        </p>
        {assignments.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            No assignments yet. Add one below.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {assignments.map((a, idx) => (
              <div
                key={`${a.gradeId}-${a.sectionId}-${a.subjectId}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-md border border-teal-100 bg-teal-50/50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                    {a._gradeName || 'Grade'}
                  </Badge>
                  <Badge variant="outline" className="text-gray-700">
                    {a.sectionId === 'all' ? 'All Sections' : `Sec ${a._sectionName || a.sectionId}`}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    {a._subjectName || 'Subject'}
                  </Badge>
                  {a.academicYear && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {a.academicYear}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:bg-red-50"
                  onClick={() => handleRemoveAssignment(idx)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-200 p-4 bg-gray-50/50">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-teal-700" />
          Add New Assignment
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Grade *</Label>
            <Select value={newAssignment.gradeId} onValueChange={handleGradeChange}>
              <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Section</Label>
            <Select
              value={newAssignment.sectionId}
              onValueChange={(v) => setNewAssignment({ ...newAssignment, sectionId: v })}
              disabled={!newAssignment.gradeId}
            >
              <SelectTrigger><SelectValue placeholder="All Sections" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {selectedGradeSections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>Section {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Subject *</Label>
            <Select
              value={newAssignment.subjectId}
              onValueChange={(v) => setNewAssignment({ ...newAssignment, subjectId: v })}
              disabled={!newAssignment.gradeId}
            >
              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.length === 0 ? (
                  <SelectItem value="_none" disabled>No subjects for this grade</SelectItem>
                ) : (
                  subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Academic Year</Label>
            <Input
              value={newAssignment.academicYear}
              onChange={(e) => setNewAssignment({ ...newAssignment, academicYear: e.target.value })}
              placeholder={DEFAULT_ACADEMIC_YEAR}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-teal-200 text-teal-700 hover:bg-teal-50"
          onClick={handleAddAssignment}
          disabled={!newAssignment.gradeId || !newAssignment.subjectId}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add to List
        </Button>
      </div>
    </div>
  )

  const securityTab = (
    <div className="space-y-5">
      {/* Status management */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <UserCog className="h-4 w-4 text-teal-700" />
          Account Status
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          Control whether this teacher can log in and access the portal.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = form.status === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, status: opt.value })}
                className={`flex flex-col items-center justify-center gap-1 rounded-md border p-3 text-xs font-medium transition-colors ${
                  isActive
                    ? `${opt.color} border-current shadow-sm`
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.value === 'active' && <CheckCircle2 className="h-4 w-4" />}
                {opt.value === 'inactive' && <X className="h-4 w-4" />}
                {opt.value === 'locked' && <Lock className="h-4 w-4" />}
                {opt.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Status will be applied when you click <span className="font-medium text-teal-700">Update Teacher</span>.
        </p>
      </div>

      <div className="border-t border-gray-100 pt-4">
        {/* Password reset (separate action) */}
        <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Key className="h-4 w-4 text-teal-700" />
          Reset Password
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          Set a new password for this teacher. The action is immediate and does not require saving the form.
        </p>
        {editTeacher && (
          <Button
            type="button"
            variant="outline"
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
            onClick={() => {
              setDialogOpen(false)
              openResetPassword(editTeacher)
            }}
          >
            <Key className="h-4 w-4 mr-2" />
            Reset Password for {editTeacher.firstName}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500">Manage teaching staff and their profiles</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-teal-700">{teachers.length}</p>
              <p className="text-sm text-gray-500">Total Teachers</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{teachers.filter((t) => t.status === 'active').length}</p>
              <p className="text-sm text-gray-500">Active</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-orange-600">
                {teachers.filter((t) => t.gender === 'male').length}
              </p>
              <p className="text-sm text-gray-500">Male</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-purple-600">
                {teachers.filter((t) => t.gender === 'female').length}
              </p>
              <p className="text-sm text-gray-500">Female</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or teacher ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {SPECIALIZATIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : teachers.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No teachers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                              {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{teacher.firstName} {teacher.lastName}</p>
                            <p className="text-xs text-gray-500">{teacher.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {teacher.teacherId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{teacher.specialization || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{teacher.qualification || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{teacher.experience || 0} yrs</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{teacher.phone || teacher.user?.phone || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        {statusBadge(teacher.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setViewTeacher(teacher)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(teacher)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(teacher.id)}
                              className="text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
            <DialogDescription>
              {editTeacher
                ? 'Update teacher information, assignments, and security settings'
                : 'Register a new teacher account'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editTeacher && canManage ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="assignments">
                    Assignments
                    {assignments.length > 0 && (
                      <Badge className="ml-1.5 bg-teal-100 text-teal-700 hover:bg-teal-100">
                        {assignments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4 mt-4">
                  {profileFields}
                </TabsContent>
                <TabsContent value="assignments" className="mt-4">
                  {assignmentsTab}
                </TabsContent>
                <TabsContent value="security" className="mt-4">
                  {securityTab}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">{profileFields}</div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
                {submitting ? 'Saving...' : editTeacher ? 'Update' : 'Create'} Teacher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Teacher Dialog */}
      <Dialog open={!!viewTeacher} onOpenChange={(open) => !open && setViewTeacher(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>
          {viewTeacher && (
            <div className="space-y-5">
              {/* Header with avatar + status */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xl">
                      {viewTeacher.firstName?.[0]}{viewTeacher.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{viewTeacher.firstName} {viewTeacher.lastName}</h3>
                    <Badge variant="outline" className="font-mono mt-1">{viewTeacher.teacherId}</Badge>
                    <p className="text-sm text-gray-500 mt-1">{viewTeacher.specialization || 'General Studies'}</p>
                  </div>
                </div>
                <div className="text-right">
                  {statusBadge(viewTeacher.status)}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm flex items-center gap-2"><Mail className="h-3 w-3" />{viewTeacher.user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm flex items-center gap-2"><Phone className="h-3 w-3" />{viewTeacher.phone || viewTeacher.user?.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Qualification</p>
                  <p className="text-sm flex items-center gap-2"><Award className="h-3 w-3" />{viewTeacher.qualification || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="text-sm flex items-center gap-2"><Briefcase className="h-3 w-3" />{viewTeacher.experience || 0} years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm capitalize">{viewTeacher.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Salary</p>
                  <p className="text-sm">{Number(viewTeacher.salary || 0).toLocaleString()} ETB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> Academic Year</p>
                  <p className="text-sm">{viewTeacher.academicYear || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Building2 className="h-3 w-3" /> Campus</p>
                  <p className="text-sm">{viewTeacher.campus || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm flex items-center gap-2"><MapPin className="h-3 w-3" />{viewTeacher.address || 'N/A'}</p>
                </div>
              </div>

              {/* Assignments list */}
              <div className="rounded-md border border-teal-100 bg-teal-50/30 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-700" />
                  Assigned Classes &amp; Subjects
                </h4>
                {viewTeacher.teacherAssignments && viewTeacher.teacherAssignments.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {viewTeacher.teacherAssignments.map((a: any) => (
                      <div
                        key={a.id}
                        className="flex flex-wrap items-center gap-2 rounded-md border border-teal-100 bg-white p-2 text-sm"
                      >
                        <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                          {a.grade?.name || 'Grade'}
                        </Badge>
                        <Badge variant="outline" className="text-gray-700">
                          {a.section ? `Section ${a.section.name}` : 'All Sections'}
                        </Badge>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          {a.subject?.name || 'Subject'}
                        </Badge>
                        {a.academicYear && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {a.academicYear}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No assignments yet.</p>
                )}
              </div>

              {/* Admin actions */}
              {canManage && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  {/* Status toggle buttons */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Quick status change</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={viewTeacher.status === 'active' ? 'default' : 'outline'}
                        className={
                          viewTeacher.status === 'active'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }
                        onClick={() => handleStatusChange(viewTeacher, 'active')}
                        disabled={viewTeacher.status === 'active'}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Activate
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={viewTeacher.status === 'inactive' ? 'default' : 'outline'}
                        className={
                          viewTeacher.status === 'inactive'
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                        onClick={() => handleStatusChange(viewTeacher, 'inactive')}
                        disabled={viewTeacher.status === 'inactive'}
                      >
                        <X className="h-4 w-4 mr-1" /> Deactivate
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={viewTeacher.status === 'locked' ? 'default' : 'outline'}
                        className={
                          viewTeacher.status === 'locked'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'border-red-200 text-red-700 hover:bg-red-50'
                        }
                        onClick={() => handleStatusChange(viewTeacher, 'locked')}
                        disabled={viewTeacher.status === 'locked'}
                      >
                        <Lock className="h-4 w-4 mr-1" /> Lock
                      </Button>
                    </div>
                  </div>

                  {/* Edit / Reset password / Manage assignments */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      onClick={() => {
                        const t = viewTeacher
                        setViewTeacher(null)
                        openEdit(t, 'profile')
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit Profile
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      onClick={() => {
                        const t = viewTeacher
                        setViewTeacher(null)
                        openEdit(t, 'assignments')
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-1" /> Manage Assignments
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => {
                        const t = viewTeacher
                        setViewTeacher(null)
                        openResetPassword(t)
                      }}
                    >
                      <Key className="h-4 w-4 mr-1" /> Reset Password
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordTeacher} onOpenChange={(open) => !open && setResetPasswordTeacher(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-teal-700" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for{' '}
              <span className="font-medium text-gray-900">
                {resetPasswordTeacher?.firstName} {resetPasswordTeacher?.lastName}
              </span>
              . The teacher will need to use this new password on their next login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoFocus
              />
              <p className="text-xs text-gray-500">Minimum 6 characters.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewPassword('password123')}
              >
                Use default (password123)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewPassword(
                    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase()
                  )
                }
              >
                Generate random
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetPasswordTeacher(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={resettingPassword || !newPassword || newPassword.length < 6}
              className="bg-teal-700 hover:bg-teal-800"
            >
              {resettingPassword ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the teacher and their user account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
