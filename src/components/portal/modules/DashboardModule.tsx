'use client'

import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/nav-config'
import {
  Users, GraduationCap, DollarSign, BookOpen, TrendingUp, TrendingDown,
  ClipboardCheck, FileText, Award, Calendar, ArrowUpRight, Bell,
  CheckCircle2, Clock, AlertCircle, Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useWebSocket } from '@/lib/use-websocket'

export function DashboardModule() {
  const { user, setPortalModule } = useAppStore()
  const { data, loading } = useApi<any>('/api/dashboard')
  const { connected, onlineCount } = useWebSocket()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const stats = data?.stats || {}
  const role = user?.role as UserRole

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/20 text-white border-0">
              {ROLE_LABELS[role]}
            </Badge>
            {connected && (
              <Badge className="bg-green-500/20 text-green-100 border-0">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                Live · {onlineCount} online
              </Badge>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-teal-100">
            {ROLE_DESCRIPTIONS[role]}
          </p>
          <p className="text-teal-200 text-sm mt-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {getStatCards(role, stats).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-11 w-11 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  {card.trend && (
                    <Badge variant="outline" className={card.trend > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                      {card.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(card.trend)}%
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart/Activity */}
          {(role === 'super_admin' || role === 'admin' || role === 'finance') && stats.monthlyTrend && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-600" />
                  Revenue Overview
                </CardTitle>
                <CardDescription>Last 6 months trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-48">
                  {stats.monthlyTrend.map((item: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-teal-600 to-emerald-500 rounded-t-md transition-all hover:opacity-80"
                          style={{ height: `${(item.amount / Math.max(...stats.monthlyTrend.map((m: any) => m.amount), 1)) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{item.month}</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {item.amount.toLocaleString()} ETB
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activities / Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" />
                {role === 'student' ? 'My Recent Activity' : 'Recent Activities'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.activities?.length > 0 ? (
                data.activities.slice(0, 6).map((activity: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - 1/3 */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getQuickActions(role).map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setPortalModule(action.module)}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          {data?.events && data.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.events.slice(0, 4).map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-teal-50 text-teal-700 flex-shrink-0">
                      <span className="text-xs font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.type}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Attendance/Marks summary for students */}
          {role === 'student' && stats.attendancePercentage !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">My Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Attendance Rate</span>
                  <span className="text-2xl font-bold text-teal-700">
                    {stats.attendancePercentage}%
                  </span>
                </div>
                <Progress value={stats.attendancePercentage} className="h-2" />
                <p className="text-xs text-gray-400 mt-2">
                  {stats.presentDays || 0} present · {stats.absentDays || 0} absent
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function getStatCards(role: UserRole, stats: any) {
  switch (role) {
    case 'super_admin':
      return [
        { label: 'Total Students', value: stats.totalStudents || 0, icon: Users, bgColor: 'bg-teal-50', iconColor: 'text-teal-600', trend: 12 },
        { label: 'Total Teachers', value: stats.totalTeachers || 0, icon: GraduationCap, bgColor: 'bg-orange-50', iconColor: 'text-orange-600', trend: 5 },
        { label: 'Total Revenue', value: `${(stats.totalRevenue || 0).toLocaleString()} ETB`, icon: DollarSign, bgColor: 'bg-green-50', iconColor: 'text-green-600', trend: 8 },
        { label: 'Total Expenses', value: `${(stats.totalExpenses || 0).toLocaleString()} ETB`, icon: TrendingDown, bgColor: 'bg-red-50', iconColor: 'text-red-600' },
        { label: 'Library Books', value: stats.totalBooks || 0, icon: BookOpen, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
        { label: 'Attendance Rate', value: `${stats.attendanceRate || 0}%`, icon: CheckCircle2, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
      ]
    case 'admin':
      return [
        { label: 'Total Students', value: stats.totalStudents || 0, icon: Users, bgColor: 'bg-teal-50', iconColor: 'text-teal-600', trend: 12 },
        { label: 'Total Teachers', value: stats.totalTeachers || 0, icon: GraduationCap, bgColor: 'bg-orange-50', iconColor: 'text-orange-600', trend: 5 },
        { label: 'Total Revenue', value: `${(stats.totalRevenue || 0).toLocaleString()} ETB`, icon: DollarSign, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
        { label: 'Library Books', value: stats.totalBooks || 0, icon: BookOpen, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
      ]
    case 'teacher':
      return [
        { label: 'My Students', value: stats.totalStudents || 0, icon: Users, bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
        { label: 'Assignments', value: stats.totalAssignments || 0, icon: FileText, bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
        { label: 'Submissions', value: stats.totalSubmissions || 0, icon: ClipboardCheck, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'Pending Review', value: stats.pendingReview || 0, icon: Clock, bgColor: 'bg-red-50', iconColor: 'text-red-600' },
      ]
    case 'student':
      return [
        { label: 'Average Score', value: `${stats.averageScore || 0}%`, icon: Award, bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
        { label: 'Class Rank', value: stats.rank ? `#${stats.rank}` : 'N/A', icon: TrendingUp, bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
        { label: 'Assignments Due', value: stats.assignmentsDue || 0, icon: FileText, bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
        { label: 'Books Borrowed', value: stats.booksBorrowed || 0, icon: BookOpen, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
      ]
    case 'finance':
      return [
        { label: 'Total Revenue', value: `${(stats.totalRevenue || 0).toLocaleString()} ETB`, icon: TrendingUp, bgColor: 'bg-green-50', iconColor: 'text-green-600', trend: 8 },
        { label: 'Pending Fees', value: `${(stats.pendingFees || 0).toLocaleString()} ETB`, icon: TrendingDown, bgColor: 'bg-red-50', iconColor: 'text-red-600' },
        { label: 'Transactions', value: stats.totalTransactions || 0, icon: DollarSign, bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
        { label: 'This Month', value: `${(stats.monthlyRevenue || 0).toLocaleString()} ETB`, icon: Activity, bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
      ]
    case 'library':
      return [
        { label: 'Total Books', value: stats.totalBooks || 0, icon: BookOpen, bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
        { label: 'Available', value: stats.availableBooks || 0, icon: CheckCircle2, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
        { label: 'Borrowed', value: stats.borrowedBooks || 0, icon: Users, bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
        { label: 'Overdue', value: stats.overdueLoans || 0, icon: AlertCircle, bgColor: 'bg-red-50', iconColor: 'text-red-600' },
      ]
    default:
      return []
  }
}

function getQuickActions(role: UserRole) {
  const actions: Record<UserRole, { label: string; icon: any; module: string }[]> = {
    super_admin: [
      { label: 'Add Student', icon: Users, module: 'students' },
      { label: 'Manage Marks', icon: ClipboardCheck, module: 'marks' },
      { label: 'Record Payment', icon: DollarSign, module: 'finance' },
      { label: 'Website Settings', icon: GraduationCap, module: 'website-settings' },
    ],
    admin: [
      { label: 'Add Student', icon: Users, module: 'students' },
      { label: 'Manage Marks', icon: ClipboardCheck, module: 'marks' },
      { label: 'Take Attendance', icon: CheckCircle2, module: 'attendance' },
      { label: 'Record Payment', icon: DollarSign, module: 'finance' },
    ],
    teacher: [
      { label: 'Add Marks', icon: ClipboardCheck, module: 'marks' },
      { label: 'Take Attendance', icon: CheckCircle2, module: 'attendance' },
      { label: 'Create Assignment', icon: FileText, module: 'assignments' },
      { label: 'View Students', icon: Users, module: 'students' },
    ],
    student: [
      { label: 'View My Marks', icon: Award, module: 'marks' },
      { label: 'Submit Assignment', icon: FileText, module: 'assignments' },
      { label: 'My Attendance', icon: CheckCircle2, module: 'attendance' },
      { label: 'Browse Library', icon: BookOpen, module: 'library' },
    ],
    finance: [
      { label: 'New Transaction', icon: DollarSign, module: 'finance' },
      { label: 'View Students', icon: Users, module: 'students' },
    ],
    library: [
      { label: 'Add Book', icon: BookOpen, module: 'library' },
      { label: 'Issue Book', icon: Users, module: 'library' },
    ],
  }
  return actions[role] || []
}
