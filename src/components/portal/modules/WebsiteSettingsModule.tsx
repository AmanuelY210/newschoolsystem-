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
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  Save, ShieldAlert, Building2, Image as ImageIcon, PanelTop,
  Search, Facebook, Twitter, Instagram, Youtube, Linkedin, Send,
  Plus, Edit, Trash2, ExternalLink, Globe, Palette,
  GraduationCap, Hash, IdCard, CreditCard, FileText, Upload, Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877f2' },
  { value: 'twitter', label: 'Twitter', icon: Twitter, color: '#1da1f2' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: '#e4405f' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: '#ff0000' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0a66c2' },
  { value: 'telegram', label: 'Telegram', icon: Send, color: '#0088cc' },
] as const

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
            Only <span className="font-semibold text-gray-700">Super Admins</span> can manage website settings.
            Please contact your administrator if you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ============ BRANDING IMAGE UPLOAD COMPONENT ============
function BrandingImageUpload({
  label,
  description,
  value,
  onChange,
  onSave,
  previewClass,
  isFavicon,
}: {
  label: string
  description: string
  value: string
  onChange: (url: string) => void
  onSave: (overrideKey?: string, overrideValue?: string) => Promise<void>
  previewClass: string
  isFavicon?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const settingKey = isFavicon ? 'favicon' : 'logo'

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' })
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', isFavicon ? 'favicon' : 'logo')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onChange(data.url)
      // Auto-save immediately with the new URL
      await onSave(settingKey, data.url)
      toast({ title: 'Uploaded & Saved', description: `${label} uploaded and applied in real-time` })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    onChange('')
    // Auto-save immediately with empty URL
    await onSave(settingKey, '')
    toast({ title: 'Removed', description: `${label} removed and saved` })
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 flex flex-col items-center justify-center min-h-[140px] gap-2">
        {value ? (
          <>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <img src={value} alt={label} className={previewClass} />
            </div>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 bg-white cursor-pointer hover:bg-gray-50">
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                {uploading ? 'Uploading...' : 'Replace'}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleRemove}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </>
        ) : (
          <>
            <ImageIcon className="h-10 w-10 text-gray-300" />
            <p className="text-xs text-gray-400">No image uploaded</p>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-teal-700 text-white cursor-pointer hover:bg-teal-800">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {uploading ? 'Uploading...' : `Upload ${label}`}
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
          </>
        )}
      </div>
      {value && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL (auto-filled on upload)"
          className="text-xs font-mono"
        />
      )}
    </div>
  )
}

const GENERAL_KEYS = ['school_name', 'school_tagline', 'portal_name', 'school_address', 'school_phone', 'school_email', 'primary_color']
const BRANDING_KEYS = ['logo', 'favicon']
const HEADER_FOOTER_KEYS = ['header_text', 'footer_text']
const SEO_KEYS = ['seo_title', 'seo_description', 'seo_keywords']
const ADMISSION_KEYS = [
  'admission_prefix',
  'admission_year',
  'admission_padding',
  'admission_start_number',
  'student_id_prefix',
  'student_id_padding',
  'application_id_prefix',
  'tracking_prefix',
  'admission_fee_amount',
  'admission_default_password',
]

export function WebsiteSettingsModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [tab, setTab] = useState('general')

  // Settings are stored as key-value pairs in the SiteSetting table.
  const { data, loading, refetch } = useApi<{ settings: Record<string, string> }>('/api/settings')
  const settings = data?.settings || {}

  // Local editable copies per tab
  const [generalForm, setGeneralForm] = useState<Record<string, string>>({})
  const [brandingForm, setBrandingForm] = useState<Record<string, string>>({})
  const [headerFooterForm, setHeaderFooterForm] = useState<Record<string, string>>({})
  const [seoForm, setSeoForm] = useState<Record<string, string>>({})
  const [admissionForm, setAdmissionForm] = useState<Record<string, string>>({})
  const [savingTab, setSavingTab] = useState<string | null>(null)

  // Hydrate local forms when settings load
  useEffect(() => {
    if (!loading && settings) {
      setGeneralForm(GENERAL_KEYS.reduce((acc, k) => ({ ...acc, [k]: settings[k] || '' }), {}))
      setBrandingForm(BRANDING_KEYS.reduce((acc, k) => ({ ...acc, [k]: settings[k] || '' }), {}))
      setHeaderFooterForm(HEADER_FOOTER_KEYS.reduce((acc, k) => ({ ...acc, [k]: settings[k] || '' }), {}))
      setSeoForm(SEO_KEYS.reduce((acc, k) => ({ ...acc, [k]: settings[k] || '' }), {}))
      setAdmissionForm({
        admission_prefix: settings.admission_prefix || 'ADM',
        admission_year: settings.admission_year || String(new Date().getFullYear()),
        admission_padding: settings.admission_padding || '3',
        admission_start_number: settings.admission_start_number || '1',
        student_id_prefix: settings.student_id_prefix || 'STU',
        student_id_padding: settings.student_id_padding || '3',
        application_id_prefix: settings.application_id_prefix || 'APP',
        tracking_prefix: settings.tracking_prefix || 'TRK',
        admission_fee_amount: settings.admission_fee_amount || '500',
        admission_default_password: settings.admission_default_password || 'password123',
      })
    }
  }, [loading, settings])

  // Social links state
  const [socialDialogOpen, setSocialDialogOpen] = useState(false)
  const [editSocialId, setEditSocialId] = useState<string | null>(null)
  const [socialForm, setSocialForm] = useState<any>({ platform: 'facebook', url: '', active: true })
  const [submittingSocial, setSubmittingSocial] = useState(false)
  const [deleteSocialId, setDeleteSocialId] = useState<string | null>(null)
  const { data: socialData, loading: socialLoading, refetch: refetchSocial } = useApi<{ links: any[] }>('/api/social')
  const socialLinks = socialData?.links || []

  if (role !== 'super_admin') {
    return <AccessDenied />
  }

  const saveTab = async (tabName: string, payload: Record<string, string>, overrideKey?: string, overrideValue?: string) => {
    setSavingTab(tabName)
    try {
      // If override provided, use it directly (for auto-save on image upload)
      const dataToSave = overrideKey !== undefined ? { [overrideKey]: overrideValue ?? '' } : payload
      await apiPut('/api/settings', dataToSave)
      toast({ title: 'Success', description: `${tabName.charAt(0).toUpperCase() + tabName.slice(1)} settings saved` })
      broadcastDataUpdate('settings', 'update')
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSavingTab(null)
    }
  }

  // Social handlers
  const openCreateSocial = () => {
    setEditSocialId(null)
    setSocialForm({ platform: 'facebook', url: '', active: true })
    setSocialDialogOpen(true)
  }
  const openEditSocial = (link: any) => {
    setEditSocialId(link.id)
    setSocialForm({ platform: link.platform, url: link.url, active: link.active })
    setSocialDialogOpen(true)
  }
  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socialForm.platform || !socialForm.url) {
      toast({ title: 'Error', description: 'Platform and URL are required', variant: 'destructive' })
      return
    }
    setSubmittingSocial(true)
    try {
      if (editSocialId) {
        await apiPut(`/api/social/${editSocialId}`, socialForm)
        toast({ title: 'Success', description: 'Social link updated' })
        broadcastDataUpdate('social', 'update')
      } else {
        await apiPost('/api/social', socialForm)
        toast({ title: 'Success', description: 'Social link added' })
        broadcastDataUpdate('social', 'create')
      }
      setSocialDialogOpen(false)
      refetchSocial()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmittingSocial(false)
    }
  }
  const handleSocialDelete = async () => {
    if (!deleteSocialId) return
    try {
      await apiDelete(`/api/social/${deleteSocialId}`)
      toast({ title: 'Success', description: 'Social link deleted' })
      broadcastDataUpdate('social', 'delete')
      setDeleteSocialId(null)
      refetchSocial()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
        <p className="text-gray-500">Configure your school website&apos;s general info, branding, SEO, and social links</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-6 h-auto">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="header-footer" className="gap-2">
              <PanelTop className="h-4 w-4" />
              <span className="hidden sm:inline">Header/Footer</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="admission" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Admission</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
          </TabsList>

          {/* ===== GENERAL TAB ===== */}
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-teal-600" />
                  General Information
                </CardTitle>
                <CardDescription>Basic school contact and identity details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>School Name</Label>
                    <Input
                      value={generalForm.school_name || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, school_name: e.target.value })}
                      placeholder="Bright Future Academy"
                    />
                    <p className="text-xs text-gray-500">Displayed in the website header and footer</p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>School Tagline</Label>
                    <Input
                      value={generalForm.school_tagline || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, school_tagline: e.target.value })}
                      placeholder="Excellence in Education"
                    />
                    <p className="text-xs text-gray-500">Short slogan shown next to the school name (e.g., "Excellence in Education")</p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Portal Name</Label>
                    <Input
                      value={generalForm.portal_name || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, portal_name: e.target.value })}
                      placeholder="Bright Future Academy Portal"
                    />
                    <p className="text-xs text-gray-500">Title shown on the login page and portal sidebar</p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={generalForm.school_address || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, school_address: e.target.value })}
                      placeholder="Bole Road, Addis Ababa, Ethiopia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={generalForm.school_phone || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, school_phone: e.target.value })}
                      placeholder="+251 11 234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={generalForm.school_email || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, school_email: e.target.value })}
                      placeholder="info@school.edu"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Primary Color (hex)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        value={generalForm.primary_color || ''}
                        onChange={(e) => setGeneralForm({ ...generalForm, primary_color: e.target.value })}
                        placeholder="#0d9488"
                        className="flex-1"
                      />
                      <div
                        className="h-10 w-10 rounded-md border"
                        style={{ backgroundColor: generalForm.primary_color || '#0d9488' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Used as the main brand color across the website</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => saveTab('general', generalForm)} disabled={savingTab === 'general'} className="bg-teal-700 hover:bg-teal-800">
                    <Save className="h-4 w-4 mr-2" />
                    {savingTab === 'general' ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== BRANDING TAB ===== */}
          <TabsContent value="branding" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-teal-600" />
                  Branding
                </CardTitle>
                <CardDescription>Upload and manage school logo and favicon - changes apply in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <BrandingImageUpload
                    label="School Logo"
                    description="Displayed in the header, footer, and login page (recommended: 200x200px, PNG/SVG)"
                    value={brandingForm.logo || ''}
                    onChange={(url) => setBrandingForm({ ...brandingForm, logo: url })}
                    onSave={(key, val) => saveTab('branding', brandingForm, key, val)}
                    previewClass="max-h-20 object-contain"
                  />
                  <BrandingImageUpload
                    label="Favicon"
                    description="Browser tab icon (recommended: 32x32px, PNG/ICO)"
                    value={brandingForm.favicon || ''}
                    onChange={(url) => setBrandingForm({ ...brandingForm, favicon: url })}
                    onSave={(key, val) => saveTab('branding', brandingForm, key, val)}
                    previewClass="max-h-16 max-w-16 object-contain"
                    isFavicon
                  />
                </div>

                {/* Live Header Preview */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <PanelTop className="h-4 w-4 text-teal-600" />
                    Live Header Preview
                  </p>
                  <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
                    {brandingForm.logo ? (
                      <img src={brandingForm.logo} alt="Logo" className="h-8 w-8 object-contain" />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        {generalForm.school_name || 'Bright Future Academy'}
                      </p>
                      <p className="text-xs text-teal-600">
                        {generalForm.school_tagline || 'Excellence in Education'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => saveTab('branding', brandingForm)} disabled={savingTab === 'branding'} className="bg-teal-700 hover:bg-teal-800">
                    <Save className="h-4 w-4 mr-2" />
                    {savingTab === 'branding' ? 'Saving...' : 'Save & Apply Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== HEADER / FOOTER TAB ===== */}
          <TabsContent value="header-footer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PanelTop className="h-5 w-5 text-teal-600" />
                  Header &amp; Footer
                </CardTitle>
                <CardDescription>Customize the website header and footer text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Header Text (tagline shown in navbar)</Label>
                  <Input
                    value={headerFooterForm.header_text || ''}
                    onChange={(e) => setHeaderFooterForm({ ...headerFooterForm, header_text: e.target.value })}
                    placeholder="Bright Future Academy · Excellence in Education"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text (copyright / contact line)</Label>
                  <Input
                    value={headerFooterForm.footer_text || ''}
                    onChange={(e) => setHeaderFooterForm({ ...headerFooterForm, footer_text: e.target.value })}
                    placeholder="© 2024 Bright Future Academy. All rights reserved."
                  />
                </div>
                {/* Live preview */}
                <div className="rounded-lg border overflow-hidden bg-white">
                  <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-3 text-sm">
                    {headerFooterForm.header_text || 'Your header text will appear here'}
                  </div>
                  <div className="p-8 text-center text-gray-400 text-sm">
                    [ Website content area ]
                  </div>
                  <div className="bg-gray-900 text-gray-300 p-3 text-xs text-center">
                    {headerFooterForm.footer_text || 'Your footer text will appear here'}
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => saveTab('header-footer', headerFooterForm)} disabled={savingTab === 'header-footer'} className="bg-teal-700 hover:bg-teal-800">
                    <Save className="h-4 w-4 mr-2" />
                    {savingTab === 'header-footer' ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== SEO TAB ===== */}
          <TabsContent value="seo" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-teal-600" />
                  SEO Settings
                </CardTitle>
                <CardDescription>Search engine optimization metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input
                    value={seoForm.seo_title || ''}
                    onChange={(e) => setSeoForm({ ...seoForm, seo_title: e.target.value })}
                    placeholder="Bright Future Academy | Leading School in Addis Ababa"
                  />
                  <p className="text-xs text-gray-500">{(seoForm.seo_title || '').length}/60 characters (recommended max)</p>
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Input
                    value={seoForm.seo_description || ''}
                    onChange={(e) => setSeoForm({ ...seoForm, seo_description: e.target.value })}
                    placeholder="Brief description shown in search results..."
                  />
                  <p className="text-xs text-gray-500">{(seoForm.seo_description || '').length}/160 characters (recommended max)</p>
                </div>
                <div className="space-y-2">
                  <Label>SEO Keywords (comma-separated)</Label>
                  <Input
                    value={seoForm.seo_keywords || ''}
                    onChange={(e) => setSeoForm({ ...seoForm, seo_keywords: e.target.value })}
                    placeholder="school, education, addis ababa, ethiopia, academy"
                  />
                </div>
                {/* Google-style preview */}
                <div className="rounded-lg border p-4 bg-white">
                  <p className="text-xs text-gray-700 truncate">{seoForm.seo_title ? `${seoForm.seo_title} | Bright Future Academy`.slice(0, 60) : 'Bright Future Academy | Leading School in Addis Ababa'}</p>
                  <p className="text-xs text-emerald-700">https://brightfutureacademy.edu</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {seoForm.seo_description || 'Brief description shown in search results...'}
                  </p>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => saveTab('seo', seoForm)} disabled={savingTab === 'seo'} className="bg-teal-700 hover:bg-teal-800">
                    <Save className="h-4 w-4 mr-2" />
                    {savingTab === 'seo' ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ADMISSION TAB ===== */}
          <TabsContent value="admission" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-teal-600" />
                  Admission Number Configuration
                </CardTitle>
                <CardDescription>
                  Customize how admission numbers, student IDs, application IDs, and tracking numbers are generated when students apply and enroll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Admission Number Section */}
                <div className="space-y-4 p-4 bg-teal-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-teal-600" />
                    <h4 className="font-semibold text-gray-900">Admission Number Format</h4>
                  </div>
                  <p className="text-xs text-gray-500">
                    Generated when a student is enrolled. Format: <code className="bg-white px-1.5 py-0.5 rounded text-teal-700 font-mono">PREFIX-YEAR-NUMBER</code>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <Input
                        value={admissionForm.admission_prefix || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, admission_prefix: e.target.value.toUpperCase() })}
                        placeholder="ADM"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        value={admissionForm.admission_year || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, admission_year: e.target.value })}
                        placeholder="2026"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number Padding</Label>
                      <Input
                        type="number"
                        min="1"
                        max="6"
                        value={admissionForm.admission_padding || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, admission_padding: e.target.value })}
                        placeholder="3"
                      />
                      <p className="text-xs text-gray-400">e.g., 3 = 001</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Start Number</Label>
                      <Input
                        type="number"
                        min="1"
                        value={admissionForm.admission_start_number || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, admission_start_number: e.target.value })}
                        placeholder="1"
                      />
                    </div>
                  </div>
                  {/* Live Preview */}
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                    <span className="text-sm text-gray-500">Preview:</span>
                    <code className="text-lg font-bold text-teal-700 font-mono">
                      {admissionForm.admission_prefix || 'ADM'}-{admissionForm.admission_year || '2026'}-
                      {String(parseInt(admissionForm.admission_start_number || '1')).padStart(parseInt(admissionForm.admission_padding || '3'), '0')}
                    </code>
                  </div>
                </div>

                {/* Student ID Section */}
                <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Student ID Format</h4>
                  </div>
                  <p className="text-xs text-gray-500">
                    Generated for each enrolled student. Format: <code className="bg-white px-1.5 py-0.5 rounded text-blue-700 font-mono">PREFIX-YEAR-NUMBER</code>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <Input
                        value={admissionForm.student_id_prefix || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, student_id_prefix: e.target.value.toUpperCase() })}
                        placeholder="STU"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number Padding</Label>
                      <Input
                        type="number"
                        min="1"
                        max="6"
                        value={admissionForm.student_id_padding || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, student_id_padding: e.target.value })}
                        placeholder="3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="h-10 flex items-center">
                        <code className="text-sm font-bold text-blue-700 font-mono">
                          {admissionForm.student_id_prefix || 'STU'}-{admissionForm.admission_year || '2026'}-
                          {String(parseInt(admissionForm.admission_start_number || '1')).padStart(parseInt(admissionForm.student_id_padding || '3'), '0')}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application & Tracking IDs */}
                <div className="space-y-4 p-4 bg-purple-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Application & Tracking Number Prefixes</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Application ID Prefix</Label>
                      <Input
                        value={admissionForm.application_id_prefix || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, application_id_prefix: e.target.value.toUpperCase() })}
                        placeholder="APP"
                        className="font-mono"
                      />
                      <p className="text-xs text-gray-400">Preview: {admissionForm.application_id_prefix || 'APP'}-{admissionForm.admission_year || '2026'}-001</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tracking Number Prefix</Label>
                      <Input
                        value={admissionForm.tracking_prefix || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, tracking_prefix: e.target.value.toUpperCase() })}
                        placeholder="TRK"
                        className="font-mono"
                      />
                      <p className="text-xs text-gray-400">Preview: {admissionForm.tracking_prefix || 'TRK'}-{admissionForm.admission_year || '2026'}-XXXXXX</p>
                    </div>
                  </div>
                </div>

                {/* Payment & Account Settings */}
                <div className="space-y-4 p-4 bg-amber-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                    <h4 className="font-semibold text-gray-900">Payment & Account Defaults</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Admission Processing Fee (ETB)</Label>
                      <Input
                        type="number"
                        value={admissionForm.admission_fee_amount || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, admission_fee_amount: e.target.value })}
                        placeholder="500"
                      />
                      <p className="text-xs text-gray-400">Default fee shown on the payment step</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Student Password</Label>
                      <Input
                        value={admissionForm.admission_default_password || ''}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, admission_default_password: e.target.value })}
                        placeholder="password123"
                      />
                      <p className="text-xs text-gray-400">Initial password for newly enrolled students</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => saveTab('admission', admissionForm)} disabled={savingTab === 'admission'} className="bg-teal-700 hover:bg-teal-800">
                    <Save className="h-4 w-4 mr-2" />
                    {savingTab === 'admission' ? 'Saving...' : 'Save Admission Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== SOCIAL TAB ===== */}
          <TabsContent value="social" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-teal-600" />
                      Social Media Links
                    </CardTitle>
                    <CardDescription>Manage social media profiles shown on the website</CardDescription>
                  </div>
                  <Button onClick={openCreateSocial} className="bg-teal-700 hover:bg-teal-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {socialLoading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : socialLinks.length === 0 ? (
                  <div className="p-12 text-center">
                    <Globe className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No social links yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add your social media profiles to display them on the website.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {socialLinks.map((link, i) => {
                      const platform = PLATFORMS.find((p) => p.value === link.platform)
                      const Icon = platform?.icon || Globe
                      return (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.05, 0.3) }}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50"
                        >
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${platform?.color || '#6b7280'}20` }}
                          >
                            <Icon className="h-5 w-5" style={{ color: platform?.color || '#6b7280' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 capitalize">{link.platform}</p>
                              <Badge variant="outline" className={link.active ? 'text-emerald-700 border-emerald-200' : 'text-gray-500'}>
                                {link.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-teal-700 hover:underline truncate flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {link.url}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditSocial(link)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteSocialId(link.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Social Dialog */}
      <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editSocialId ? 'Edit Social Link' : 'Add Social Link'}</DialogTitle>
            <DialogDescription>{editSocialId ? 'Update social media profile' : 'Add a new social media profile'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSocialSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select value={socialForm.platform} onValueChange={(v) => setSocialForm({ ...socialForm, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon
                    return (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" style={{ color: p.color }} />
                          {p.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Profile URL *</Label>
              <Input
                value={socialForm.url}
                onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                placeholder="https://facebook.com/yourschool"
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="cursor-pointer">Active</Label>
                <p className="text-xs text-gray-500">Show this link on the website</p>
              </div>
              <Switch
                checked={!!socialForm.active}
                onCheckedChange={(v) => setSocialForm({ ...socialForm, active: v })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSocialDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submittingSocial} className="bg-teal-700 hover:bg-teal-800">
                <Save className="h-4 w-4 mr-2" />
                {submittingSocial ? 'Saving...' : editSocialId ? 'Update' : 'Add'} Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Social Confirmation */}
      <AlertDialog open={!!deleteSocialId} onOpenChange={(open) => !open && setDeleteSocialId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Social Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the social media link from the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSocialDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
