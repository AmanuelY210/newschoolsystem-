'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPut, apiPost, apiDelete } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { PAGE_SCHEMAS, FieldDef, getPageData } from '@/lib/cms-schema'
import {
  FileText, Image as ImageIcon, Video, Eye, Globe, Save, Upload,
  Plus, Trash2, ChevronDown, ChevronRight, Home, Info, GraduationCap,
  Users, Phone, CreditCard, RotateCcw, Check, X, Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'

const PAGE_ICONS: Record<string, any> = {
  home: Home,
  info: Info,
  graduation: GraduationCap,
  users: Users,
  phone: Phone,
  image: ImageIcon,
  student: Users,
}

const MEDIA_CATEGORIES = ['general', 'event', 'sports', 'graduation', 'classroom', 'ceremony']

export function WebsiteCmsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('pages')
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null)

  if (role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">Only Super Admin can manage website CMS content.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website CMS</h1>
        <p className="text-gray-500">Edit all public website pages, content, images, and media</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-6">
          {selectedPageSlug ? (
            <PageEditor slug={selectedPageSlug} onBack={() => setSelectedPageSlug(null)} />
          ) : (
            <PagesList onSelect={setSelectedPageSlug} />
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============ PAGES LIST ============
function PagesList({ onSelect }: { onSelect: (slug: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PAGE_SCHEMAS.map((schema, i) => {
        const Icon = PAGE_ICONS[schema.icon] || FileText
        return (
          <motion.div
            key={schema.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg hover:border-teal-300 transition-all group"
              onClick={() => onSelect(schema.slug)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                    <Icon className="h-6 w-6 text-teal-700" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-teal-600 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{schema.label}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{schema.description}</p>
                <div className="flex items-center gap-1 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {schema.sections.length} sections
                  </Badge>
                  <Badge variant="outline" className="text-xs">/slug: {schema.slug}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============ PAGE EDITOR ============
function PageEditor({ slug, onBack }: { slug: string; onBack: () => void }) {
  const { toast } = useToast()
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([0]))

  const schema = PAGE_SCHEMAS.find((s) => s.slug === slug)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/cms/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.page) {
          setPageData(data.page.data || getPageData(slug))
        } else {
          setPageData(getPageData(slug))
        }
      })
      .catch(() => {
        setPageData(getPageData(slug))
        toast({ title: 'Using default content', description: 'No saved content found, using defaults', variant: 'destructive' })
      })
      .finally(() => setLoading(false))
  }, [slug, toast])

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/cms/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: pageData, title: schema?.label || slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Saved!', description: 'Page content updated successfully' })
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setPageData(getPageData(slug))
    toast({ title: 'Reset to defaults', description: 'Unsaved changes discarded' })
  }

  const updateField = (path: string[], value: any) => {
    setPageData((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev))
      let obj = next
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {}
        obj = obj[path[i]]
      }
      obj[path[path.length - 1]] = value
      return next
    })
  }

  const addListItem = (path: string[]) => {
    setPageData((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev))
      let obj = next
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {}
        obj = obj[path[i]]
      }
      const key = path[path.length - 1]
      if (!obj[key]) obj[key] = []
      // Create empty object with all item fields
      const newItem: any = {}
      obj[key].push(newItem)
      return next
    })
  }

  const removeListItem = (path: string[], index: number) => {
    setPageData((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev))
      let obj = next
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]]
      }
      const key = path[path.length - 1]
      obj[key].splice(index, 1)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (!schema) return <div>Schema not found</div>

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{schema.label}</h2>
            <p className="text-sm text-gray-500">Edit all sections of this page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-teal-700 hover:bg-teal-800">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Sections */}
      {schema.sections.map((field, idx) => {
        const isExpanded = expandedSections.has(idx)
        return (
          <Card key={idx} className="overflow-hidden">
            <button
              onClick={() => toggleSection(idx)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-teal-700" /> : <ChevronRight className="h-4 w-4 text-teal-700" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{field.label}</h3>
                  <p className="text-xs text-gray-500 capitalize">{field.type}</p>
                </div>
              </div>
            </button>
            {isExpanded && (
              <CardContent className="pt-0 border-t">
                <div className="pt-4">
                  <FieldRenderer
                    field={field}
                    value={getValue(pageData, [field.key])}
                    path={[field.key]}
                    onUpdate={updateField}
                    onAddList={addListItem}
                    onRemoveList={removeListItem}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex justify-end gap-2 p-3 bg-white rounded-xl border shadow-lg">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving} className="bg-teal-700 hover:bg-teal-800">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save All Changes
        </Button>
      </div>
    </div>
  )
}

// ============ FIELD RENDERER ============
function FieldRenderer({
  field,
  value,
  path,
  onUpdate,
  onAddList,
  onRemoveList,
}: {
  field: FieldDef
  value: any
  path: string[]
  onUpdate: (path: string[], value: any) => void
  onAddList: (path: string[]) => void
  onRemoveList: (path: string[], index: number) => void
}) {
  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-1.5">
          <Label className="text-sm">{field.label}</Label>
          <Input
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => onUpdate(path, e.target.value)}
          />
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <Label className="text-sm">{field.label}</Label>
          <Textarea
            value={value || ''}
            placeholder={field.placeholder}
            rows={4}
            onChange={(e) => onUpdate(path, e.target.value)}
          />
        </div>
      )

    case 'image':
      return <ImageField field={field} value={value} path={path} onUpdate={onUpdate} />

    case 'color':
      return (
        <div className="space-y-1.5">
          <Label className="text-sm">{field.label}</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || '#0d9488'}
              onChange={(e) => onUpdate(path, e.target.value)}
              className="h-10 w-16 rounded border cursor-pointer"
            />
            <Input
              value={value || ''}
              placeholder="#0d9488"
              onChange={(e) => onUpdate(path, e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      )

    case 'object':
      return (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          {field.fields?.map((subField) => (
            <FieldRenderer
              key={subField.key}
              field={subField}
              value={getValue(value, [subField.key])}
              path={[...path, subField.key]}
              onUpdate={onUpdate}
              onAddList={onAddList}
              onRemoveList={onRemoveList}
            />
          ))}
        </div>
      )

    case 'list':
      return (
        <ListField
          field={field}
          value={value || []}
          path={path}
          onUpdate={onUpdate}
          onAddList={onAddList}
          onRemoveList={onRemoveList}
        />
      )

    default:
      return null
  }
}

// ============ IMAGE FIELD ============
function ImageField({ field, value, path, onUpdate }: { field: FieldDef; value: string; path: string[]; onUpdate: (path: string[], value: any) => void }) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'cms')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate(path, data.url)
      toast({ title: 'Image uploaded', description: file.name })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{field.label}</Label>
      <div className="flex items-start gap-3">
        {value && (
          <div className="h-20 w-20 rounded-lg border overflow-hidden bg-gray-100 flex-shrink-0">
            <img src={value} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <Input
            value={value || ''}
            placeholder="Image URL or upload"
            onChange={(e) => onUpdate(path, e.target.value)}
          />
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50">
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

// ============ LIST FIELD ============
function ListField({
  field,
  value,
  path,
  onUpdate,
  onAddList,
  onRemoveList,
}: {
  field: FieldDef
  value: any[]
  path: string[]
  onUpdate: (path: string[], value: any) => void
  onAddList: (path: string[]) => void
  onRemoveList: (path: string[], index: number) => void
}) {
  const items = Array.isArray(value) ? value : []

  const updateListItem = (index: number, key: string, val: any) => {
    const newList = [...items]
    if (!newList[index]) newList[index] = {}
    newList[index] = { ...newList[index], [key]: val }
    onUpdate(path, newList)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{field.label}</Label>
        {(!field.maxItems || items.length < field.maxItems) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddList(path)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Item
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center bg-gray-50 rounded-lg">No items yet. Click "Add Item" to start.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500">Item {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500"
                  onClick={() => onRemoveList(path, index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-3">
                {field.itemFields?.map((subField) => (
                  <FieldRenderer
                    key={subField.key}
                    field={subField}
                    value={item?.[subField.key]}
                    path={[...path, index.toString(), subField.key]}
                    onUpdate={(p, v) => {
                      // p = [...path, index, subField.key], v = value
                      updateListItem(index, subField.key, v)
                    }}
                    onAddList={onAddList}
                    onRemoveList={onRemoveList}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ MEDIA MANAGER ============
function MediaManager() {
  const { toast } = useToast()
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [form, setForm] = useState({
    title: '', description: '', type: 'photo', url: '', thumbnailUrl: '', category: 'general',
  })

  const fetchMedia = useCallback(() => {
    fetch(`/api/media${typeFilter !== 'all' ? `?type=${typeFilter}` : ''}`)
      .then((r) => r.json())
      .then((data) => { setMediaItems(data.media || []); setLoading(false) })
      .catch(() => { setMediaItems([]); setLoading(false) })
  }, [typeFilter])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleAdd = async () => {
    if (!form.title || !form.url) {
      toast({ title: 'Missing fields', description: 'Title and URL are required', variant: 'destructive' })
      return
    }
    try {
      const res = await apiPost('/api/media', form)
      toast({ title: 'Media added', description: form.title })
      setDialogOpen(false)
      setForm({ title: '', description: '', type: 'photo', url: '', thumbnailUrl: '', category: 'general' })
      fetchMedia()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/media/${id}`)
      toast({ title: 'Deleted', description: 'Media item deleted' })
      fetchMedia()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleFileUpload = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'media')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.url
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="photo">Photos</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setDialogOpen(true)} className="bg-teal-700 hover:bg-teal-800">
          <Plus className="h-4 w-4 mr-1" />
          Add Media
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : mediaItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No media items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-video bg-gray-100 relative">
                {item.type === 'photo' ? (
                  <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-800">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <Badge variant="outline" className="text-xs mt-1">{item.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Media Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Media Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
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
              <Label>URL *</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Image or video URL" />
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50">
                <Upload className="h-3 w-3" />
                Upload File
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        const url = await handleFileUpload(file)
                        setForm({ ...form, url, thumbnailUrl: form.type === 'photo' ? url : form.thumbnailUrl })
                        toast({ title: 'Uploaded' })
                      } catch (err: any) {
                        toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
                      }
                    }
                  }}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="bg-teal-700 hover:bg-teal-800">Add Media</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ HELPERS ============
function getValue(obj: any, path: string[]): any {
  let current = obj
  for (const key of path) {
    if (current === null || current === undefined) return undefined
    current = current[key]
  }
  return current
}
