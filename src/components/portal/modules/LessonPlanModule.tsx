'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import { Plus, Search, Edit, Trash2, Eye, ClipboardList, Clock, FileText } from 'lucide-react'

const emptyForm = {
  subjectId: '', teacherId: '', title: '', description: '', content: '',
  date: '', duration: '45', fileUrl: '',
}

export function LessonPlanModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [viewItem, setViewItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const { data: subjectsData } = useApi<{ subjects: any[] }>('/api/subjects')
  const subjects = subjectsData?.subjects || []

  const { data: teachersData } = useApi<{ teachers: any[] }>('/api/teachers')
  const teachers = teachersData?.teachers || []

  const queryString = subjectFilter !== 'all' ? `?subjectId=${subjectFilter}` : ''
  const { data, loading, refetch } = useApi<{ lessonPlans: any[] }>(`/api/lesson-plans${queryString}`)
  const items = data?.lessonPlans || []
  const canManage = hasPermission(role, 'subject.*')

  const filtered = items.filter(l => {
    if (!search) return true
    return l.title.toLowerCase().includes(search.toLowerCase())
  })

  const openCreate = () => {
    setForm(emptyForm)
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      subjectId: item.subjectId || '',
      teacherId: item.teacherId || '',
      title: item.title || '',
      description: item.description || '',
      content: item.content || '',
      date: item.date ? item.date.split('T')[0] : '',
      duration: String(item.duration ?? '45'),
      fileUrl: item.fileUrl || '',
    })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subjectId || !form.title) {
      toast({ title: 'Error', description: 'Subject and title are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form, duration: form.duration ? Number(form.duration) : null }
      if (editItem) {
        await apiPut(`/api/lesson-plans/${editItem.id}`, payload)
        toast({ title: 'Success', description: 'Lesson plan updated' })
      } else {
        await apiPost('/api/lesson-plans', payload)
        toast({ title: 'Success', description: 'Lesson plan created' })
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
      await apiDelete(`/api/lesson-plans/${deleteId}`)
      toast({ title: 'Success', description: 'Lesson plan deleted' })
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
          <h1 className="text-2xl font-bold text-gray-900">Lesson Plans</h1>
          <p className="text-gray-500">Plan and document daily lessons</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800" disabled={subjects.length === 0}>
            <Plus className="h-4 w-4 mr-2" /> Add Lesson Plan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{items.length}</p><p className="text-sm text-gray-500">Total Plans</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{new Set(items.map(l => l.subjectId)).size}</p><p className="text-sm text-gray-500">Subjects</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{new Set(items.map(l => l.teacherId)).size}</p><p className="text-sm text-gray-500">Teachers</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-purple-600">{items.filter(l => l.fileUrl).length}</p><p className="text-sm text-gray-500">With Files</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search lesson plans..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Filter by subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
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
              <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No lesson plans found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.title}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{l.subject?.name || '-'}</p>
                          <p className="text-xs text-gray-500">{l.subject?.grade?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{l.teacher ? `${l.teacher.firstName} ${l.teacher.lastName}` : <span className="text-gray-400">-</span>}</TableCell>
                      <TableCell className="text-sm">{l.date ? new Date(l.date).toLocaleDateString() : <span className="text-gray-400">-</span>}</TableCell>
                      <TableCell><Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{l.duration || 0}m</Badge></TableCell>
                      <TableCell>{l.fileUrl ? <a href={l.fileUrl} target="_blank" rel="noreferrer"><Badge className="bg-teal-50 text-teal-700"><FileText className="h-3 w-3 mr-1" />File</Badge></a> : <span className="text-gray-400">-</span>}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setViewItem(l)}><Eye className="h-4 w-4" /></Button>
                          {canManage && <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Edit className="h-4 w-4" /></Button>}
                          {canManage && <Button variant="ghost" size="icon" onClick={() => setDeleteId(l.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>}
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

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewItem?.title}</DialogTitle>
            <DialogDescription>
              {viewItem?.subject?.name} · {viewItem?.teacher ? `${viewItem.teacher.firstName} ${viewItem.teacher.lastName}` : 'No teacher'}
            </DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              {viewItem.description && (
                <div><p className="text-xs text-gray-500 mb-1">Description</p><p className="text-sm">{viewItem.description}</p></div>
              )}
              {viewItem.content && (
                <div><p className="text-xs text-gray-500 mb-1">Content</p><p className="text-sm whitespace-pre-wrap">{viewItem.content}</p></div>
              )}
              <div className="flex gap-4 text-sm">
                {viewItem.date && <div><span className="text-gray-500">Date: </span>{new Date(viewItem.date).toLocaleDateString()}</div>}
                {viewItem.duration && <div><span className="text-gray-500">Duration: </span>{viewItem.duration} minutes</div>}
              </div>
              {viewItem.fileUrl && (
                <a href={viewItem.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-teal-700 hover:underline text-sm">
                  <FileText className="h-4 w-4 mr-1" /> View attached file
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Lesson Plan' : 'Add Lesson Plan'}</DialogTitle>
            <DialogDescription>{editItem ? 'Update lesson plan info' : 'Create a new lesson plan'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
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
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g. Introduction to Fractions" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea placeholder="Detailed lesson content, activities, etc." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Duration (minutes)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>File URL</Label>
              <Input placeholder="https://..." value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
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
            <AlertDialogTitle>Delete Lesson Plan?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
