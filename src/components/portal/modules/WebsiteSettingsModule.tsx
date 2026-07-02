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

const GENERAL_KEYS = ['school_name', 'school_address', 'school_phone', 'school_email', 'primary_color']
const BRANDING_KEYS = ['logo_url', 'favicon_url']
const HEADER_FOOTER_KEYS = ['header_text', 'footer_text']
const SEO_KEYS = ['seo_title', 'seo_description', 'seo_keywords']

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
  const [savingTab, setSavingTab] = useState<string | null>(null)

  // Hydrate local forms when settings load
  useEffect(() => {
    if (!loading && settings) {
      setGeneralForm(GENERAL_KEYS.reduce((acc, k) => ({ ...acc, [k]: settings[k] || '' }), {}))
      setBrandingForm(BRANDING_KEYS.reduce((acc, k) => ({ ...acc, [k]: settings[k] || '' }), {}))
      setHeaderFooterForm(HEADER_FOOTER_KEYS.reduce((acc, k) => ({ ...acc, [k]: settings[k] || '' }), {}))
      setSeoForm(SEO_KEYS.reduce((acc, k) => ({ ...acc, [k]: settings[k] || '' }), {}))
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

  const saveTab = async (tabName: string, payload: Record<string, string>) => {
    setSavingTab(tabName)
    try {
      await apiPut('/api/settings', payload)
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
          <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-5 h-auto">
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
                <CardDescription>School logo and favicon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Logo URL</Label>
                    <Input
                      value={brandingForm.logo_url || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, logo_url: e.target.value })}
                      placeholder="https://..."
                    />
                    <div className="rounded-lg border bg-gray-50 p-4 flex items-center justify-center min-h-[100px]">
                      {brandingForm.logo_url ? (
                        <img src={brandingForm.logo_url} alt="Logo preview" className="max-h-20 object-contain" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                          <p className="text-xs">Logo preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Favicon URL</Label>
                    <Input
                      value={brandingForm.favicon_url || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, favicon_url: e.target.value })}
                      placeholder="https://..."
                    />
                    <div className="rounded-lg border bg-gray-50 p-4 flex items-center justify-center min-h-[100px]">
                      {brandingForm.favicon_url ? (
                        <img src={brandingForm.favicon_url} alt="Favicon preview" className="max-h-16 max-w-16 object-contain" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                          <p className="text-xs">Favicon preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => saveTab('branding', brandingForm)} disabled={savingTab === 'branding'} className="bg-teal-700 hover:bg-teal-800">
                    <Save className="h-4 w-4 mr-2" />
                    {savingTab === 'branding' ? 'Saving...' : 'Save Changes'}
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
