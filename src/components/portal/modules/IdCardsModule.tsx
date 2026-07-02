'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Plus, Printer, CreditCard, User, GraduationCap, Briefcase, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

const PERSON_TYPES = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'teacher', label: 'Teacher', icon: User },
  { value: 'staff', label: 'Staff', icon: Briefcase },
]

const emptyCard = {
  personId: '', personType: 'student', personName: '', expiryDate: '',
}

export function IdCardsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [typeFilter, setTypeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [printCard, setPrintCard] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyCard)
  const [submitting, setSubmitting] = useState(false)

  const canCreate = hasPermission(role, 'idcard.create')

  const query = typeFilter !== 'all' ? `?personType=${encodeURIComponent(typeFilter)}` : ''
  const { data, loading, refetch } = useApi<{ cards: any[] }>(`/api/idcards${query}`)

  // Person selectors
  const { data: studentsData } = useApi<{ students: any[] }>('/api/students')
  const { data: teachersData } = useApi<{ teachers: any[] }>('/api/teachers')

  const students = studentsData?.students || []
  const teachers = teachersData?.teachers || []
  const cards = data?.cards || []

  const openCreate = () => {
    setForm(emptyCard)
    setDialogOpen(true)
  }

  const handlePersonSelect = (personId: string) => {
    let name = ''
    if (form.personType === 'student') {
      const s = students.find((s) => s.id === personId)
      if (s) name = `${s.firstName} ${s.lastName}`
    } else if (form.personType === 'teacher') {
      const t = teachers.find((t) => t.id === personId)
      if (t) name = `${t.firstName} ${t.lastName}`
    }
    setForm({ ...form, personId, personName: name })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.personId || !form.personName) {
      toast({ title: 'Error', description: 'Please select a person', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      await apiPost('/api/idcards', form)
      broadcastDataUpdate('idcard', 'create')
      toast({ title: 'Success', description: 'ID Card generated successfully' })
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
          <h1 className="text-2xl font-bold text-gray-900">ID Cards</h1>
          <p className="text-gray-500">Generate and manage ID cards</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            Generate ID Card
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-teal-700">{cards.length}</p>
            <p className="text-sm text-gray-500">Total Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{cards.filter((c) => c.status === 'active').length}</p>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">{cards.filter((c) => c.personType === 'student').length}</p>
            <p className="text-sm text-gray-500">Student Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-600">{cards.filter((c) => c.personType === 'teacher').length}</p>
            <p className="text-sm text-gray-500">Teacher Cards</p>
          </CardContent>
        </Card>
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
              {PERSON_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No ID cards generated yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => {
            const typeInfo = PERSON_TYPES.find((t) => t.value === c.personType) || PERSON_TYPES[0]
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Card Top */}
                  <div className="bg-gradient-to-r from-teal-700 to-emerald-800 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-teal-100">Bright Future Academy</p>
                        <p className="text-sm font-bold">School ID Card</p>
                      </div>
                      <typeInfo.icon className="h-6 w-6 text-teal-100" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-16 w-16 rounded-lg bg-teal-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{c.personName}</p>
                        <Badge variant="outline" className="text-xs capitalize mt-1">{c.personType}</Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Card No:</span>
                        <span className="font-mono font-medium">{c.cardNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Issued:</span>
                        <span className="font-medium">
                          {new Date(c.issuedDate).toLocaleDateString()}
                        </span>
                      </div>
                      {c.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expires:</span>
                          <span className="font-medium">
                            {new Date(c.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Badge className={c.status === 'active' ? 'bg-green-100 text-green-700 text-xs' : 'bg-gray-100 text-gray-700 text-xs'}>
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 no-print"
                      onClick={() => setPrintCard(c)}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate ID Card</DialogTitle>
            <DialogDescription>Create a new ID card for a student, teacher, or staff</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Person Type</Label>
              <Select
                value={form.personType}
                onValueChange={(v) => setForm({ ...form, personType: v, personId: '', personName: '' })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERSON_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Person *</Label>
              {form.personType === 'student' && (
                <Select value={form.personId} onValueChange={handlePersonSelect}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.studentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.personType === 'teacher' && (
                <Select value={form.personId} onValueChange={handlePersonSelect}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} ({t.teacherId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.personType === 'staff' && (
                <Input
                  placeholder="Enter staff name"
                  value={form.personName}
                  onChange={(e) => setForm({ ...form, personName: e.target.value, personId: e.target.value || 'staff-manual' })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Expiry Date (optional)</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
                {submitting ? 'Generating...' : 'Generate Card'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={!!printCard} onOpenChange={(open) => !open && setPrintCard(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ID Card Preview</DialogTitle>
            <DialogDescription>Print this ID card</DialogDescription>
          </DialogHeader>
          {printCard && (
            <div className="space-y-4">
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-teal-700 to-emerald-800 p-4 text-white text-center">
                  <p className="text-xs text-teal-100">Bright Future Academy</p>
                  <p className="text-base font-bold">Identification Card</p>
                </div>
                <div className="p-4">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="h-24 w-24 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                      <User className="h-12 w-12 text-teal-600" />
                    </div>
                    <p className="text-lg font-bold">{printCard.personName}</p>
                    <Badge variant="outline" className="capitalize mt-1">{printCard.personType}</Badge>
                  </div>
                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Card Number:</span>
                      <span className="font-mono font-medium">{printCard.cardNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Issued:</span>
                      <span className="font-medium">{new Date(printCard.issuedDate).toLocaleDateString()}</span>
                    </div>
                    {printCard.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires:</span>
                        <span className="font-medium">{new Date(printCard.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t text-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    This card is property of Bright Future Academy
                  </div>
                </div>
              </div>
              <Button onClick={handlePrint} className="w-full bg-teal-700 hover:bg-teal-800">
                <Printer className="h-4 w-4 mr-2" />
                Print Card
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
