'use client'

import { useEffect, useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { useWebSocket } from '@/lib/use-websocket'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  Plus, Edit, Trash2, FileText, Image as ImageIcon, Video, Eye, Globe,
  Lock, ShieldAlert, Save, ExternalLink, Calendar, Tag,
} from 'lucide-react'
import { motion } from 'framer-motion'

const MEDIA_CATEGORIES = ['general', 'event', 'sports', 'graduation', 'classroom', 'ceremony']

const emptyPageForm = {
  slug: '',
  title: '',
  content: '',
  bannerImage: '',
  metaDescription: '',
  published: true,
}

const emptyMediaForm = {
  title: '',
  description: '',
  type: 'photo',
  url: '',
  thumbnailUrl: '',
  category: 'general',
  published: true,
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">
            Only <span className="font-semibold text-gray-700">Super Admins</span> can manage website content and media.
            Please contact your administrator if you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function WebsiteCmsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [tab, setTab] = useState<'pages' | 'media'>('pages')

  // Page state
  const [pageDialogOpen, setPageDialogOpen] = useState(false)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [pageForm, setPageForm] = useState<any>(emptyPageForm)
  const [pagePreview, setPagePreview] = useState(false)
  const [submittingPage, setSubmittingPage] = useState(false)
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null)

  // Media state
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [mediaForm, setMediaForm] = useState<any>(emptyMediaForm)
  const [submittingMedia, setSubmittingMedia] = useState(false)
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null)
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all')

  // Super admin check
  if (role !== 'super_admin') {
    return <AccessDenied />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website CMS</h1>
          <p className="text-gray-500">Manage public website pages and media gallery</p>
        </div>
        {tab === 'pages' ? (
          <Button onClick={() => {
            setEditingSlug(null)
            setPageForm(emptyPageForm)
            setPageDialogOpen(true)
          }} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        ) : (
          <Button onClick={() => {
            setMediaForm(emptyMediaForm)
            setMediaDialogOpen(true)
          }} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Media
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'pages' | 'media')}>
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Media
          </TabsTrigger>
        </TabsList>

        {/* ===== PAGES TAB ===== */}
        <TabsContent value="pages" className="mt-6">
          <PagesTabContent
            onEdit={(page) => {
              setEditingSlug(page.slug)
              setPageForm({
                slug: page.slug,
                title: page.title,
                content: page.content || '',
                bannerImage: page.bannerImage || '',
                metaDescription: page.metaDescription || '',
                published: page.published,
              })
              setPageDialogOpen(true)
            }}
            onDelete={(slug) => setDeleteSlug(slug)}
          />
        </TabsContent>

        {/* ===== MEDIA TAB ===== */}
        <TabsContent value="media" className="mt-6 space-y-4">
          <MediaTabContent
            typeFilter={mediaTypeFilter}
            setTypeFilter={setMediaTypeFilter}
            onDelete={(id) => setDeleteMediaId(id)}
          />
        </TabsContent>
      </Tabs>

      {/* Page Edit Dialog */}
      <PageDialog
        open={pageDialogOpen}
        onOpenChange={setPageDialogOpen}
        editingSlug={editingSlug}
        form={pageForm}
        setForm={setPageForm}
        preview={pagePreview}
        setPreview={setPagePreview}
        submitting={submittingPage}
        onSubmit={async (e) => {
          e.preventDefault()
          if (!pageForm.slug || !pageForm.title || pageForm.content === undefined) {
            toast({ title: 'Error', description: 'Slug, title, and content are required', variant: 'destructive' })
            return
          }
          setSubmittingPage(true)
          try {
            const payload = {
              slug: pageForm.slug,
              title: pageForm.title,
              content: pageForm.content,
              bannerImage: pageForm.bannerImage || null,
              metaDescription: pageForm.metaDescription || null,
              published: pageForm.published,
            }
            if (editingSlug) {
              await apiPut(`/api/cms/${editingSlug}`, payload)
              toast({ title: 'Success', description: 'Page updated successfully' })
              broadcastDataUpdate('cms', 'update')
            } else {
              await apiPost('/api/cms', payload)
              toast({ title: 'Success', description: 'Page created successfully' })
              broadcastDataUpdate('cms', 'create')
            }
            setPageDialogOpen(false)
            // Trigger refetch in child components via custom event
            window.dispatchEvent(new Event('cms-updated'))
          } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
          } finally {
            setSubmittingPage(false)
          }
        }}
      />

      {/* Media Dialog */}
      <MediaDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        form={mediaForm}
        setForm={setMediaForm}
        submitting={submittingMedia}
        onSubmit={async (e) => {
          e.preventDefault()
          if (!mediaForm.title || !mediaForm.type || !mediaForm.url) {
            toast({ title: 'Error', description: 'Title, type, and URL are required', variant: 'destructive' })
            return
          }
          setSubmittingMedia(true)
          try {
            await apiPost('/api/media', {
              title: mediaForm.title,
              description: mediaForm.description || null,
              type: mediaForm.type,
              url: mediaForm.url,
              thumbnailUrl: mediaForm.thumbnailUrl || null,
              category: mediaForm.category,
              published: mediaForm.published,
            })
            toast({ title: 'Success', description: 'Media item added' })
            broadcastDataUpdate('media', 'create')
            setMediaDialogOpen(false)
            window.dispatchEvent(new Event('cms-updated'))
          } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
          } finally {
            setSubmittingMedia(false)
          }
        }}
      />

      {/* Delete Page Confirmation */}
      <AlertDialog open={!!deleteSlug} onOpenChange={(open) => !open && setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the page <span className="font-mono">/{deleteSlug}</span> from the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteSlug) return
                try {
                  await apiDelete(`/api/cms/${deleteSlug}`)
                  toast({ title: 'Success', description: 'Page deleted' })
                  broadcastDataUpdate('cms', 'delete')
                  setDeleteSlug(null)
                  window.dispatchEvent(new Event('cms-updated'))
                } catch (error: any) {
                  toast({ title: 'Error', description: error.message, variant: 'destructive' })
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Media Confirmation */}
      <AlertDialog open={!!deleteMediaId} onOpenChange={(open) => !open && setDeleteMediaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the media item from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteMediaId) return
                try {
                  await apiDelete(`/api/media/${deleteMediaId}`)
                  toast({ title: 'Success', description: 'Media item deleted' })
                  broadcastDataUpdate('media', 'delete')
                  setDeleteMediaId(null)
                  window.dispatchEvent(new Event('cms-updated'))
                } catch (error: any) {
                  toast({ title: 'Error', description: error.message, variant: 'destructive' })
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============== PAGES TAB ==============
function PagesTabContent({
  onEdit,
  onDelete,
}: {
  onEdit: (page: any) => void
  onDelete: (slug: string) => void
}) {
  const { data, loading, refetch } = useApi<{ pages: any[] }>('/api/cms')

  // Re-fetch when cms-updated event fires (after mutations in parent)
  useCustomEvent('cms-updated', refetch)

  const pages = data?.pages || []

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No CMS pages yet</p>
          <p className="text-xs text-gray-400 mt-1">Click &ldquo;New Page&rdquo; to create your first page.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.05, 0.3) }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-teal-600 to-emerald-700 relative flex items-center justify-center overflow-hidden">
              {p.bannerImage ? (
                <img src={p.bannerImage} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <Globe className="h-10 w-10 text-white/80" />
              )}
              <div className="absolute top-2 right-2">
                {p.published ? (
                  <Badge className="bg-emerald-500 text-white">Published</Badge>
                ) : (
                  <Badge className="bg-gray-700 text-white">
                    <Lock className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">{p.title}</h3>
                <p className="text-xs text-gray-500 font-mono">/{p.slug}</p>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">
                {p.metaDescription || (p.content?.replace(/[#*`>-]/g, '').slice(0, 100) + '...')}
              </p>
              <div className="flex items-center text-xs text-gray-400 gap-1">
                <Calendar className="h-3 w-3" />
                Updated {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center justify-end gap-1 pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => onEdit(p)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(p.slug)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ============== MEDIA TAB ==============
function MediaTabContent({
  typeFilter,
  setTypeFilter,
  onDelete,
}: {
  typeFilter: string
  setTypeFilter: (v: string) => void
  onDelete: (id: string) => void
}) {
  const { data, loading, refetch } = useApi<{ media: any[] }>('/api/media')
  useCustomEvent('cms-updated', refetch)

  const allMedia = data?.media || []
  const media = typeFilter === 'all' ? allMedia : allMedia.filter((m) => m.type === typeFilter)

  return (
    <>
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="photo">Photos</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{media.length} item(s)</Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
        </div>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No media items found</p>
            <p className="text-xs text-gray-400 mt-1">Add photos or videos to the public gallery.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-square bg-gradient-to-br from-teal-100 to-emerald-100 relative">
                  {m.type === 'photo' ? (
                    <img src={m.url} alt={m.title} className="h-full w-full object-cover" />
                  ) : m.thumbnailUrl ? (
                    <img src={m.thumbnailUrl} alt={m.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-900">
                      <Video className="h-10 w-10 text-white/80" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className={m.type === 'photo' ? 'bg-teal-600 text-white' : 'bg-purple-600 text-white'}>
                      {m.type === 'photo' ? <ImageIcon className="h-3 w-3 mr-1" /> : <Video className="h-3 w-3 mr-1" />}
                      {m.type}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <a href={m.url} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="secondary" className="h-9 w-9">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => onDelete(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium line-clamp-1">{m.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 capitalize">{m.category}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  )
}

// ============== PAGE DIALOG ==============
function PageDialog({
  open, onOpenChange, editingSlug, form, setForm, preview, setPreview, submitting, onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSlug: string | null
  form: any
  setForm: (f: any) => void
  preview: boolean
  setPreview: (v: boolean) => void
  submitting: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSlug ? 'Edit Page' : 'Create New Page'}</DialogTitle>
          <DialogDescription>
            {editingSlug ? `Editing /${editingSlug}` : 'Create a new public website page'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Page Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. About Our School"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                required
                placeholder="about-us"
                disabled={!!editingSlug}
              />
              <p className="text-xs text-gray-500">
                {editingSlug ? 'Slug cannot be changed for existing pages' : 'URL-friendly identifier (lowercase, hyphens only)'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Banner Image URL</Label>
            <Input
              value={form.bannerImage}
              onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
              placeholder="https://..."
            />
            {form.bannerImage && (
              <div className="mt-2 h-32 rounded-lg overflow-hidden bg-gray-100">
                <img src={form.bannerImage} alt="Banner preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPreview(!preview)}
                className="text-teal-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                {preview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            {preview ? (
              <div className="min-h-[200px] p-4 rounded-md border border-gray-200 bg-gray-50 prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{form.content}</pre>
              </div>
            ) : (
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                placeholder="# Heading&#10;&#10;Write your page content here. Supports markdown-style formatting..."
                className="font-mono text-sm"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              rows={2}
              placeholder="Short description for SEO and social sharing..."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Published</Label>
              <p className="text-xs text-gray-500">Toggle to make this page visible on the public website</p>
            </div>
            <Switch
              checked={!!form.published}
              onCheckedChange={(v) => setForm({ ...form, published: v })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Saving...' : editingSlug ? 'Update' : 'Create'} Page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============== MEDIA DIALOG ==============
function MediaDialog({
  open, onOpenChange, form, setForm, submitting, onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: any
  setForm: (f: any) => void
  submitting: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Media Item</DialogTitle>
          <DialogDescription>Add a photo or video to the public gallery</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Photo title..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEDIA_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Media URL *</Label>
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required placeholder="https://..." />
          </div>
          {form.type === 'video' && (
            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://..." />
            </div>
          )}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>

          {/* Live preview */}
          {form.url && (
            <div className="rounded-lg overflow-hidden border bg-gray-50">
              <p className="text-xs text-gray-500 p-2 bg-gray-100">Preview</p>
              <div className="aspect-video">
                {form.type === 'photo' ? (
                  <img src={form.url} alt="preview" className="h-full w-full object-cover" />
                ) : form.thumbnailUrl ? (
                  <img src={form.thumbnailUrl} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-900">
                    <Video className="h-10 w-10 text-white/80" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Published</Label>
              <p className="text-xs text-gray-500">Show in the public gallery</p>
            </div>
            <Switch
              checked={!!form.published}
              onCheckedChange={(v) => setForm({ ...form, published: v })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Saving...' : 'Add'} Media
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Tiny helper: listen for a custom window event and trigger a callback
function useCustomEvent(eventName: string, handler: () => void) {
  useEffect(() => {
    const listener = () => handler()
    window.addEventListener(eventName, listener)
    return () => window.removeEventListener(eventName, listener)
  }, [eventName])
}
