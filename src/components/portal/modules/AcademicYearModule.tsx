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
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import { Plus, Search, Edit, Trash2, CalendarRange, CheckCircle2 } from 'lucide-react'

const emptyForm = {
  name: '', startDate: '', endDate: '', isCurrent: false, status: 'active',
}

export function AcademicYearModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const { data, loading, refetch } = useApi<{ academicYears: any[] }>('/api/academic-years')
  const items = data?.academicYears || []
  const canManage = hasPermission(role, 'academicyear.*')

  const filtered = items.filter(y => {
    if (!search) return true
    return y.name.toLowerCase().includes(search.toLowerCase())
  })

  const openCreate = () => {
    setForm(emptyForm)
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      name: item.name || '',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      isCurrent: !!item.isCurrent,
      status: item.status || 'active',
    })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.startDate || !form.endDate) {
      toast({ title: 'Error', description: 'Name, start date, and end date are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      if (editItem) {
        await apiPut(`/api/academic-years/${editItem.id}`, form)
        toast({ title: 'Success', description: 'Academic year updated' })
      } else {
        await apiPost('/api/academic-years', form)
        toast({ title: 'Success', description: 'Academic year created' })
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
      await apiDelete(`/api/academic-years/${deleteId}`)
      toast({ title: 'Success', description: 'Academic year deleted' })
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
          <h1 className="text-2xl font-bold text-gray-900">Academic Years</h1>
          <p className="text-gray-500">Manage school academic year sessions</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" /> Add Academic Year
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold text-teal-700">{items.length}</p>
          <p className="text-sm text-gray-500">Total Years</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold text-green-600">{items.filter(y => y.isCurrent).length}</p>
          <p className="text-sm text-gray-500">Current</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold text-emerald-600">{items.filter(y => y.status === 'active').length}</p>
          <p className="text-sm text-gray-500">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold text-purple-600">{items.reduce((s, y) => s + (y._count?.semesters || 0), 0)}</p>
          <p className="text-sm text-gray-500">Semesters</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search academic years..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarRange className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No academic years found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Semesters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((y) => (
                    <TableRow key={y.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{y.name}</span>
                          {y.isCurrent && <Badge className="bg-teal-100 text-teal-700"><CheckCircle2 className="h-3 w-3 mr-1" />Current</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{y.startDate ? new Date(y.startDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-sm">{y.endDate ? new Date(y.endDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell><Badge variant="outline">{y._count?.semesters || 0}</Badge></TableCell>
                      <TableCell>
                        <Badge className={y.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {y.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canManage && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(y)}><Edit className="h-4 w-4" /></Button>
                          )}
                          {canManage && (
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(y.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Academic Year' : 'Add Academic Year'}</DialogTitle>
            <DialogDescription>{editItem ? 'Update academic year info' : 'Create a new academic year session'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="e.g. 2026-2027" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="font-medium">Set as Current Year</Label>
                <p className="text-xs text-gray-500">Only one year can be current at a time</p>
              </div>
              <Switch checked={form.isCurrent} onCheckedChange={(v) => setForm({ ...form, isCurrent: v })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
                {submitting ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Academic Year?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All semesters and exams linked to this year may be affected.</AlertDialogDescription>
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
