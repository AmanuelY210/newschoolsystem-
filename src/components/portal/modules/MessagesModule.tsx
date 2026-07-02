'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPut } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useWebSocket } from '@/lib/use-websocket'
import { Mail, MailOpen, MessageSquareReply, CheckCircle2, Eye, Send } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700', icon: Mail },
  { value: 'read', label: 'Read', color: 'bg-gray-100 text-gray-700', icon: MailOpen },
  { value: 'replied', label: 'Replied', color: 'bg-teal-100 text-teal-700', icon: MessageSquareReply },
  { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
]

export function MessagesModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMsg, setViewMsg] = useState<any>(null)
  const [reply, setReply] = useState('')
  const [newStatus, setNewStatus] = useState('replied')
  const [sending, setSending] = useState(false)

  const query = statusFilter !== 'all' ? `?status=${encodeURIComponent(statusFilter)}` : ''
  const { data, loading, refetch } = useApi<{ messages: any[] }>(`/api/contact${query}`)
  const messages = data?.messages || []

  // Stats
  const stats = {
    new: messages.filter(m => m.status === 'new').length,
    replied: messages.filter(m => m.status === 'replied').length,
    closed: messages.filter(m => m.status === 'closed').length,
  }

  const openMessage = async (msg: any) => {
    setViewMsg(msg)
    setReply(msg.reply || '')
    setNewStatus(msg.status === 'new' ? 'read' : msg.status)
    // If new, mark as read
    if (msg.status === 'new') {
      try {
        await apiPut(`/api/contact/${msg.id}`, { status: 'read' })
        refetch()
      } catch (e) {
        // silent fail
      }
    }
  }

  const handleReply = async () => {
    if (!viewMsg) return
    if (!reply.trim() && newStatus === 'replied') {
      toast({ title: 'Error', description: 'Please enter a reply', variant: 'destructive' })
      return
    }
    setSending(true)
    try {
      const payload: any = { status: newStatus }
      if (reply.trim()) payload.reply = reply.trim()
      await apiPut(`/api/contact/${viewMsg.id}`, payload)
      broadcastDataUpdate('contact', 'update')
      toast({ title: 'Success', description: 'Message updated successfully' })
      setViewMsg(null)
      setReply('')
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const statusInfo = (status: string) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-500">Manage and respond to contact form submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="text-xs text-gray-500">New</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <MessageSquareReply className="h-5 w-5 text-teal-600" />
                <span className="text-xs text-gray-500">Replied</span>
              </div>
              <p className="text-2xl font-bold text-teal-700">{stats.replied}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-xs text-gray-500">Closed</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
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
          ) : messages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => {
                    const info = statusInfo(msg.status)
                    const Icon = info.icon
                    return (
                      <TableRow
                        key={msg.id}
                        className={msg.status === 'new' ? 'bg-blue-50/40' : ''}
                      >
                        <TableCell className="font-medium text-sm">{msg.name}</TableCell>
                        <TableCell className="text-sm text-gray-500">{msg.email}</TableCell>
                        <TableCell className="text-sm">{msg.subject}</TableCell>
                        <TableCell>
                          <Badge className={info.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {info.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openMessage(msg)}>
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* View + Reply Dialog */}
      <Dialog open={!!viewMsg} onOpenChange={(open) => !open && setViewMsg(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>View and reply to this message</DialogDescription>
          </DialogHeader>
          {viewMsg && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{viewMsg.subject}</p>
                    <p className="text-xs text-gray-500">
                      From: {viewMsg.name} &lt;{viewMsg.email}&gt;
                      {viewMsg.phone && ` · ${viewMsg.phone}`}
                    </p>
                  </div>
                  <Badge className={statusInfo(viewMsg.status).color}>{statusInfo(viewMsg.status).label}</Badge>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewMsg.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Received: {new Date(viewMsg.createdAt).toLocaleString()}
                </p>
              </div>

              {viewMsg.reply && (
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                  <p className="text-xs font-semibold text-teal-700 mb-1">Previous Reply</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewMsg.reply}</p>
                  {viewMsg.repliedBy && (
                    <p className="text-xs text-gray-500 mt-2">By: {viewMsg.repliedBy.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-3 border-t pt-4">
                <div className="space-y-2">
                  <Label>Reply / Update</Label>
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    placeholder="Type your reply here..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewMsg(null)}>Cancel</Button>
                <Button
                  onClick={handleReply}
                  disabled={sending}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Reply'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
