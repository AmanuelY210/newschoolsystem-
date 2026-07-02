'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import {
  Eye, Trash2, CheckCircle2, XCircle, FileText, UserCheck, Clock, ClipboardList,
  Search, GraduationCap, CreditCard, Phone, Mail, MapPin, Calendar, User,
  IdCard, Award, Building2, Upload, Copy, Check
} from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  { value: 'under_review', label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-teal-100 text-teal-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'enrolled', label: 'Enrolled', color: 'bg-green-100 text-green-700' },
]

export function RegistrationsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewApp, setViewApp] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'enroll' | null>(null)
  const [remarks, setRemarks] = useState('')
  const [processing, setProcessing] = useState(false)

  // Payment setup state
  const [paymentSetup, setPaymentSetup] = useState(false)
  const [payCode, setPayCode] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('telebirr')

  // Enrollment result
  const [enrollResult, setEnrollResult] = useState<any>(null)

  const queryParts = []
  if (statusFilter !== 'all') queryParts.push(`status=${encodeURIComponent(statusFilter)}`)
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`)
  const query = queryParts.length ? `?${queryParts.join('&')}` : ''

  const { data, loading, refetch } = useApi<{ applications: any[] }>(`/api/registrations${query}`)
  const applications = data?.applications || []

  // Stats
  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    enrolled: applications.filter(a => a.status === 'enrolled').length,
  }

  const openAction = (app: any, action: 'approve' | 'reject' | 'enroll') => {
    setViewApp(app)
    setActionType(action)
    setRemarks(app.remarks || app.enrollRemarks || '')
  }

  const openPaymentSetup = (app: any) => {
    setViewApp(app)
    setPayCode(app.payCode || generatePayCode())
    setPaymentAmount(app.paymentAmount ? String(app.paymentAmount) : '500')
    setPaymentMethod(app.paymentMethod || 'telebirr')
    setPaymentSetup(true)
  }

  const generatePayCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `SCH-2026-${random}`
  }

  const handleAction = async () => {
    if (!viewApp || !actionType) return
    setProcessing(true)
    try {
      if (actionType === 'enroll') {
        const res = await apiPut(`/api/registrations/${viewApp.id}`, { enroll: true, remarks })
        setEnrollResult(res)
        toast({
          title: 'Student Enrolled!',
          description: `Admission Number: ${res.admissionNumber}`,
        })
      } else {
        const newStatus = actionType === 'approve' ? 'approved' : 'rejected'
        await apiPut(`/api/registrations/${viewApp.id}`, { status: newStatus, remarks })
        toast({
          title: 'Success',
          description: `Application ${newStatus} successfully`,
        })
      }
      broadcastDataUpdate('registration', 'update')
      setActionType(null)
      setRemarks('')
      setViewApp(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentSetup = async () => {
    if (!viewApp) return
    setProcessing(true)
    try {
      await apiPut(`/api/registrations/${viewApp.id}`, {
        payCode,
        paymentAmount,
        paymentMethod,
        status: 'under_review',
      })
      broadcastDataUpdate('registration', 'payment-setup')
      toast({
        title: 'Payment Setup Saved',
        description: `Pay Code: ${payCode} | Amount: ${paymentAmount} ETB`,
      })
      setPaymentSetup(false)
      setViewApp(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await apiDelete(`/api/registrations/${deleteId}`)
      broadcastDataUpdate('registration', 'delete')
      toast({ title: 'Success', description: 'Application deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const statusInfo = (status: string) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admission Applications</h1>
          <p className="text-gray-500">Review, approve, reject, and enroll student applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-teal-700', icon: ClipboardList },
          { label: 'Submitted', value: stats.submitted, color: 'text-blue-600', icon: FileText },
          { label: 'Under Review', value: stats.underReview, color: 'text-amber-600', icon: Clock },
          { label: 'Approved', value: stats.approved, color: 'text-teal-700', icon: CheckCircle2 },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600', icon: XCircle },
          { label: 'Enrolled', value: stats.enrolled, color: 'text-green-600', icon: UserCheck },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <s.icon className={`h-5 w-5 ${s.color} mb-1`} />
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, tracking number, application ID, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
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
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Tracking No.</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const info = statusInfo(app.status)
                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {app.studentPhoto ? (
                                <img src={app.studentPhoto} alt="" className="h-full w-full object-cover rounded-full" />
                              ) : (
                                <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                                  {app.firstName[0]}{app.lastName[0]}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{app.firstName} {app.lastName}</p>
                              <p className="text-xs text-gray-400 font-mono">{app.applicationId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {app.trackingNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{app.applyForGrade || 'N/A'}</TableCell>
                        <TableCell className="text-sm">{app.program || 'N/A'}</TableCell>
                        <TableCell>
                          <p className="text-sm">{app.guardianName}</p>
                          <p className="text-xs text-gray-400">{app.guardianPhone}</p>
                        </TableCell>
                        <TableCell>
                          {app.payCode ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              {app.paymentAmount} ETB
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-400">Not set</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={info.color}>{info.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setViewApp(app)} title="View details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPaymentSetup(app)}
                              className="text-purple-600"
                              title="Setup Payment"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            {app.status !== 'rejected' && app.status !== 'enrolled' && (
                              <>
                                {(app.status === 'submitted' || app.status === 'under_review') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600"
                                    onClick={() => openAction(app, 'approve')}
                                    title="Approve"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {app.status === 'approved' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-teal-600"
                                    onClick={() => openAction(app, 'enroll')}
                                    title="Enroll"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(app.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* View Dialog - Full Application Preview */}
      <Dialog open={!!viewApp && !actionType && !paymentSetup} onOpenChange={(open) => !open && setViewApp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-teal-600" />
              Application Live Preview
            </DialogTitle>
            <DialogDescription>Full application details with live data</DialogDescription>
          </DialogHeader>
          {viewApp && (
            <div className="space-y-5">
              {/* Header with photo */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl">
                <Avatar className="h-16 w-16">
                  {viewApp.studentPhoto ? (
                    <img src={viewApp.studentPhoto} alt="" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-teal-600 text-white text-xl">
                      {viewApp.firstName[0]}{viewApp.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{viewApp.firstName} {viewApp.lastName}</h3>
                  {viewApp.grandFatherName && <p className="text-sm text-gray-600">{viewApp.grandFatherName}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-mono text-xs">{viewApp.applicationId}</Badge>
                    <Badge variant="outline" className="font-mono text-xs text-teal-700">{viewApp.trackingNumber}</Badge>
                    {viewApp.admissionNumber && (
                      <Badge className="bg-green-100 text-green-700 font-mono text-xs">
                        {viewApp.admissionNumber}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge className={statusInfo(viewApp.status).color}>{statusInfo(viewApp.status).label}</Badge>
              </div>

              {/* Tabs for organized data */}
              <Tabs defaultValue="student">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="guardian">Guardian</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>

                {/* Student Tab */}
                <TabsContent value="student" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem icon={User} label="First Name" value={viewApp.firstName} />
                    <InfoItem icon={User} label="Last Name" value={viewApp.lastName} />
                    <InfoItem icon={User} label="Grand Father" value={viewApp.grandFatherName} />
                    <InfoItem icon={User} label="Gender" value={viewApp.gender ? viewApp.gender.charAt(0).toUpperCase() + viewApp.gender.slice(1) : 'N/A'} />
                    <InfoItem icon={Building2} label="Program" value={viewApp.program} />
                    <InfoItem icon={Award} label="Field" value={viewApp.field} />
                    <InfoItem icon={Calendar} label="Date of Birth" value={viewApp.dateOfBirth ? new Date(viewApp.dateOfBirth).toLocaleDateString() : 'N/A'} />
                    <InfoItem icon={User} label="Age" value={viewApp.age ? String(viewApp.age) : 'N/A'} />
                    <InfoItem icon={IdCard} label="National ID (FAN/FCN)" value={viewApp.nationalId} />
                    <InfoItem icon={Building2} label="Media of Instruction" value={viewApp.mediaOfInstruction} />
                  </div>
                  {viewApp.studentPhoto && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Student Photo</p>
                      <img src={viewApp.studentPhoto} alt="Student" className="h-32 w-32 object-cover rounded-lg border" />
                    </div>
                  )}
                </TabsContent>

                {/* Academic Tab */}
                <TabsContent value="academic" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem icon={GraduationCap} label="Apply For Grade" value={viewApp.applyForGrade} />
                    <InfoItem icon={GraduationCap} label="Last Grade Completed" value={viewApp.lastGradeCompleted} />
                    <InfoItem icon={Award} label="Grade Average" value={viewApp.gradeAverage} />
                    <InfoItem icon={User} label="Registration Condition" value={viewApp.registrationCondition} />
                  </div>
                  <InfoItem icon={Building2} label="Last School Attended" value={viewApp.lastSchoolAttended} />
                </TabsContent>

                {/* Guardian Tab */}
                <TabsContent value="guardian" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem icon={User} label="Guardian Name" value={viewApp.guardianName} />
                    <InfoItem icon={User} label="Relationship" value={viewApp.guardianRelationship} />
                    <InfoItem icon={Phone} label="Phone" value={viewApp.guardianPhone} />
                    <InfoItem icon={Mail} label="Email" value={viewApp.guardianEmail} />
                  </div>
                  <InfoItem icon={MapPin} label="Home Address" value={viewApp.guardianAddress} />
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <DocLink label="Certificate Front" url={viewApp.certificateFrontUrl} required />
                    <DocLink label="Certificate Back" url={viewApp.certificateBackUrl} required />
                    <DocLink label="Student ID Front" url={viewApp.studentIdFrontUrl} />
                    <DocLink label="Parent Photo" url={viewApp.parentPhotoUrl} />
                    <DocLink label="Parent ID (Woreda/Fayda)" url={viewApp.parentIdUrl} />
                    <DocLink label="Clearance" url={viewApp.clearanceUrl} />
                    <DocLink label="Payment Receipt" url={viewApp.paymentReceiptUrl} />
                  </div>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem icon={CreditCard} label="Payment Method" value={viewApp.paymentMethod ? (viewApp.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr') : 'N/A'} />
                    <InfoItem icon={CreditCard} label="Pay Code" value={viewApp.payCode} mono />
                    <InfoItem icon={CreditCard} label="Amount" value={viewApp.paymentAmount ? `${viewApp.paymentAmount} ETB` : 'N/A'} />
                  </div>
                  {viewApp.paymentReceiptUrl && (
                    <DocLink label="Payment Receipt" url={viewApp.paymentReceiptUrl} />
                  )}
                </TabsContent>
              </Tabs>

              {/* Review info */}
              {viewApp.reviewedAt && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-600">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Reviewed by <span className="font-semibold">{viewApp.reviewedByName || 'Admin'}</span> on {new Date(viewApp.reviewedAt).toLocaleString()}
                  </p>
                  {viewApp.remarks && <p className="mt-1 text-gray-700">{viewApp.remarks}</p>}
                </div>
              )}

              {/* Actions */}
              {viewApp.status !== 'rejected' && viewApp.status !== 'enrolled' && (
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => openPaymentSetup(viewApp)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Setup Payment
                  </Button>
                  {(viewApp.status === 'submitted' || viewApp.status === 'under_review') && (
                    <>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => openAction(viewApp, 'approve')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => openAction(viewApp, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {viewApp.status === 'approved' && (
                    <Button
                      className="bg-teal-700 hover:bg-teal-800"
                      onClick={() => openAction(viewApp, 'enroll')}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Enroll Student
                    </Button>
                  )}
                </div>
              )}
              {viewApp.status === 'enrolled' && viewApp.admissionNumber && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Student Enrolled</p>
                      <p className="text-sm text-green-700">Admission Number: <span className="font-mono font-bold">{viewApp.admissionNumber}</span></p>
                      {viewApp.enrolledAt && (
                        <p className="text-xs text-green-600">Enrolled on {new Date(viewApp.enrolledAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Setup Dialog */}
      <Dialog open={paymentSetup} onOpenChange={(open) => !open && setPaymentSetup(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Payment Setup
            </DialogTitle>
            <DialogDescription>
              {viewApp && `${viewApp.firstName} ${viewApp.lastName} (${viewApp.trackingNumber})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="telebirr">Telebirr</SelectItem>
                  <SelectItem value="cbe">CBE Birr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Amount (ETB)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label>Pay Code</Label>
              <div className="flex gap-2">
                <Input
                  value={payCode}
                  onChange={(e) => setPayCode(e.target.value)}
                  className="font-mono"
                  placeholder="SCH-2026-XXXXXX"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPayCode(generatePayCode())}
                >
                  Generate
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentSetup(false)}>Cancel</Button>
              <Button
                onClick={handlePaymentSetup}
                disabled={processing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {processing ? 'Saving...' : 'Save Payment Setup'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Dialog (Approve/Reject/Enroll) */}
      <Dialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Application'}
              {actionType === 'reject' && 'Reject Application'}
              {actionType === 'enroll' && 'Enroll Student'}
            </DialogTitle>
            <DialogDescription>
              {viewApp && `${viewApp.firstName} ${viewApp.lastName} (${viewApp.applicationId})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === 'enroll' && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                <p className="font-semibold mb-1">Enrollment Details:</p>
                <p>This will create a new student record with login credentials.</p>
                <p>• A student account will be created</p>
                <p>• An admission number will be generated</p>
                <p>• Default password: password123</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Remarks {actionType === 'reject' && '(required)'}</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Add remarks about this decision..."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
              <Button
                onClick={handleAction}
                disabled={processing || (actionType === 'reject' && !remarks)}
                className={
                  actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : actionType === 'enroll'
                    ? 'bg-teal-700 hover:bg-teal-800'
                    : 'bg-green-600 hover:bg-green-700'
                }
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Enroll Student'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrollment Result Dialog */}
      <Dialog open={!!enrollResult} onOpenChange={(open) => !open && setEnrollResult(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <UserCheck className="h-5 w-5" />
              Student Enrolled Successfully!
            </DialogTitle>
          </DialogHeader>
          {enrollResult && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-green-700">Student Name</p>
                  <p className="font-semibold">{enrollResult.student.firstName} {enrollResult.student.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Admission Number</p>
                  <p className="font-mono font-bold text-green-800">{enrollResult.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Student ID</p>
                  <p className="font-mono font-semibold">{enrollResult.student.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Login Email</p>
                  <p className="font-mono text-sm">{enrollResult.studentEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Default Password</p>
                  <p className="font-mono">password123</p>
                </div>
              </div>
              <Button
                onClick={() => setEnrollResult(null)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this admission application. This action cannot be undone.
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

function InfoItem({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="p-2.5 rounded-lg bg-gray-50">
      <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value || 'N/A'}</p>
    </div>
  )
}

function DocLink({ label, url, required }: { label: string; url: string | null | undefined; required?: boolean }) {
  const [copied, setCopied] = useState(false)
  if (!url) {
    return (
      <div className="p-2.5 rounded-lg bg-gray-50">
        <p className="text-xs text-gray-500 mb-0.5">{label} {required && <span className="text-red-500">*</span>}</p>
        <p className="text-sm text-gray-400">Not uploaded</p>
      </div>
    )
  }
  return (
    <div className="p-2.5 rounded-lg bg-green-50 border border-green-200">
      <p className="text-xs text-green-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</p>
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-teal-600 hover:underline flex items-center gap-1 flex-1 min-w-0 truncate"
        >
          <Upload className="h-3 w-3" />
          View document
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="text-gray-400 hover:text-teal-600"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  )
}
