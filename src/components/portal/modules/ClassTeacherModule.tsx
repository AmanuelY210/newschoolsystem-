'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPut } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import { Search, GraduationCap, UserCheck, UserX } from 'lucide-react'

export function ClassTeacherModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: gradesData } = useApi<{ grades: any[] }>('/api/grades')
  const grades = gradesData?.grades || []

  const { data: teachersData } = useApi<{ teachers: any[] }>('/api/teachers')
  const teachers = teachersData?.teachers || []

  const queryString = gradeFilter !== 'all' ? `?gradeId=${gradeFilter}` : ''
  const { data, loading, refetch } = useApi<{ sections: any[] }>(`/api/sections${queryString}`)
  const sections = data?.sections || []
  const canManage = hasPermission(role, 'section.*')

  const filtered = sections.filter(s => {
    if (!search) return true
    return s.name.toLowerCase().includes(search.toLowerCase()) || (s.grade?.name || '').toLowerCase().includes(search.toLowerCase())
  })

  const teacherName = (id: string | null | undefined) => {
    if (!id) return null
    const t = teachers.find(t => t.id === id)
    return t ? `${t.firstName} ${t.lastName}` : null
  }

  const openAssign = (section: any) => {
    setEditItem(section)
    setSelectedTeacherId(section.classTeacherId || '')
    setDialogOpen(true)
  }

  const handleAssign = async () => {
    if (!editItem) return
    setSubmitting(true)
    try {
      await apiPut(`/api/sections/${editItem.id}`, { classTeacherId: selectedTeacherId })
      toast({ title: 'Success', description: selectedTeacherId ? 'Class teacher assigned' : 'Class teacher removed' })
      setDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (sectionId: string) => {
    setSubmitting(true)
    try {
      await apiPut(`/api/sections/${sectionId}`, { classTeacherId: '' })
      toast({ title: 'Success', description: 'Class teacher removed' })
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Class Teacher Assignment</h1>
        <p className="text-gray-500">Assign class teachers to sections</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{sections.length}</p><p className="text-sm text-gray-500">Total Sections</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{sections.filter(s => s.classTeacherId).length}</p><p className="text-sm text-gray-500">With Teacher</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{sections.filter(s => !s.classTeacherId).length}</p><p className="text-sm text-gray-500">Unassigned</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-purple-600">{teachers.filter(t => t.status === 'active').length}</p><p className="text-sm text-gray-500">Active Teachers</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by section or grade..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
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
              <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No sections found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => {
                    const teacher = teacherName(s.classTeacherId)
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell><Badge variant="outline">{s.grade?.name || '-'}</Badge></TableCell>
                        <TableCell className="text-sm">{s.studentCount || 0}</TableCell>
                        <TableCell className="text-sm">{s.capacity}</TableCell>
                        <TableCell>
                          {teacher ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-teal-100 text-teal-700"><UserCheck className="h-3 w-3 mr-1" />{teacher}</Badge>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-gray-500"><UserX className="h-3 w-3 mr-1" />Not assigned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {canManage && (
                            <div className="flex justify-end gap-1">
                              <Button variant="outline" size="sm" onClick={() => openAssign(s)}>
                                {teacher ? 'Reassign' : 'Assign'}
                              </Button>
                              {teacher && (
                                <Button variant="ghost" size="sm" onClick={() => handleRemove(s.id)} className="text-red-600">
                                  Remove
                                </Button>
                              )}
                            </div>
                          )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Class Teacher</DialogTitle>
            <DialogDescription>
              Section: <span className="font-medium">{editItem?.grade?.name} - {editItem?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Teacher</Label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger><SelectValue placeholder="Choose a teacher" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No class teacher</SelectItem>
                  {teachers.filter(t => t.status === 'active').map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.teacherId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">The class teacher is responsible for the overall management and communication for this section.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
              {submitting ? 'Saving...' : 'Save Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
