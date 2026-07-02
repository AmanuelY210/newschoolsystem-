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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Plus, Printer, Award, Eye, Scroll, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const CERT_TYPES = [
  { value: 'completion', label: 'Completion', color: 'bg-teal-100 text-teal-700' },
  { value: 'achievement', label: 'Achievement', color: 'bg-amber-100 text-amber-700' },
  { value: 'transfer', label: 'Transfer', color: 'bg-blue-100 text-blue-700' },
  { value: 'graduation', label: 'Graduation', color: 'bg-purple-100 text-purple-700' },
]

const emptyCert = {
  studentId: '', studentName: '', certificateType: 'completion',
  title: '', description: '', signedBy: '',
}

export function CertificatesModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [typeFilter, setTypeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewCert, setPreviewCert] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyCert)
  const [submitting, setSubmitting] = useState(false)

  const canCreate = hasPermission(role, 'certificate.create')

  const query = typeFilter !== 'all' ? `?certificateType=${encodeURIComponent(typeFilter)}` : ''
  const { data, loading, refetch } = useApi<{ certificates: any[] }>(`/api/certificates${query}`)
  const { data: studentsData } = useApi<{ students: any[] }>(canCreate ? '/api/students' : null)

  const students = studentsData?.students || []
  const certificates = data?.certificates || []

  const openCreate = () => {
    setForm(emptyCert)
    setDialogOpen(true)
  }

  const handleStudentSelect = (studentId: string) => {
    const s = students.find((s) => s.id === studentId)
    setForm({
      ...form,
      studentId,
      studentName: s ? `${s.firstName} ${s.lastName}` : form.studentName,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.studentName || !form.title) {
      toast({ title: 'Error', description: 'Student name and title are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      await apiPost('/api/certificates', form)
      broadcastDataUpdate('certificate', 'create')
      toast({ title: 'Success', description: 'Certificate created successfully' })
      setDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-500">Generate and manage student certificates</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            New Certificate
          </Button>
        )}
      </div>

      {/* Filter */}
      <Card className="no-print">
        <CardContent className="p-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CERT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Certificates List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Scroll className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No certificates issued yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((c, i) => {
            const typeInfo = CERT_TYPES.find((t) => t.value === c.certificateType) || CERT_TYPES[0]
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                        <Award className="h-5 w-5 text-teal-600" />
                      </div>
                      <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{c.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Awarded to:</p>
                    <p className="font-medium text-teal-700 mb-3">{c.studentName}</p>
                    <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
                      <p>Cert No: <span className="font-mono">{c.certificateNumber}</span></p>
                      <p>Issued: {new Date(c.issuedDate).toLocaleDateString()}</p>
                      {c.signedBy && <p>Signed by: {c.signedBy}</p>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 no-print"
                      onClick={() => setPreviewCert(c)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview & Print
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Certificate</DialogTitle>
            <DialogDescription>Issue a new certificate to a student</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={handleStudentSelect}>
                <SelectTrigger><SelectValue placeholder="Select student (optional)" /></SelectTrigger>
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
              <Label>Student Name *</Label>
              <Input
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                placeholder="Enter student name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certificate Type</Label>
                <Select
                  value={form.certificateType}
                  onValueChange={(v) => setForm({ ...form, certificateType: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CERT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Signed By</Label>
                <Input
                  value={form.signedBy}
                  onChange={(e) => setForm({ ...form, signedBy: e.target.value })}
                  placeholder="Principal name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Certificate of Excellence"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
                {submitting ? 'Creating...' : 'Create Certificate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
            <DialogDescription>Print this certificate</DialogDescription>
          </DialogHeader>
          {previewCert && (
            <div className="space-y-4">
              <div className="border-4 border-double border-teal-700 p-8 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-teal-700 flex items-center justify-center">
                      <ShieldCheck className="h-9 w-9 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Bright Future Academy</p>
                  <h2 className="text-3xl font-bold text-teal-800 mt-2 mb-1">Certificate</h2>
                  <p className="text-sm text-gray-600 capitalize mb-6">
                    of {previewCert.certificateType}
                  </p>
                  <p className="text-sm text-gray-500">This certificate is proudly presented to</p>
                  <p className="text-2xl font-bold text-gray-900 my-3 border-b-2 border-teal-600 inline-block px-8 pb-1">
                    {previewCert.studentName}
                  </p>
                  <p className="text-sm text-gray-600 max-w-md mx-auto mt-4">
                    {previewCert.description || `In recognition of successful ${previewCert.certificateType}.`}
                  </p>
                  <p className="text-xs text-gray-500 mt-4">Certificate Number: <span className="font-mono font-medium">{previewCert.certificateNumber}</span></p>

                  <div className="flex justify-around items-end mt-8 pt-4">
                    <div className="text-center">
                      <div className="border-t border-gray-500 w-32 pt-1">
                        <p className="text-xs text-gray-600">{previewCert.signedBy || 'Principal'}</p>
                        <p className="text-xs text-gray-400">Signature</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full border-2 border-teal-700 flex items-center justify-center mx-auto">
                        <Award className="h-6 w-6 text-teal-700" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Official Seal</p>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-gray-500 w-32 pt-1">
                        <p className="text-xs text-gray-600">
                          {new Date(previewCert.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">Date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handlePrint} className="w-full bg-teal-700 hover:bg-teal-800 no-print">
                <Printer className="h-4 w-4 mr-2" />
                Print Certificate
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
