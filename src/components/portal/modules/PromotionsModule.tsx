'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, History } from 'lucide-react'
import { motion } from 'framer-motion'

const emptyPromotion = {
  studentId: '', fromGrade: '', toGrade: '', academicYear: String(new Date().getFullYear()),
  promoted: true, remarks: '',
}

export function PromotionsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()
  const isStudent = role === 'student'

  const [yearFilter, setYearFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<any>(emptyPromotion)
  const [submitting, setSubmitting] = useState(false)

  const canCreate = hasPermission(role, 'promotion.create')

  // For students, filter by their own studentId via the API
  const { data: profileData } = useApi<{ profile: any }>('/api/profile')
  const myStudentId = profileData?.profile?.id

  const queryParts: string[] = []
  if (isStudent && myStudentId) queryParts.push(`studentId=${myStudentId}`)
  if (yearFilter !== 'all') queryParts.push(`academicYear=${encodeURIComponent(yearFilter)}`)
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''

  const { data, loading, refetch } = useApi<{ promotions: any[] }>(`/api/promotions${query}`)
  const { data: studentsData } = useApi<{ students: any[] }>(isStudent ? null : '/api/students')
  const { data: gradesData } = useApi<{ grades: any[] }>(isStudent ? null : '/api/grades')

  const students = studentsData?.students || []
  const grades = gradesData?.grades || []
  const promotions = data?.promotions || []

  const openCreate = () => {
    setForm(emptyPromotion)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.studentId || !form.fromGrade || !form.toGrade) {
      toast({ title: 'Error', description: 'Student, from grade, and to grade are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      await apiPost('/api/promotions', form)
      broadcastDataUpdate('promotion', 'create')
      toast({ title: 'Success', description: 'Promotion recorded successfully' })
      setDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const currentYear = String(new Date().getFullYear())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStudent ? 'My Promotion History' : 'Student Promotions'}
          </h1>
          <p className="text-gray-500">
            {isStudent ? 'View your grade promotion records' : 'Promote students to higher grades'}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            New Promotion
          </Button>
        )}
      </div>

      {/* Stats */}
      {!isStudent && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <p className="text-2xl font-bold text-teal-700">{promotions.length}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-gray-500">Promoted</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {promotions.filter((p) => p.promoted).length}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                  <span className="text-xs text-gray-500">Retained</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {promotions.filter((p) => !p.promoted).length}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {[currentYear, String(Number(currentYear) - 1), String(Number(currentYear) - 2)].map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-teal-600" />
            Promotion History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : promotions.length === 0 ? (
            <div className="p-12 text-center">
              <History className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No promotion records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.student?.firstName} {p.student?.lastName}</p>
                          <p className="text-xs text-gray-500 font-mono">{p.student?.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{p.fromGrade}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3 text-teal-600" />
                          <Badge className="bg-teal-100 text-teal-700">{p.toGrade}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.academicYear}</TableCell>
                      <TableCell>
                        {p.promoted ? (
                          <Badge className="bg-green-100 text-green-700">Promoted</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Retained</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-xs truncate">{p.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Student Promotion</DialogTitle>
            <DialogDescription>Promote or retain a student for the academic year</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Grade *</Label>
                <Select value={form.fromGrade} onValueChange={(v) => setForm({ ...form, fromGrade: v })}>
                  <SelectTrigger><SelectValue placeholder="From grade" /></SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Grade *</Label>
                <Select value={form.toGrade} onValueChange={(v) => setForm({ ...form, toGrade: v })}>
                  <SelectTrigger><SelectValue placeholder="To grade" /></SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.promoted ? 'true' : 'false'}
                  onValueChange={(v) => setForm({ ...form, promoted: v === 'true' })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Promoted</SelectItem>
                    <SelectItem value="false">Retained</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
                {submitting ? 'Saving...' : 'Record Promotion'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
