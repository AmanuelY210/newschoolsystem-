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
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import { Plus, Edit, Trash2, CalendarDays } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
]

const emptyForm = {
  gradeId: '', sectionId: '', subjectId: '', teacherId: '',
  dayOfWeek: 'Monday', startTime: '08:00', endTime: '09:00', room: '', academicYear: '',
}

export function TimetableModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [gradeFilter, setGradeFilter] = useState('all')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const { data: gradesData } = useApi<{ grades: any[] }>('/api/grades')
  const grades = gradesData?.grades || []

  const { data: subjectsData } = useApi<{ subjects: any[] }>('/api/subjects')
  const subjects = subjectsData?.subjects || []

  const { data: teachersData } = useApi<{ teachers: any[] }>('/api/teachers')
  const teachers = teachersData?.teachers || []

  const sectionsUrl = gradeFilter !== 'all' ? `/api/sections?gradeId=${gradeFilter}` : '/api/sections'
  const { data: sectionsData } = useApi<{ sections: any[] }>(sectionsUrl)
  const sections = sectionsData?.sections || []

  const queryParams = new URLSearchParams()
  if (gradeFilter !== 'all') queryParams.set('gradeId', gradeFilter)
  if (sectionFilter !== 'all') queryParams.set('sectionId', sectionFilter)
  const queryString = queryParams.toString()
  const { data, loading, refetch } = useApi<{ timetables: any[] }>(`/api/timetables${queryString ? `?${queryString}` : ''}`)
  const items = data?.timetables || []
  const canManage = hasPermission(role, 'timetable.*')

  const openCreate = () => {
    setForm({
      ...emptyForm,
      gradeId: gradeFilter !== 'all' ? gradeFilter : (grades[0]?.id || ''),
      sectionId: sectionFilter !== 'all' ? sectionFilter : '',
    })
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      gradeId: item.gradeId || '',
      sectionId: item.sectionId || '',
      subjectId: item.subjectId || '',
      teacherId: item.teacherId || '',
      dayOfWeek: item.dayOfWeek || 'Monday',
      startTime: item.startTime || '08:00',
      endTime: item.endTime || '09:00',
      room: item.room || '',
      academicYear: item.academicYear || '',
    })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.gradeId || !form.subjectId || !form.dayOfWeek || !form.startTime || !form.endTime) {
      toast({ title: 'Error', description: 'Grade, subject, day, and times are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      if (editItem) {
        await apiPut(`/api/timetables/${editItem.id}`, form)
        toast({ title: 'Success', description: 'Timetable entry updated' })
      } else {
        await apiPost('/api/timetables', form)
        toast({ title: 'Success', description: 'Timetable entry created' })
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
      await apiDelete(`/api/timetables/${deleteId}`)
      toast({ title: 'Success', description: 'Entry deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  // Group timetables by day for the grid view
  const getEntriesForCell = (day: string, time: string) => {
    return items.filter(t => {
      if (t.dayOfWeek !== day) return false
      const startHour = parseInt(t.startTime.split(':')[0])
      const slotHour = parseInt(time.split(':')[0])
      return startHour === slotHour
    })
  }

  const subjectColors = ['bg-teal-100 text-teal-800 border-teal-200', 'bg-emerald-100 text-emerald-800 border-emerald-200', 'bg-purple-100 text-purple-800 border-purple-200', 'bg-orange-100 text-orange-800 border-orange-200', 'bg-rose-100 text-rose-800 border-rose-200']
  const getSubjectColor = (subjectId: string) => {
    const idx = subjects.findIndex(s => s.id === subjectId)
    return subjectColors[idx % subjectColors.length]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500">Weekly class schedule</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800" disabled={grades.length === 0}>
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{items.length}</p><p className="text-sm text-gray-500">Total Entries</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{new Set(items.map(t => t.subjectId)).size}</p><p className="text-sm text-gray-500">Subjects</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{new Set(items.map(t => t.teacherId)).size}</p><p className="text-sm text-gray-500">Teachers</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-purple-600">{new Set(items.map(t => t.dayOfWeek)).size}</p><p className="text-sm text-gray-500">Active Days</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={gradeFilter} onValueChange={(v) => { setGradeFilter(v); setSectionFilter('all') }}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Filter by grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Filter by section" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</CardContent></Card>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No timetable entries found. {canManage && 'Click "Add Entry" to create one.'}</p>
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b bg-teal-50">
                    <th className="text-left p-3 text-sm font-semibold text-teal-800 w-20">Time</th>
                    {DAYS.slice(0, 6).map(day => (
                      <th key={day} className="text-left p-3 text-sm font-semibold text-teal-800">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(time => (
                    <tr key={time} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-xs font-medium text-gray-600 align-top">{time}</td>
                      {DAYS.slice(0, 6).map(day => {
                        const entries = getEntriesForCell(day, time)
                        return (
                          <td key={day} className="p-2 align-top">
                            {entries.map(entry => (
                              <div key={entry.id} className={`rounded-md border p-2 mb-1 text-xs ${getSubjectColor(entry.subjectId)}`}>
                                <p className="font-semibold">{entry.subject?.name}</p>
                                <p className="opacity-75">{entry.startTime} - {entry.endTime}</p>
                                {entry.room && <p className="opacity-75">Room: {entry.room}</p>}
                                {entry.teacherId && entry.teacher && (
                                  <p className="opacity-75">{entry.teacher.firstName} {entry.teacher.lastName}</p>
                                )}
                                {canManage && (
                                  <div className="flex gap-1 mt-1">
                                    <button onClick={() => openEdit(entry)} className="opacity-75 hover:opacity-100"><Edit className="h-3 w-3" /></button>
                                    <button onClick={() => setDeleteId(entry.id)} className="opacity-75 hover:opacity-100 text-red-600"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
            <DialogDescription>{editItem ? 'Update entry info' : 'Create a new timetable slot'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    {sections.filter(s => !form.gradeId || s.gradeId === form.gradeId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Not assigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not assigned</SelectItem>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Day *</Label>
                <Select value={form.dayOfWeek} onValueChange={(v) => setForm({ ...form, dayOfWeek: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Start Time *</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required /></div>
              <div className="space-y-2"><Label>End Time *</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Room</Label><Input placeholder="e.g. 101" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
              <div className="space-y-2"><Label>Academic Year</Label><Input placeholder="e.g. 2026-2027" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} /></div>
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
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the timetable slot.</AlertDialogDescription>
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
