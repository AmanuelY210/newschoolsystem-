'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { hasPermission } from '@/lib/auth'
import { Plus, Edit, Trash2, Calendar, MapPin, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const EVENT_TYPES = [
  { value: 'event', label: 'Event', color: 'bg-teal-100 text-teal-700' },
  { value: 'holiday', label: 'Holiday', color: 'bg-purple-100 text-purple-700' },
  { value: 'exam', label: 'Exam', color: 'bg-red-100 text-red-700' },
  { value: 'meeting', label: 'Meeting', color: 'bg-amber-100 text-amber-700' },
]

const emptyEvent = {
  title: '', description: '', date: '', location: '', type: 'event',
}

export function EventsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [typeFilter, setTypeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(emptyEvent)
  const [submitting, setSubmitting] = useState(false)

  const canCreate = ['super_admin', 'admin'].includes(role)
  const canEdit = canCreate
  const canDelete = canCreate

  // Fetch all events (override upcoming default)
  const query = typeFilter !== 'all' ? `?type=${encodeURIComponent(typeFilter)}&upcoming=false` : '?upcoming=false'
  const { data, loading, refetch } = useApi<{ events: any[] }>(`/api/events${query}`)
  const events = data?.events || []

  const openCreate = () => {
    setForm(emptyEvent)
    setEditEvent(null)
    setDialogOpen(true)
  }

  const openEdit = (e: any) => {
    setForm({
      title: e.title || '',
      description: e.description || '',
      date: e.date ? new Date(e.date).toISOString().slice(0, 16) : '',
      location: e.location || '',
      type: e.type || 'event',
    })
    setEditEvent(e)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.date) {
      toast({ title: 'Error', description: 'Title and date are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form, date: new Date(form.date).toISOString() }
      if (editEvent) {
        await apiPut(`/api/events/${editEvent.id}`, payload)
        toast({ title: 'Success', description: 'Event updated' })
      } else {
        await apiPost('/api/events', payload)
        toast({ title: 'Success', description: 'Event created' })
      }
      broadcastDataUpdate('event', editEvent ? 'update' : 'create')
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
      await apiDelete(`/api/events/${deleteId}`)
      broadcastDataUpdate('event', 'delete')
      toast({ title: 'Success', description: 'Event deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const typeInfo = (type: string) => EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0]

  // Group events by month for the list view
  const eventsByMonth: Record<string, any[]> = events.reduce((acc, e) => {
    const monthKey = new Date(e.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(e)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500">School events, holidays, exams, and meetings</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        )}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Events */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No events scheduled</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
            <div key={month}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{month}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthEvents.map((e, i) => {
                  const info = typeInfo(e.type)
                  const eventDate = new Date(e.date)
                  const isPast = eventDate < new Date()
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className={`hover:shadow-md transition-shadow h-full ${isPast ? 'opacity-70' : ''}`}>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center justify-center h-14 w-14 rounded-lg bg-teal-50 text-teal-700 flex-shrink-0">
                              <span className="text-xs font-medium">
                                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-xl font-bold leading-none">
                                {eventDate.getDate()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-gray-900 line-clamp-1">{e.title}</h4>
                                <Badge className={info.color + ' text-xs'}>{info.label}</Badge>
                              </div>
                              {e.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{e.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {e.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {e.location}
                                  </span>
                                )}
                              </div>
                              {(canEdit || canDelete) && (
                                <div className="flex gap-1 mt-3 pt-2 border-t">
                                  {canEdit && (
                                    <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  {canDelete && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600"
                                      onClick={() => setDeleteId(e.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>
              {editEvent ? 'Update event details' : 'Schedule a new event'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
                {submitting ? 'Saving...' : editEvent ? 'Update' : 'Create'} Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this event.</AlertDialogDescription>
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
