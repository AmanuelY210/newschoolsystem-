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
import { Plus, Search, Edit, Trash2, Eye, BookText } from 'lucide-react'

const emptyForm = {
  academicYearId: '', subjectId: '', title: '', description: '', topics: '', objectives: '',
}

export function CurriculumModule() {
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

  const { data: yearsData } = useApi<{ academicYears: any[] }>('/api/academic-years')
  const academicYears = yearsData?.academicYears || []

  const queryString = subjectFilter !== 'all' ? `?subjectId=${subjectFilter}` : ''
  const { data, loading, refetch } = useApi<{ curricula: any[] }>(`/api/curricula${queryString}`)
  const items = data?.curricula || []
  const canManage = hasPermission(role, 'subject.*')

  const filtered = items.filter(c => {
    if (!search) return true
    return c.title.toLowerCase().includes(search.toLowerCase())
  })

  const openCreate = () => {
    setForm({ ...emptyForm, academicYearId: academicYears.find(y => y.isCurrent)?.id || academicYears[0]?.id || '' })
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      academicYearId: item.academicYearId || '',
      subjectId: item.subjectId || '',
      title: item.title || '',
      description: item.description || '',
      topics: item.topics || '',
      objectives: item.objectives || '',
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
      if (editItem) {
        await apiPut(`/api/curricula/${editItem.id}`, form)
        toast({ title: 'Success', description: 'Curriculum updated' })
      } else {
        await apiPost('/api/curricula', form)
        toast({ title: 'Success', description: 'Curriculum created' })
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
      await apiDelete(`/api/curricula/${deleteId}`)
      toast({ title: 'Success', description: 'Curriculum deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const parseTopics = (topics: string | null) => {
    if (!topics) return []
    try {
      const parsed = JSON.parse(topics)
      return Array.isArray(parsed) ? parsed : String(topics).split('\n').filter(Boolean)
    } catch {
      return String(topics).split('\n').filter(Boolean)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curricula</h1>
          <p className="text-gray-500">Manage subject curricula, topics, and objectives</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800" disabled={subjects.length === 0}>
            <Plus className="h-4 w-4 mr-2" /> Add Curriculum
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{items.length}</p><p className="text-sm text-gray-500">Total Curricula</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{new Set(items.map(c => c.subjectId)).size}</p><p className="text-sm text-gray-500">Subjects Covered</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{items.filter(c => c.academicYearId).length}</p><p className="text-sm text-gray-500">Year-Linked</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-purple-600">{academicYears.length}</p><p className="text-sm text-gray-500">Academic Years</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search curricula..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
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
              <BookText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No curricula found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const topics = parseTopics(c.topics)
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{c.subject?.name || '-'}</p>
                            <p className="text-xs text-gray-500">{c.subject?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{c.subject?.grade?.name || <span className="text-gray-400">General</span>}</TableCell>
                        <TableCell><Badge variant="outline">{c.academicYear?.name || <span className="text-gray-400">-</span>}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{topics.length} topics</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setViewItem(c)}><Eye className="h-4 w-4" /></Button>
                            {canManage && <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>}
                            {canManage && <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
              {viewItem?.subject?.name} · {viewItem?.academicYear?.name || 'No academic year'}
            </DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              {viewItem.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{viewItem.description}</p>
                </div>
              )}
              {parseTopics(viewItem.topics).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Topics</p>
                  <ul className="space-y-1">
                    {parseTopics(viewItem.topics).map((t: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-teal-600 mt-1">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {viewItem.objectives && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Objectives</p>
                  <p className="text-sm whitespace-pre-wrap">{viewItem.objectives}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Curriculum' : 'Add Curriculum'}</DialogTitle>
            <DialogDescription>{editItem ? 'Update curriculum info' : 'Create a new curriculum'}</DialogDescription>
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
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g. Algebra - Quadratic Equations" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Brief description of the curriculum" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Topics</Label>
              <Textarea placeholder="One topic per line" value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} rows={4} />
              <p className="text-xs text-gray-500">Enter one topic per line</p>
            </div>
            <div className="space-y-2">
              <Label>Objectives</Label>
              <Textarea placeholder="Learning objectives" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} rows={3} />
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
            <AlertDialogTitle>Delete Curriculum?</AlertDialogTitle>
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
