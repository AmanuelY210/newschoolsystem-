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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import { Plus, Edit, Trash2, Scale } from 'lucide-react'

const emptyForm = {
  name: '', minPercentage: '', maxPercentage: '', grade: '', gradePoint: '', description: '',
}

export function GradingSystemModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const { data, loading, refetch } = useApi<{ gradingSystems: any[] }>('/api/grading-systems')
  const items = data?.gradingSystems || []
  const canManage = hasPermission(role, 'grade.*')

  const filtered = items.filter(g => {
    if (!search) return true
    return g.name.toLowerCase().includes(search.toLowerCase()) || g.grade.toLowerCase().includes(search.toLowerCase())
  })

  const openCreate = () => {
    setForm(emptyForm)
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      name: item.name || '',
      minPercentage: String(item.minPercentage ?? ''),
      maxPercentage: String(item.maxPercentage ?? ''),
      grade: item.grade || '',
      gradePoint: String(item.gradePoint ?? ''),
      description: item.description || '',
    })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || form.minPercentage === '' || form.maxPercentage === '' || !form.grade) {
      toast({ title: 'Error', description: 'Name, min%, max%, and grade are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        minPercentage: Number(form.minPercentage),
        maxPercentage: Number(form.maxPercentage),
        gradePoint: form.gradePoint ? Number(form.gradePoint) : 0,
      }
      if (editItem) {
        await apiPut(`/api/grading-systems/${editItem.id}`, payload)
        toast({ title: 'Success', description: 'Grade updated' })
      } else {
        await apiPost('/api/grading-systems', payload)
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
      await apiDelete(`/api/grading-systems/${deleteId}`)
      toast({ title: 'Success', description: 'Grade deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const gradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-700'
    if (grade.startsWith('B')) return 'bg-teal-100 text-teal-700'
    if (grade.startsWith('C')) return 'bg-blue-100 text-blue-700'
    if (grade.startsWith('D')) return 'bg-amber-100 text-amber-700'
    if (grade.startsWith('F')) return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grading System</h1>
          <p className="text-gray-500">Configure grade boundaries and points</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" /> Add Grade
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{items.length}</p><p className="text-sm text-gray-500">Grade Levels</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{new Set(items.map(g => g.name)).size}</p><p className="text-sm text-gray-500">Systems</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{items.filter(g => g.grade.startsWith('A')).length}</p><p className="text-sm text-gray-500">A Grades</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{items.filter(g => g.grade.startsWith('F')).length}</p><p className="text-sm text-gray-500">Failing Grades</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input placeholder="Search grading systems..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Scale className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No grading systems found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Min %</TableHead>
                    <TableHead>Max %</TableHead>
                    <TableHead>Grade Point</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell><Badge className={gradeColor(g.grade)}>{g.grade}</Badge></TableCell>
                      <TableCell className="text-sm">{g.minPercentage}%</TableCell>
                      <TableCell className="text-sm">{g.maxPercentage}%</TableCell>
                      <TableCell><Badge variant="outline">{g.gradePoint}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-xs truncate">{g.description || <span className="text-gray-400">-</span>}</TableCell>
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
            <DialogDescription>{editItem ? 'Update grade info' : 'Create a new grade boundary'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>System Name *</Label>
              <Input placeholder="e.g. Standard Grading, GPA" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Grade *</Label><Input placeholder="e.g. A+, B, F" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Grade Point</Label><Input type="number" step="0.1" placeholder="e.g. 4.0" value={form.gradePoint} onChange={(e) => setForm({ ...form, gradePoint: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Percentage *</Label><Input type="number" placeholder="e.g. 90" value={form.minPercentage} onChange={(e) => setForm({ ...form, minPercentage: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Max Percentage *</Label><Input type="number" placeholder="e.g. 100" value={form.maxPercentage} onChange={(e) => setForm({ ...form, maxPercentage: e.target.value })} required /></div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Optional notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
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
            <AlertDialogDescription>This will remove this grade boundary from the system.</AlertDialogDescription>
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
