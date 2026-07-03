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
import { Plus, Search, Edit, Trash2, Layers } from 'lucide-react'

const emptyForm = {
  name: '', code: '', level: '', educationLevel: 'secondary', description: '', status: 'active',
}

export function GradeModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const { data, loading, refetch } = useApi<{ grades: any[] }>('/api/grades')
  const items = data?.grades || []
  const canManage = hasPermission(role, 'class.*')

  const filtered = items.filter(g => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.code || '').toLowerCase().includes(search.toLowerCase())
    const matchLevel = levelFilter === 'all' || g.educationLevel === levelFilter
    return matchSearch && matchLevel
  })

  const openCreate = () => {
    setForm(emptyForm)
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      name: item.name || '',
      code: item.code || '',
      level: String(item.level ?? ''),
      educationLevel: item.educationLevel || 'secondary',
      description: item.description || '',
      status: item.status || 'active',
    })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || form.level === '') {
      toast({ title: 'Error', description: 'Name and level are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form, level: Number(form.level) }
      if (editItem) {
        await apiPut(`/api/grades/${editItem.id}`, payload)
        toast({ title: 'Success', description: 'Grade updated' })
      } else {
        await apiPost('/api/grades', payload)
        toast({ title: 'Success', description: 'Grade created' })
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
      await apiDelete(`/api/grades/${deleteId}`)
      toast({ title: 'Success', description: 'Grade deleted' })
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
          <h1 className="text-2xl font-bold text-gray-900">Grades (Classes)</h1>
          <p className="text-gray-500">Manage school grades and their levels</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" /> Add Grade
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{items.length}</p><p className="text-sm text-gray-500">Total Grades</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(g => g.status === 'active').length}</p><p className="text-sm text-gray-500">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{items.reduce((s, g) => s + (g.sections?.length || 0), 0)}</p><p className="text-sm text-gray-500">Sections</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-purple-600">{items.reduce((s, g) => s + (g.studentCount || 0), 0)}</p><p className="text-sm text-gray-500">Students</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Education level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="high_school">High School</SelectItem>
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
              <Layers className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No grades found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Education</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell>{g.code ? <Badge variant="outline" className="font-mono">{g.code}</Badge> : <span className="text-gray-400">-</span>}</TableCell>
                      <TableCell><Badge className="bg-teal-50 text-teal-700">L{g.level}</Badge></TableCell>
                      <TableCell className="text-sm capitalize">{g.educationLevel?.replace('_', ' ') || '-'}</TableCell>
                      <TableCell><Badge variant="outline">{g.sections?.length || 0}</Badge></TableCell>
                      <TableCell className="text-sm">{g.studentCount || 0} <span className="text-gray-400">({g.activeStudentCount || 0} active)</span></TableCell>
                      <TableCell><Badge className={g.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{g.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canManage && <Button variant="ghost" size="icon" onClick={() => openEdit(g)}><Edit className="h-4 w-4" /></Button>}
                          {canManage && <Button variant="ghost" size="icon" onClick={() => setDeleteId(g.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Grade' : 'Add Grade'}</DialogTitle>
            <DialogDescription>{editItem ? 'Update grade info' : 'Create a new grade / class'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input placeholder="e.g. Grade 9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Code</Label><Input placeholder="e.g. G9" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Level (number) *</Label><Input type="number" placeholder="e.g. 9" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required /></div>
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select value={form.educationLevel} onValueChange={(v) => setForm({ ...form, educationLevel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
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
            <AlertDialogTitle>Delete Grade?</AlertDialogTitle>
            <AlertDialogDescription>This will also remove related sections, subjects, and student assignments. This action cannot be undone.</AlertDialogDescription>
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
