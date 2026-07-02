'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import { FileText, Printer, Award, TrendingUp, CalendarCheck, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'

const TERMS = ['Term 1', 'Term 2', 'Term 3']

function gradeColor(grade?: string | null) {
  if (!grade) return 'bg-gray-100 text-gray-700'
  if (grade.startsWith('A')) return 'bg-green-100 text-green-700'
  if (grade.startsWith('B')) return 'bg-teal-100 text-teal-700'
  if (grade.startsWith('C')) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

export function ReportsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const isStudent = role === 'student'

  const currentYear = String(new Date().getFullYear())
  const [term, setTerm] = useState('Term 1')
  const [academicYear, setAcademicYear] = useState(currentYear)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [remarks, setRemarks] = useState('')

  const canView = hasPermission(role, 'report.view')

  const { data: studentsData } = useApi<{ students: any[] }>('/api/students')
  const students = studentsData?.students || []

  // For students, get their own profile
  const { data: profileData } = useApi<{ profile: any }>('/api/profile')
  const myStudentId = profileData?.profile?.id

  const effectiveStudentId = isStudent ? myStudentId : selectedStudentId

  const reportQuery = effectiveStudentId
    ? `?studentId=${effectiveStudentId}&term=${encodeURIComponent(term)}&academicYear=${encodeURIComponent(academicYear)}`
    : null
  const { data: reportData, loading } = useApi<{ report: any }>(reportQuery)
  const report = reportData?.report

  const handlePrint = () => {
    window.print()
  }

  const overallAveragePct = report && report.summary.subjectCount > 0
    ? (report.summary.totalScore / (report.summary.maxTotal || 1)) * 100
    : 0

  // ============ STUDENT VIEW (auto-loads their report) ============
  if (isStudent) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Report Card</h1>
            <p className="text-gray-500">View your academic report</p>
          </div>
          <div className="flex gap-2">
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TERMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handlePrint} variant="outline" className="bg-teal-700 hover:bg-teal-800 text-white">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : !report ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No report data available for this term</p>
            </CardContent>
          </Card>
        ) : (
          <ReportCardView report={report} overallAveragePct={overallAveragePct} />
        )}
      </div>
    )
  }

  // ============ TEACHER/ADMIN VIEW ============
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
          <p className="text-gray-500">Generate and view student report cards</p>
        </div>
      </div>

      {/* Selectors */}
      <Card className="no-print">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Student</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
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
              <Label className="text-xs">Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TERMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[currentYear, String(Number(currentYear) - 1)].map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handlePrint}
                disabled={!report}
                className="w-full bg-teal-700 hover:bg-teal-800"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedStudentId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Select a student to generate their report card</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Skeleton className="h-96 w-full" />
      ) : !report ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No report data available</p>
          </CardContent>
        </Card>
      ) : (
        <ReportCardView report={report} overallAveragePct={overallAveragePct} />
      )}
    </div>
  )
}

function ReportCardView({ report, overallAveragePct }: { report: any; overallAveragePct: number }) {
  const s = report.student
  const total = report.summary.totalScore.toFixed(0)
  const avg = report.summary.average.toFixed(1)
  const rank = report.rank
  const att = report.attendanceSummary

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="print:shadow-none print:border-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 p-6 text-white rounded-t-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Bright Future Academy</h2>
                <p className="text-teal-100 text-sm">Student Report Card</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-teal-100">Term: <span className="font-semibold text-white">{report.term}</span></p>
              <p className="text-teal-100">Year: <span className="font-semibold text-white">{report.academicYear}</span></p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Student Info */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-teal-100 text-teal-700 text-xl">
                {s?.firstName?.[0]}{s?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium text-sm">{s?.firstName} {s?.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Student ID</p>
                <p className="font-medium text-sm font-mono">{s?.studentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Grade</p>
                <p className="font-medium text-sm">{s?.grade?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Section</p>
                <p className="font-medium text-sm">{s?.section?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Marks Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-600" />
              Academic Performance
            </h3>
            {report.marks.length === 0 ? (
              <p className="text-center text-gray-500 py-6 text-sm">No marks recorded for this term</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.marks.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.subject?.name}</TableCell>
                        <TableCell className="capitalize text-sm">{m.assessmentType}</TableCell>
                        <TableCell>
                          <span className="font-medium">{m.score}</span>
                          <span className="text-gray-400">/{m.totalScore}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={gradeColor(m.grade)}>{m.grade || '-'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-teal-50 p-4 rounded-lg text-center">
              <TrendingUp className="h-5 w-5 text-teal-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Total Score</p>
              <p className="text-xl font-bold text-teal-700">{total}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg text-center">
              <Award className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-xl font-bold text-emerald-700">{avg}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-center">
              <Award className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Class Rank</p>
              <p className="text-xl font-bold text-amber-700">
                {rank ? `#${rank}` : 'N/A'}
                <span className="text-xs text-gray-500 font-normal"> /{report.classSize || 0}</span>
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <CalendarCheck className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Attendance</p>
              <p className="text-xl font-bold text-orange-700">
                {att.total > 0 ? Math.round((att.present / att.total) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Attendance Summary</p>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <p className="text-green-600 font-bold">{att.present}</p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <div>
                <p className="text-red-600 font-bold">{att.absent}</p>
                <p className="text-xs text-gray-500">Absent</p>
              </div>
              <div>
                <p className="text-amber-600 font-bold">{att.late}</p>
                <p className="text-xs text-gray-500">Late</p>
              </div>
              <div>
                <p className="text-blue-600 font-bold">{att.excused}</p>
                <p className="text-xs text-gray-500">Excused</p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <p className="text-sm font-semibold mb-2">Teacher's Remarks</p>
            <Textarea
              className="min-h-20 bg-gray-50"
              placeholder="No remarks recorded for this term."
              value={report.student?.remarks || ''}
              readOnly
            />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t">
            <div className="text-center">
              <div className="border-t border-gray-400 mt-8 pt-1">
                <p className="text-xs text-gray-500">Class Teacher</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 mt-8 pt-1">
                <p className="text-xs text-gray-500">Principal</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
