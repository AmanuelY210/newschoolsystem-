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
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react'

const emptyForm = {
  teacherId: '', gradeId: '', sectionId: '', subjectId: '',
  academicYearId: '', campus: '', weeklyPeriods: '0', room: '', status: 'active',
}

export function TeacherAssignmentModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const { data: teachersData } = useApi<{ teachers: any[] }>('/api/teachers')
  const teachers = teachersData?.teachers || []

  const { data: gradesData } = useApi<{ grades: any[] }>('/api/grades')
  const grades = gradesData?.grades || []

  const { data: yearsData } = useApi<{ academicYears: any[] }>('/api/academic-years')
  const academicYears = yearsData?.academicYears || []

  const subjectsUrl = form.gradeId ? `/api/subjects?gradeId=${form.gradeId}` : '/api/subjects'
  const { data: subjectsData } = useApi<{ subjects: any[] }>(subjectsUrl)
  const subjects = subjectsData?.subjects || []

  const sectionsUrl = form.gradeId ? `/api/sections?gradeId=${form.gradeId}` : '/api/sections'
  const { data: sectionsData } = useApi<{ sections: any[] }>(sectionsUrl)
  const sections = sectionsData?.sections || []

  const queryString = gradeFilter !== 'all' ? `?gradeId=${gradeFilter}` : ''
  const { data, loading, refetch } = useApi<{ teacherAssignments: any[] }>(`/api/teacher-assignments${queryString}`)
  const items = data?.teacherAssignments || []
  const canManage = hasPermission(role, 'teacher.*')

  const filtered = items.filter(a => {
    if (!search) return true
    const teacherName = `${a.teacher?.firstName || ''} ${a.teacher?.lastName || ''}`.toLowerCase()
    const subjectName = (a.subject?.name || '').toLowerCase()
    return teacherName.includes(search.toLowerCase()) || subjectName.includes(search.toLowerCase())
  })

  const openCreate = () => {
    setForm({ ...emptyForm, academicYearId: academicYears.find(y => y.isCurrent)?.id || academicYears[0]?.id || '' })
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      teacherId: item.teacherId || '',
      gradeId: item.gradeId || '',
      sectionId: item.sectionId || '',
      subjectId: item.subjectId || '',
      academicYearId: item.academicYearId || '',
      campus: item.campus || '',
      weeklyPeriods: String(item.weeklyPeriods ?? '0'),
      room: item.room || '',
      status: item.status || 'active',
    })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.teacherId || !form.gradeId || !form.subjectId) {
      toast({ title: 'Error', description: 'Teacher, grade, and subject are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form, weeklyPeriods: Number(form.weeklyPeriods) }
      if (editItem) {
        await apiPut(`/api/teacher-assignments/${editItem.id}`, payload)
        toast({ title: 'Success', description: 'Assignment updated' })
      } else {
        await apiPost('/api/teacher-assignments', payload)
        toast({ title: 'Success', description: 'Assignment created' })
      }
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
      await apiDelete(`/api/teacher-assignments/${deleteId}`)
      toast({ title: 'Success', description: 'Assignment deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Assignments</h1>
          <p className="text-gray-500">Assign teachers to grades, sections, and subjects</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800" disabled={teachers.length === 0 || grades.length === 0}>
            <Plus className="h-4 w-4 mr-2" /> Add Assignment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{items.length}</p><p className="text-sm text-gray-500">Total Assignments</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(a => a.status === 'active').length}</p><p className="text-sm text-gray-500">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{new Set(items.map(a => a.teacherId)).size}</p><p className="text-sm text-gray-500">Teachers Assigned</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-purple-600">{new Set(items.map(a => a.subjectId)).size}</p><p className="text-sm text-gray-500">Subjects Covered</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by teacher or subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Filter by grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No teacher assignments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Periods/Week</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{a.teacher?.firstName} {a.teacher?.lastName}</p>
                          <p className="text-xs text-gray-500">{a.teacher?.teacherId}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{a.grade?.name || '-'}</Badge></TableCell>
                      <TableCell className="text-sm">{a.section?.name || <span className="text-gray-400">All</span>}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{a.subject?.name || '-'}</p>
                          <p className="text-xs text-gray-500">{a.subject?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{a.academicYear?.name || <span className="text-gray-400">-</span>}</TableCell>
                      <TableCell><Badge className="bg-teal-50 text-teal-700">{a.weeklyPeriods}</Badge></TableCell>
                      <TableCell className="text-sm">{a.room || <span className="text-gray-400">-</span>}</TableCell>
                      <TableCell><Badge className={a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{a.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canManage && <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Edit className="h-4 w-4" /></Button>}
                          {canManage && <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Assignment' : 'Add Teacher Assignment'}</DialogTitle>
            <DialogDescription>{editItem ? 'Update assignment info' : 'Assign a teacher to a grade/section/subject'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teacher *</Label>
                <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.teacherId})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={form.academicYearId} onValueChange={(v) => setForm({ ...form, academicYearId: v })}>
                  <SelectTrigger><SelectValue placeholder="Not specified" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not specified</SelectItem>
                    {academicYears.map(y => <SelectItem key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' (Current)' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade *</Label>
                <Select value={form.gradeId} onValueChange={(v) => setForm({ ...form, gradeId: v, sectionId: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>
                    {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={form.sectionId} onValueChange={(v) => setForm({ ...form, sectionId: v })}>
                  <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sections</SelectItem>
                    {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Campus</Label><Input placeholder="e.g. Main" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })} /></div>
              <div className="space-y-2"><Label>Periods/Week</Label><Input type="number" value={form.weeklyPeriods} onChange={(e) => setForm({ ...form, weeklyPeriods: e.target.value })} /></div>
              <div className="space-y-2"><Label>Room</Label><Input placeholder="e.g. 101" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">{submitting ? 'Saving...' : editItem ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription>The teacher will no longer be assigned to this grade/section/subject.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
