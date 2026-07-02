'use client'

import { useState, useMemo } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Plus, Edit, Trash2, ClipboardList, Award, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const TERMS = ['Term 1', 'Term 2', 'Term 3']
const ASSESSMENT_TYPES = ['exam', 'quiz', 'assignment', 'project']

function computeGrade(score: number, total: number): string {
  const pct = total > 0 ? (score / total) * 100 : 0
  if (pct >= 90) return 'A+'
  if (pct >= 85) return 'A'
  if (pct >= 80) return 'B+'
  if (pct >= 75) return 'B'
  if (pct >= 65) return 'C+'
  if (pct >= 50) return 'C'
  return 'F'
}

function gradeColor(grade?: string | null) {
  if (!grade) return 'bg-gray-100 text-gray-700'
  if (grade.startsWith('A')) return 'bg-green-100 text-green-700'
  if (grade.startsWith('B')) return 'bg-teal-100 text-teal-700'
  if (grade.startsWith('C')) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

const emptyMark = {
  studentId: '', subjectId: '', term: 'Term 1', assessmentType: 'exam',
  score: 0, totalScore: 100, remarks: '',
}

export function MarksModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()
  const [termFilter, setTermFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMark, setEditMark] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(emptyMark)
  const [submitting, setSubmitting] = useState(false)

  const isStudent = role === 'student'

  // Build query string - student API auto-filters
  const queryParts: string[] = []
  if (termFilter !== 'all') queryParts.push(`term=${encodeURIComponent(termFilter)}`)
  if (subjectFilter !== 'all') queryParts.push(`subjectId=${encodeURIComponent(subjectFilter)}`)
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''

  const { data: marksData, loading, refetch } = useApi<{ marks: any[] }>(`/api/marks${query}`)
  const { data: subjectsData } = useApi<{ subjects: any[] }>('/api/subjects')
  const { data: studentsData } = useApi<{ students: any[] }>('/api/students')

  const subjects = subjectsData?.subjects || []
  const students = studentsData?.students || []
  const allMarks = marksData?.marks || []

  // For students, also fetch their own student profile to know their studentId
  const { data: profileData } = useApi<{ profile: any }>('/api/profile')

  const canCreate = hasPermission(role, 'mark.create')
  const canEdit = hasPermission(role, 'mark.edit')
  const canDelete = hasPermission(role, 'mark.delete')

  // For students: compute average + bar chart data
  const studentStats = useMemo(() => {
    if (!isStudent) return null
    if (allMarks.length === 0) return { average: 0, total: 0, max: 0, bySubject: [] as any[] }
    const total = allMarks.reduce((sum, m) => sum + m.score, 0)
    const max = allMarks.reduce((sum, m) => sum + m.totalScore, 0)
    const average = max > 0 ? (total / max) * 100 : 0
    const subjectMap = new Map<string, { subject: string; score: number; total: number }>()
    allMarks.forEach((m) => {
      const key = m.subjectId
      const existing = subjectMap.get(key)
      if (existing) {
        existing.score += m.score
        existing.total += m.totalScore
      } else {
        subjectMap.set(key, {
          subject: m.subject?.name || 'Unknown',
          score: m.score,
          total: m.totalScore,
        })
      }
    })
    return {
      average,
      total,
      max,
      bySubject: Array.from(subjectMap.values()),
    }
  }, [allMarks, isStudent])

  const openCreate = () => {
    setForm(emptyMark)
    setEditMark(null)
    setDialogOpen(true)
  }

  const openEdit = (mark: any) => {
    setForm({
      studentId: mark.studentId,
      subjectId: mark.subjectId,
      term: mark.term || 'Term 1',
      assessmentType: mark.assessmentType || 'exam',
      score: mark.score,
      totalScore: mark.totalScore,
      remarks: mark.remarks || '',
    })
    setEditMark(mark)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.studentId || !form.subjectId) {
      toast({ title: 'Error', description: 'Student and subject are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form, score: Number(form.score), totalScore: Number(form.totalScore) }
      if (editMark) {
        await apiPut(`/api/marks/${editMark.id}`, payload)
        toast({ title: 'Success', description: 'Mark updated successfully' })
      } else {
        await apiPost('/api/marks', payload)
        toast({ title: 'Success', description: 'Mark created successfully' })
      }
      broadcastDataUpdate('mark', editMark ? 'update' : 'create')
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
      await apiDelete(`/api/marks/${deleteId}`)
      broadcastDataUpdate('mark', 'delete')
      toast({ title: 'Success', description: 'Mark deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  // ============ STUDENT VIEW ============
  if (isStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Marks</h1>
          <p className="text-gray-500">View your academic performance across terms</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-5 w-5 text-teal-600" />
                  <span className="text-xs text-gray-500">Overall Average</span>
                </div>
                <p className="text-3xl font-bold text-teal-700">
                  {studentStats ? studentStats.average.toFixed(1) : '0'}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <ClipboardList className="h-5 w-5 text-orange-600" />
                  <span className="text-xs text-gray-500">Total Marks</span>
                </div>
                <p className="text-3xl font-bold text-orange-600">{allMarks.length}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-gray-500">Subjects</span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {studentStats?.bySubject.length || 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {TERMS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart by Subject */}
        {studentStats && studentStats.bySubject.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Performance by Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentStats.bySubject.map((s, i) => {
                  const pct = s.total > 0 ? (s.score / s.total) * 100 : 0
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{s.subject}</span>
                        <span className="text-gray-500">
                          {s.score}/{s.total} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Marks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Marks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : allMarks.length === 0 ? (
              <div className="p-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No marks recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allMarks.map((mark) => (
                      <TableRow key={mark.id}>
                        <TableCell className="font-medium">{mark.subject?.name || 'N/A'}</TableCell>
                        <TableCell><Badge variant="outline">{mark.term}</Badge></TableCell>
                        <TableCell className="capitalize">{mark.assessmentType}</TableCell>
                        <TableCell>
                          <span className="font-medium">{mark.score}</span>
                          <span className="text-gray-400">/{mark.totalScore}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={gradeColor(mark.grade)}>{mark.grade || computeGrade(mark.score, mark.totalScore)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============ TEACHER/ADMIN VIEW ============
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marks Management</h1>
          <p className="text-gray-500">Record and manage student marks</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Mark
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {TERMS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : allMarks.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No marks recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allMarks.map((mark) => (
                    <TableRow key={mark.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {mark.student?.firstName} {mark.student?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{mark.student?.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{mark.subject?.name || 'N/A'}</TableCell>
                      <TableCell><Badge variant="outline">{mark.term}</Badge></TableCell>
                      <TableCell className="capitalize">{mark.assessmentType}</TableCell>
                      <TableCell>
                        <span className="font-medium">{mark.score}</span>
                        <span className="text-gray-400">/{mark.totalScore}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={gradeColor(mark.grade)}>{mark.grade || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(mark)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(mark.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editMark ? 'Edit Mark' : 'Add New Mark'}</DialogTitle>
            <DialogDescription>
              {editMark ? 'Update mark information' : 'Record a new student mark'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })} required>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.studentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })} required>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={form.term} onValueChange={(v) => setForm({ ...form, term: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TERMS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assessment Type</Label>
                <Select value={form.assessmentType} onValueChange={(v) => setForm({ ...form, assessmentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSESSMENT_TYPES.map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Score *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  required
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Score *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.totalScore}
                  onChange={(e) => setForm({ ...form, totalScore: e.target.value })}
                  required
                  min={1}
                />
              </div>
            </div>

            {/* Live grade preview */}
            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
              <span className="text-sm text-gray-600">Computed Grade:</span>
              <Badge className={gradeColor(computeGrade(Number(form.score) || 0, Number(form.totalScore) || 1))}>
                {computeGrade(Number(form.score) || 0, Number(form.totalScore) || 1)}
              </Badge>
              <span className="text-xs text-gray-500 ml-auto">
                Percentage: {Number(form.totalScore) > 0 ? ((Number(form.score) / Number(form.totalScore)) * 100).toFixed(1) : 0}%
              </span>
            </div>

            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
                {submitting ? 'Saving...' : editMark ? 'Update' : 'Create'} Mark
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mark?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this mark record. This action cannot be undone.
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
