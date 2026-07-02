'use client'

import { useState } from 'react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, MapPin, GraduationCap, Award, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'

const emptyTeacher = {
  email: '', password: 'password123', firstName: '', lastName: '', gender: 'male',
  qualification: '', specialization: '', experience: 0, phone: '', address: '', salary: 0, photoUrl: '',
}

const SPECIALIZATIONS = [
  'Mathematics', 'Science', 'English', 'Social Studies', 'Amharic', 'Physics',
  'Chemistry', 'Biology', 'Computer Science', 'Physical Education', 'Arts', 'Music',
]

export function TeachersModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()
  const [search, setSearch] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewTeacher, setViewTeacher] = useState<any>(null)
  const [editTeacher, setEditTeacher] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(emptyTeacher)
  const [submitting, setSubmitting] = useState(false)

  const queryString = new URLSearchParams({
    ...(search && { search }),
    ...(specializationFilter !== 'all' && { /* no API filter; we'll filter client-side */ }),
  }).toString()

  const { data, loading, refetch } = useApi<{ teachers: any[] }>(
    `/api/teachers${queryString ? `?${queryString}` : ''}`
  )

  const allTeachers = data?.teachers || []
  const teachers = specializationFilter === 'all'
    ? allTeachers
    : allTeachers.filter((t) => t.specialization === specializationFilter)

  const canCreate = hasPermission(role, 'teacher.create') || role === 'super_admin'
  const canEdit = hasPermission(role, 'teacher.edit') || role === 'super_admin'
  const canDelete = role === 'super_admin'

  const openCreate = () => {
    setForm(emptyTeacher)
    setEditTeacher(null)
    setDialogOpen(true)
  }

  const openEdit = (teacher: any) => {
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
    })
    setEditTeacher(teacher)
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
        await apiPut(`/api/teachers/${editTeacher.id}`, payload)
        toast({ title: 'Success', description: 'Teacher updated successfully' })
      } else {
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
                              {teacher.firstName[0]}{teacher.lastName[0]}
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
                        <Badge className={
                          teacher.status === 'active' ? 'bg-green-100 text-green-700' :
                          teacher.status === 'on_leave' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {teacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setViewTeacher(teacher)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(teacher)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(teacher.id)}
                              className="text-red-600"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
            <DialogDescription>
              {editTeacher ? 'Update teacher information' : 'Register a new teacher account'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <Label>Salary (ETB)</Label>
                <Input
                  type="number"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>
          {viewTeacher && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-xl">
                    {viewTeacher.firstName[0]}{viewTeacher.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{viewTeacher.firstName} {viewTeacher.lastName}</h3>
                  <Badge variant="outline" className="font-mono">{viewTeacher.teacherId}</Badge>
                  <p className="text-sm text-gray-500 mt-1">{viewTeacher.specialization || 'General Studies'}</p>
                </div>
              </div>

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
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm flex items-center gap-2"><MapPin className="h-3 w-3" />{viewTeacher.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
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
