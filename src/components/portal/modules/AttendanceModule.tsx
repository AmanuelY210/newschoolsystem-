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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Trash2, Calendar, CheckCircle2, XCircle, Clock, Save, CalendarCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused']

function statusBadge(status: string) {
  switch (status) {
    case 'present':
      return <Badge className="bg-green-100 text-green-700">Present</Badge>
    case 'absent':
      return <Badge className="bg-red-100 text-red-700">Absent</Badge>
    case 'late':
      return <Badge className="bg-amber-100 text-amber-700">Late</Badge>
    case 'excused':
      return <Badge className="bg-blue-100 text-blue-700">Excused</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function AttendanceModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()
  const isStudent = role === 'student'

  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // For teacher/admin attendance taking
  const [selectedGrade, setSelectedGrade] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [marking, setMarking] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const canCreate = hasPermission(role, 'attendance.create')
  const canEdit = hasPermission(role, 'attendance.edit')
  const canDelete = hasPermission(role, 'attendance.delete')

  // Build query
  const queryParts: string[] = []
  if (dateFilter) queryParts.push(`date=${encodeURIComponent(dateFilter)}`)
  if (statusFilter !== 'all') queryParts.push(`status=${encodeURIComponent(statusFilter)}`)
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''

  const { data, loading, refetch } = useApi<{ attendance: any[] }>(`/api/attendance${query}`)
  const { data: gradesData } = useApi<{ grades: any[] }>('/api/grades')
  const { data: studentsData } = useApi<{ students: any[] }>(
    selectedGrade ? `/api/students?gradeId=${selectedGrade}` : '/api/students'
  )

  const grades = gradesData?.grades || []
  const allStudents = studentsData?.students || []
  const allAttendance = data?.attendance || []

  // Student stats
  const studentStats = useMemo(() => {
    if (!isStudent) return null
    const total = allAttendance.length
    const present = allAttendance.filter((a) => a.status === 'present').length
    const absent = allAttendance.filter((a) => a.status === 'absent').length
    const late = allAttendance.filter((a) => a.status === 'late').length
    const excused = allAttendance.filter((a) => a.status === 'excused').length
    const percentage = total > 0 ? (present / total) * 100 : 0
    return { total, present, absent, late, excused, percentage }
  }, [allAttendance, isStudent])

  const handleMark = (studentId: string, status: string) => {
    setMarking({ ...marking, [studentId]: status })
  }

  const handleSaveAttendance = async () => {
    const entries = Object.entries(marking)
    if (entries.length === 0) {
      toast({ title: 'Warning', description: 'Please mark at least one student', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      // Send each entry as a separate create request
      await Promise.all(
        entries.map(([studentId, status]) =>
          apiPost('/api/attendance', {
            studentId,
            date: attendanceDate,
            status,
          })
        )
      )
      broadcastDataUpdate('attendance', 'create')
      toast({ title: 'Success', description: `Saved attendance for ${entries.length} students` })
      setMarking({})
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await apiDelete(`/api/attendance/${deleteId}`)
      broadcastDataUpdate('attendance', 'delete')
      toast({ title: 'Success', description: 'Attendance record deleted' })
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
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-500">Track your attendance records</p>
        </div>

        {/* Stats */}
        {studentStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-xs text-gray-500">Present</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{studentStats.present}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-xs text-gray-500">Absent</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{studentStats.absent}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-xs text-gray-500">Late</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{studentStats.late}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <CalendarCheck className="h-5 w-5 text-teal-600" />
                    <span className="text-xs text-gray-500">Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-teal-700">{studentStats.percentage.toFixed(0)}%</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Attendance Rate Progress */}
        {studentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overall Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{studentStats.present} of {studentStats.total} days present</span>
                <span className="text-2xl font-bold text-teal-700">{studentStats.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={studentStats.percentage} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-48"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : allAttendance.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAttendance.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell>{statusBadge(a.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">{a.remarks || '-'}</TableCell>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-500">Mark and track student attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{allAttendance.filter(a => a.status === 'present').length}</p>
            <p className="text-sm text-gray-500">Present Today/Selected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{allAttendance.filter(a => a.status === 'absent').length}</p>
            <p className="text-sm text-gray-500">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">{allAttendance.filter(a => a.status === 'late').length}</p>
            <p className="text-sm text-gray-500">Late</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-teal-700">{allAttendance.length}</p>
            <p className="text-sm text-gray-500">Total Records</p>
          </CardContent>
        </Card>
      </div>

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-teal-600" />
              Mark Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger><SelectValue placeholder="Choose grade" /></SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
              </div>
            </div>

            {selectedGrade && (
              <div className="border-t pt-4">
                {allStudents.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No students in this grade</p>
                ) : (
                  <>
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {allStudents.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-medium">
                              {s.firstName[0]}{s.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                              <p className="text-xs text-gray-500 font-mono">{s.studentId}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {STATUS_OPTIONS.map((st) => (
                              <Button
                                key={st}
                                type="button"
                                size="sm"
                                variant={marking[s.id] === st ? 'default' : 'outline'}
                                onClick={() => handleMark(s.id, st)}
                                className={
                                  marking[s.id] === st
                                    ? st === 'present' ? 'bg-green-600 hover:bg-green-700'
                                      : st === 'absent' ? 'bg-red-600 hover:bg-red-700'
                                      : st === 'late' ? 'bg-amber-600 hover:bg-amber-700'
                                      : 'bg-blue-600 hover:bg-blue-700'
                                    : ''
                                }
                              >
                                {st[0].toUpperCase()}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <p className="text-sm text-gray-500">
                        {Object.keys(marking).length} of {allStudents.length} marked
                      </p>
                      <Button
                        onClick={handleSaveAttendance}
                        disabled={saving || Object.keys(marking).length === 0}
                        className="bg-teal-700 hover:bg-teal-800"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Attendance'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-48"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : allAttendance.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    {canDelete && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAttendance.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{a.student?.firstName} {a.student?.lastName}</p>
                          <p className="text-xs text-gray-500 font-mono">{a.student?.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{a.remarks || '-'}</TableCell>
                      {canDelete && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(a.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this attendance record.</AlertDialogDescription>
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
