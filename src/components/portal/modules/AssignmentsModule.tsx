'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Plus, Edit, Trash2, FileText, Clock, CheckCircle2, AlertCircle, Eye, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

const emptyAssignment = {
  title: '', description: '', subjectId: '', dueDate: '', maxScore: 100, status: 'active',
}

export function AssignmentsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()
  const isStudent = role === 'student'

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editAssignment, setEditAssignment] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewAssignment, setViewAssignment] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyAssignment)
  const [submitting, setSubmitting] = useState(false)

  // Submission state (student)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submitContent, setSubmitContent] = useState('')
  const [submittingWork, setSubmittingWork] = useState(false)

  // Grading state (teacher)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [gradeTarget, setGradeTarget] = useState<any>(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [gradeStatus, setGradeStatus] = useState('graded')
  const [grading, setGrading] = useState(false)

  const canCreate = hasPermission(role, 'assignment.create')
  const canEdit = hasPermission(role, 'assignment.edit')
  const canDelete = hasPermission(role, 'assignment.delete')
  const canSubmit = hasPermission(role, 'assignment.submit')
  const canGrade = hasPermission(role, 'assignment.edit')

  const { data, loading, refetch } = useApi<{ assignments: any[] }>('/api/assignments')
  const { data: subjectsData } = useApi<{ subjects: any[] }>('/api/subjects')

  const subjects = subjectsData?.subjects || []
  const assignments = data?.assignments || []

  // For each assignment's submissions (teacher view), we already have them in the assignment object via API include

  const openCreate = () => {
    setForm(emptyAssignment)
    setEditAssignment(null)
    setDialogOpen(true)
  }

  const openEdit = (a: any) => {
    setForm({
      title: a.title || '',
      description: a.description || '',
      subjectId: a.subjectId || '',
      dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '',
      maxScore: a.maxScore || 100,
      status: a.status || 'active',
    })
    setEditAssignment(a)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.subjectId || !form.dueDate) {
      toast({ title: 'Error', description: 'Title, subject, and due date are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form, maxScore: Number(form.maxScore) }
      if (editAssignment) {
        await apiPut(`/api/assignments/${editAssignment.id}`, payload)
        toast({ title: 'Success', description: 'Assignment updated' })
      } else {
        await apiPost('/api/assignments', payload)
        toast({ title: 'Success', description: 'Assignment created' })
      }
      broadcastDataUpdate('assignment', editAssignment ? 'update' : 'create')
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
      await apiDelete(`/api/assignments/${deleteId}`)
      broadcastDataUpdate('assignment', 'delete')
      toast({ title: 'Success', description: 'Assignment deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const openSubmit = (a: any) => {
    setViewAssignment(a)
    setSubmitContent('')
    setSubmitDialogOpen(true)
  }

  const handleSubmitWork = async () => {
    if (!viewAssignment) return
    if (!submitContent.trim()) {
      toast({ title: 'Error', description: 'Please enter your submission content', variant: 'destructive' })
      return
    }
    setSubmittingWork(true)
    try {
      await apiPost('/api/submissions', {
        assignmentId: viewAssignment.id,
        content: submitContent,
      })
      broadcastDataUpdate('submission', 'create')
      toast({ title: 'Success', description: 'Assignment submitted!' })
      setSubmitDialogOpen(false)
      setSubmitContent('')
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmittingWork(false)
    }
  }

  const openGrade = (submission: any) => {
    setGradeTarget(submission)
    setGradeScore(submission.score ? String(submission.score) : '')
    setGradeFeedback(submission.feedback || '')
    setGradeStatus(submission.status === 'graded' ? 'graded' : 'graded')
    setGradeDialogOpen(true)
  }

  const handleGrade = async () => {
    if (!gradeTarget) return
    setGrading(true)
    try {
      await apiPut(`/api/submissions/${gradeTarget.id}`, {
        score: Number(gradeScore),
        feedback: gradeFeedback,
        status: gradeStatus,
      })
      broadcastDataUpdate('submission', 'update')
      toast({ title: 'Success', description: 'Submission graded' })
      setGradeDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setGrading(false)
    }
  }

  const isOverdue = (a: any) => new Date(a.dueDate) < new Date()
  const mySubmissionFor = (a: any) => a.submissions?.find((s: any) => s.studentId === user?.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStudent ? 'My Assignments' : 'Assignments'}
          </h1>
          <p className="text-gray-500">
            {isStudent ? 'View and submit your assignments' : 'Create and manage assignments'}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        )}
      </div>

      {/* Assignments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No assignments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a, i) => {
            const overdue = isOverdue(a) && a.status === 'active'
            const mySub = isStudent ? mySubmissionFor(a) : null
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">{a.subject?.name || 'General'}</Badge>
                        {a.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">Closed</Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{a.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 flex-1">{a.description || 'No description'}</p>

                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-gray-500">Max: {a.maxScore}</span>
                      </div>
                      {overdue && (
                        <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                      {isStudent && mySub && (
                        <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Submitted{mySub.score !== null && mySub.score !== undefined ? ` · ${mySub.score}/${a.maxScore}` : ''}
                        </Badge>
                      )}
                      {!isStudent && a.submissions && (
                        <p className="text-xs text-gray-500">
                          {a.submissions.length} submission{a.submissions.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {isStudent ? (
                        <Button
                          size="sm"
                          className="flex-1 bg-teal-700 hover:bg-teal-800"
                          onClick={() => openSubmit(a)}
                          disabled={!!mySub || overdue}
                        >
                          {mySub ? 'Submitted' : 'Submit'}
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewAssignment(a)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {canEdit && (
                            <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => setDeleteId(a.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Teacher: Submissions table for selected assignment */}
      {viewAssignment && !isStudent && (
        <Dialog open={!!viewAssignment} onOpenChange={(open) => !open && setViewAssignment(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewAssignment.title}</DialogTitle>
              <DialogDescription>
                {viewAssignment.subject?.name} · Due {new Date(viewAssignment.dueDate).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{viewAssignment.description || 'No description'}</p>
              <div className="border-t pt-3">
                <p className="font-medium text-sm mb-2">Submissions ({viewAssignment.submissions?.length || 0})</p>
                {viewAssignment.submissions?.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm">No submissions yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {viewAssignment.submissions?.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                              {sub.student?.firstName[0]}{sub.student?.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{sub.student?.firstName} {sub.student?.lastName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(sub.submittedAt).toLocaleDateString()} ·
                              {sub.score !== null && sub.score !== undefined ? ` Score: ${sub.score}` : ' Not graded'}
                            </p>
                          </div>
                        </div>
                        {canGrade && (
                          <Button size="sm" variant="outline" onClick={() => openGrade(sub)}>
                            {sub.score !== null && sub.score !== undefined ? 'Re-grade' : 'Grade'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editAssignment ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
            <DialogDescription>
              {editAssignment ? 'Update assignment details' : 'Create a new assignment for students'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Score</Label>
                <Input
                  type="number"
                  value={form.maxScore}
                  onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
                {submitting ? 'Saving...' : editAssignment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Assignment Dialog (student) */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {viewAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Submission *</Label>
              <Textarea
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                rows={6}
                placeholder="Enter your answer or submission content..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
              <Button
                type="button"
                onClick={handleSubmitWork}
                disabled={submittingWork}
                className="bg-teal-700 hover:bg-teal-800"
              >
                {submittingWork ? 'Submitting...' : 'Submit Work'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog (teacher) */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              {gradeTarget?.student?.firstName} {gradeTarget?.student?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-1">Submission:</p>
              <p className="text-sm">{gradeTarget?.content}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Score</Label>
                <Input
                  type="number"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  min={0}
                  max={viewAssignment?.maxScore || 100}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={gradeStatus} onValueChange={setGradeStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="submitted">Revert to Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                rows={3}
                placeholder="Provide feedback to the student..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleGrade} disabled={grading} className="bg-teal-700 hover:bg-teal-800">
                {grading ? 'Saving...' : 'Save Grade'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assignment and all related submissions.
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
