'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Trophy, Medal, Award, Save, Crown, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const TERMS = ['Term 1', 'Term 2', 'Term 3']

function medalColor(rank: number) {
  if (rank === 1) return 'from-yellow-400 to-amber-500'
  if (rank === 2) return 'from-gray-300 to-gray-400'
  if (rank === 3) return 'from-orange-400 to-orange-600'
  return 'from-teal-400 to-emerald-500'
}

function medalIcon(rank: number) {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-200" />
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-100" />
  if (rank === 3) return <Award className="h-6 w-6 text-orange-100" />
  return <Trophy className="h-6 w-6 text-teal-100" />
}

export function RanksModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()
  const isStudent = role === 'student'

  const currentYear = String(new Date().getFullYear())
  const [term, setTerm] = useState('Term 1')
  const [academicYear, setAcademicYear] = useState(currentYear)
  const [gradeId, setGradeId] = useState('all')
  const [saving, setSaving] = useState(false)

  const canSave = hasPermission(role, 'rank.create')

  const { data: gradesData } = useApi<{ grades: any[] }>('/api/grades')
  const grades = gradesData?.grades || []

  const queryParts = [
    `term=${encodeURIComponent(term)}`,
    `academicYear=${encodeURIComponent(academicYear)}`,
  ]
  if (gradeId !== 'all') queryParts.push(`gradeId=${encodeURIComponent(gradeId)}`)
  const query = `?${queryParts.join('&')}`

  const { data, loading, refetch } = useApi<{ ranks: any[]; computed: boolean }>(`/api/ranks${query}`)
  const allRanks = data?.ranks || []
  const isComputed = data?.computed

  // For students: find their own rank
  const { data: profileData } = useApi<{ profile: any }>('/api/profile')
  const myStudentId = profileData?.profile?.id
  const myRank = isStudent ? allRanks.find((r) => r.studentId === myStudentId) : null

  const handleSaveRanks = async () => {
    if (!canSave || allRanks.length === 0) return
    setSaving(true)
    try {
      await Promise.all(
        allRanks.map((r) =>
          apiPost('/api/ranks', {
            studentId: r.studentId,
            term,
            academicYear,
            rank: r.rank,
            totalScore: r.totalScore,
            average: r.average,
          })
        )
      )
      broadcastDataUpdate('rank', 'create')
      toast({ title: 'Success', description: `${allRanks.length} ranks saved successfully` })
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ============ STUDENT VIEW ============
  if (isStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Class Rank</h1>
          <p className="text-gray-500">Your academic standing in your class</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <Label className="text-xs">Year</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[currentYear, String(Number(currentYear) - 1)].map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Rank Display */}
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : myRank ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden">
              <div className={`bg-gradient-to-br ${medalColor(myRank.rank)} p-6 text-center`}>
                {medalIcon(myRank.rank)}
                <p className="text-white/80 text-sm mt-2">Your Rank</p>
                <p className="text-5xl font-bold text-white mt-1">#{myRank.rank}</p>
                <p className="text-white/90 text-sm mt-2">
                  out of {allRanks.length} students
                </p>
              </div>
              <CardContent className="p-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Score</p>
                  <p className="text-2xl font-bold text-teal-700">{myRank.totalScore.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="text-2xl font-bold text-teal-700">{myRank.average.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No ranking data available for this term</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ============ TEACHER/ADMIN VIEW ============
  const top3 = allRanks.slice(0, 3)
  const rest = allRanks.slice(3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Rankings</h1>
          <p className="text-gray-500">View and save student rankings by term</p>
        </div>
        {canSave && allRanks.length > 0 && (
          <Button
            onClick={handleSaveRanks}
            disabled={saving}
            className="bg-teal-700 hover:bg-teal-800"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Ranks'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div className="space-y-2">
              <Label className="text-xs">Grade</Label>
              <Select value={gradeId} onValueChange={setGradeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {isComputed !== undefined && (
            <p className="text-xs text-gray-500 mt-3">
              {isComputed
                ? '⚠️ These ranks are computed live from marks and not yet saved. Click "Save Ranks" to persist.'
                : '✓ These ranks are saved in the database.'}
            </p>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : allRanks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No ranking data available</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Podium for top 3 */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Reorder: 2nd, 1st, 3rd for podium effect on desktop */}
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((r, idx) => {
                const isFirst = r.rank === 1
                return (
                  <motion.div
                    key={r.studentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={isFirst ? 'sm:-mt-6' : ''}
                  >
                    <Card className={`overflow-hidden ${isFirst ? 'ring-2 ring-yellow-400' : ''}`}>
                      <div className={`bg-gradient-to-br ${medalColor(r.rank)} p-6 text-center`}>
                        <div className="flex justify-center mb-2">{medalIcon(r.rank)}</div>
                        <p className="text-white/80 text-xs">Rank</p>
                        <p className="text-4xl font-bold text-white">#{r.rank}</p>
                      </div>
                      <CardContent className="p-4 text-center">
                        <p className="font-semibold text-gray-900">
                          {r.student?.firstName} {r.student?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{r.student?.grade?.name || 'N/A'}</p>
                        <div className="mt-2 pt-2 border-t flex justify-between text-xs">
                          <span className="text-gray-500">Total: <strong className="text-teal-700">{r.totalScore.toFixed(0)}</strong></span>
                          <span className="text-gray-500">Avg: <strong className="text-teal-700">{r.average.toFixed(1)}</strong></span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Full ranking table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-teal-600" />
                Full Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Total Score</TableHead>
                      <TableHead>Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRanks.map((r) => (
                      <TableRow key={r.studentId}>
                        <TableCell>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            r.rank <= 3
                              ? `bg-gradient-to-br ${medalColor(r.rank)} text-white`
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {r.rank}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{r.student?.firstName} {r.student?.lastName}</p>
                            <p className="text-xs text-gray-500 font-mono">{r.student?.studentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.student?.grade?.name || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-teal-700">{r.totalScore.toFixed(0)}</TableCell>
                        <TableCell className="font-medium">{r.average.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
