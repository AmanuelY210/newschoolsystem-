'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { Eye, Trash2, CheckCircle2, XCircle, FileText, UserCheck, Clock, ClipboardList } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
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
  const [viewApp, setViewApp] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'enroll' | null>(null)
  const [remarks, setRemarks] = useState('')
  const [processing, setProcessing] = useState(false)

  const query = statusFilter !== 'all' ? `?status=${encodeURIComponent(statusFilter)}` : ''
  const { data, loading, refetch } = useApi<{ applications: any[] }>(`/api/registrations${query}`)
  const applications = data?.applications || []

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    enrolled: applications.filter(a => a.status === 'enrolled').length,
  }

  const openAction = (app: any, action: 'approve' | 'reject' | 'enroll') => {
    setViewApp(app)
    setActionType(action)
    setRemarks(app.remarks || '')
  }

  const handleAction = async () => {
    if (!viewApp || !actionType) return
    setProcessing(true)
    try {
      const newStatus = actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'enrolled'
      await apiPut(`/api/registrations/${viewApp.id}`, { status: newStatus, remarks })
      broadcastDataUpdate('registration', 'update')
      toast({
        title: 'Success',
        description: `Application ${newStatus} successfully`,
      })
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admission Applications</h1>
        <p className="text-gray-500">Review and process online admission applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <ClipboardList className="h-5 w-5 text-teal-600" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-teal-700">{stats.total}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <span className="text-xs text-gray-500">Approved</span>
              </div>
              <p className="text-2xl font-bold text-teal-700">{stats.approved}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <UserCheck className="h-5 w-5 text-green-600" />
                <span className="text-xs text-gray-500">Enrolled</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.enrolled}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>App ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Desired Grade</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Submitted</TableHead>
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
                          <Badge variant="outline" className="font-mono text-xs">{app.applicationId}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {app.firstName} {app.lastName}
                        </TableCell>
                        <TableCell>{app.desiredGrade || 'N/A'}</TableCell>
                        <TableCell className="text-sm">{app.guardianName}</TableCell>
                        <TableCell className="text-sm">{app.guardianPhone}</TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={info.color}>{info.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setViewApp(app)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {app.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600"
                                  onClick={() => openAction(app, 'approve')}
                                  title="Approve"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600"
                                  onClick={() => openAction(app, 'reject')}
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
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

      {/* View Dialog */}
      <Dialog open={!!viewApp && !actionType} onOpenChange={(open) => !open && setViewApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Full application information</DialogDescription>
          </DialogHeader>
          {viewApp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-lg">{viewApp.firstName} {viewApp.lastName}</p>
                  <Badge variant="outline" className="font-mono text-xs">{viewApp.applicationId}</Badge>
                </div>
                <Badge className={statusInfo(viewApp.status).color}>{statusInfo(viewApp.status).label}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm capitalize">{viewApp.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm">
                    {viewApp.dateOfBirth ? new Date(viewApp.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Desired Grade</p>
                  <p className="text-sm">{viewApp.desiredGrade || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Previous School</p>
                  <p className="text-sm">{viewApp.previousSchool || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Guardian Name</p>
                  <p className="text-sm">{viewApp.guardianName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Guardian Phone</p>
                  <p className="text-sm">{viewApp.guardianPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Guardian Email</p>
                  <p className="text-sm">{viewApp.guardianEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm">{new Date(viewApp.submittedAt).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm">{viewApp.address || 'N/A'}</p>
                </div>
                {viewApp.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Remarks</p>
                    <p className="text-sm">{viewApp.remarks}</p>
                  </div>
                )}
              </div>

              {viewApp.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => openAction(viewApp, 'approve')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => openAction(viewApp, 'reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
              {viewApp.status === 'approved' && (
                <div className="pt-2 border-t">
                  <Button
                    className="w-full bg-teal-700 hover:bg-teal-800"
                    onClick={() => openAction(viewApp, 'enroll')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Enroll Student
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
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
            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
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
                disabled={processing}
                className={
                  actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-teal-700 hover:bg-teal-800'
                }
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Enroll'}
              </Button>
            </DialogFooter>
          </div>
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
