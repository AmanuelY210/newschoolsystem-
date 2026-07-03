'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { hasPermission } from '@/lib/auth'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Languages,
  Globe,
  ShieldAlert,
  CheckCircle2,
  Star,
  FileText,
  Power,
  KeyRound,
  Save,
  X,
  Loader2,
} from 'lucide-react'

// Common flag emoji presets for quick selection in the form
const FLAG_SUGGESTIONS = [
  '🇬🇧', '🇺🇸', '🇪🇹', '🇫🇷', '🇸🇦', '🇨🇳', '🇪🇸', '🇩🇪',
  '🇮🇳', '🇮🇹', '🇵🇹', '🇷🇺', '🇯🇵', '🇰🇷', '🇹🇷', '🏳️',
]

interface Language {
  id: string
  code: string
  name: string
  nativeName?: string | null
  flag?: string | null
  enabled: boolean
  isDefault: boolean
  _count?: { translations: number }
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
            Only <span className="font-semibold text-gray-700">Super Admins</span> can manage
            languages and translations. Please contact your administrator if you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

const emptyForm = {
  code: '',
  name: '',
  nativeName: '',
  flag: '🇬🇧',
  enabled: true,
  isDefault: false,
}

export function LanguageManagementModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()

  // Dialog / form state
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Language | null>(null)
  const [deleteItem, setDeleteItem] = useState<Language | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Translations dialog state
  const [translationsLang, setTranslationsLang] = useState<Language | null>(null)
  const [translationsOpen, setTranslationsOpen] = useState(false)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [translationsLoading, setTranslationsLoading] = useState(false)
  const [translationsSaving, setTranslationsSaving] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [translationSearch, setTranslationSearch] = useState('')

  const { data, loading, refetch } = useApi<{ languages: Language[] }>('/api/languages')
  const languages = data?.languages || []

  // Access control: only super_admin with language permission can manage
  // hasPermission is used as defense-in-depth; super_admin role has '*' wildcard
  const isSuperAdmin = role === 'super_admin' && hasPermission(role, 'language.*')

  if (!isSuperAdmin) {
    return <AccessDenied />
  }

  const filtered = languages.filter((l) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      l.name.toLowerCase().includes(s) ||
      l.code.toLowerCase().includes(s) ||
      (l.nativeName || '').toLowerCase().includes(s)
    )
  })

  const totalTranslations = languages.reduce(
    (sum, l) => sum + (l._count?.translations || 0),
    0
  )
  const defaultLang = languages.find((l) => l.isDefault)

  const openCreate = () => {
    setForm({ ...emptyForm })
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (lang: Language) => {
    setForm({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName || '',
      flag: lang.flag || '',
      enabled: lang.enabled,
      isDefault: lang.isDefault,
    })
    setEditItem(lang)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.name) {
      toast({
        title: 'Validation Error',
        description: 'Code and name are required',
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        code: form.code.trim().toLowerCase(),
        name: form.name.trim(),
        nativeName: form.nativeName.trim() || null,
        flag: form.flag.trim() || null,
        enabled: form.enabled,
        isDefault: form.isDefault,
      }
      if (editItem) {
        await apiPut(`/api/languages/${editItem.id}`, payload)
        toast({ title: 'Success', description: 'Language updated successfully' })
      } else {
        await apiPost('/api/languages', payload)
        toast({ title: 'Success', description: 'Language created successfully' })
      }
      setDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleEnabled = async (lang: Language) => {
    if (lang.isDefault && lang.enabled) {
      toast({
        title: 'Cannot disable',
        description:
          'The default language cannot be disabled. Set another language as default first.',
        variant: 'destructive',
      })
      return
    }
    try {
      await apiPut(`/api/languages/${lang.id}`, { enabled: !lang.enabled })
      toast({
        title: 'Success',
        description: `${lang.name} ${lang.enabled ? 'disabled' : 'enabled'}`,
      })
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const setAsDefault = async (lang: Language) => {
    if (lang.isDefault) return
    try {
      await apiPut(`/api/languages/${lang.id}`, { isDefault: true })
      toast({ title: 'Success', description: `${lang.name} set as default language` })
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      await apiDelete(`/api/languages/${deleteItem.id}`)
      toast({ title: 'Success', description: 'Language deleted successfully' })
      setDeleteItem(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  // ===== Translations dialog handlers =====
  const openTranslations = async (lang: Language) => {
    setTranslationsLang(lang)
    setTranslationsOpen(true)
    setTranslationsLoading(true)
    setTranslations({})
    setNewKey('')
    setNewValue('')
    setTranslationSearch('')
    try {
      const res = await fetch(`/api/languages/${lang.id}/translations`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load translations')
      setTranslations(json.translations || {})
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setTranslationsLoading(false)
    }
  }

  const addNewKey = () => {
    const key = newKey.trim()
    if (!key) {
      toast({
        title: 'Validation Error',
        description: 'Translation key is required',
        variant: 'destructive',
      })
      return
    }
    if (Object.prototype.hasOwnProperty.call(translations, key)) {
      toast({
        title: 'Duplicate Key',
        description: 'This translation key already exists',
        variant: 'destructive',
      })
      return
    }
    setTranslations({ ...translations, [key]: newValue })
    setNewKey('')
    setNewValue('')
  }

  const updateTranslationValue = (key: string, value: string) => {
    setTranslations({ ...translations, [key]: value })
  }

  const removeTranslationKey = (key: string) => {
    const next = { ...translations }
    delete next[key]
    setTranslations(next)
  }

  const saveTranslations = async () => {
    if (!translationsLang) return
    setTranslationsSaving(true)
    try {
      await apiPut(`/api/languages/${translationsLang.id}/translations`, {
        translations,
      })
      toast({
        title: 'Success',
        description: `${Object.keys(translations).length} translation(s) saved`,
      })
      setTranslationsOpen(false)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setTranslationsSaving(false)
    }
  }

  const filteredTranslations = Object.entries(translations).filter(([key]) => {
    if (!translationSearch) return true
    return key.toLowerCase().includes(translationSearch.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Languages className="h-6 w-6 text-teal-700" />
            Language Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage supported languages and their translations
          </p>
        </div>
        <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
          <Plus className="h-4 w-4 mr-2" /> Add Language
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5 text-teal-700" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-teal-700">{languages.length}</p>
              <p className="text-xs text-gray-500">Total Languages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-emerald-600">
                {languages.filter((l) => l.enabled).length}
              </p>
              <p className="text-xs text-gray-500">Enabled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-amber-600 truncate">
                {defaultLang
                  ? `${defaultLang.flag || ''} ${defaultLang.code.toUpperCase()}`.trim()
                  : '—'}
              </p>
              <p className="text-xs text-gray-500">Default Language</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-teal-700" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-teal-700">{totalTranslations}</p>
              <p className="text-xs text-gray-500">Total Translations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, code, or native name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Languages Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Languages className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No languages found</p>
              <p className="text-gray-400 text-sm mt-1">
                Click &quot;Add Language&quot; to create your first language
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Flag</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-2xl">{l.flag || '🏳️'}</TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{l.name}</div>
                        {l.nativeName && (
                          <div className="text-xs text-gray-500">{l.nativeName}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {l.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            l.enabled
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                          }
                        >
                          <span className="mr-1">{l.enabled ? '🟢' : '🔴'}</span>
                          {l.enabled ? 'ON' : 'OFF'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {l.isDefault ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            <Star className="h-3 w-3 mr-1 fill-current" /> Yes
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end flex-wrap gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(l)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openTranslations(l)}
                            title="Translations"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleEnabled(l)}
                            disabled={l.isDefault && l.enabled}
                            title={l.enabled ? 'Disable' : 'Enable'}
                          >
                            <Power
                              className={`h-4 w-4 ${
                                l.enabled ? 'text-emerald-600' : 'text-gray-400'
                              }`}
                            />
                          </Button>
                          {!l.isDefault && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAsDefault(l)}
                              title="Set as default"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteItem(l)}
                            disabled={l.isDefault}
                            className="text-red-600 hover:text-red-700"
                            title={l.isDefault ? 'Cannot delete default language' : 'Delete'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Language Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Language' : 'Add Language'}</DialogTitle>
            <DialogDescription>
              {editItem
                ? 'Update the language details below'
                : 'Create a new language for the platform'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lang-code">Code *</Label>
                <Input
                  id="lang-code"
                  placeholder="e.g. en, am, om, ti"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editItem}
                  required
                />
                <p className="text-xs text-gray-400">
                  {editItem
                    ? 'Code cannot be changed after creation'
                    : '2-5 letter ISO language code'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang-name">Name *</Label>
                <Input
                  id="lang-name"
                  placeholder="e.g. English"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lang-native">Native Name</Label>
                <Input
                  id="lang-native"
                  placeholder="e.g. አማርኛ"
                  value={form.nativeName}
                  onChange={(e) => setForm({ ...form, nativeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang-flag">Flag</Label>
                <Input
                  id="lang-flag"
                  placeholder="🏳️"
                  value={form.flag}
                  onChange={(e) => setForm({ ...form, flag: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Quick pick flag</Label>
              <div className="flex flex-wrap gap-1">
                {FLAG_SUGGESTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm({ ...form, flag: f })}
                    className={`h-8 w-8 rounded border text-lg flex items-center justify-center transition-colors ${
                      form.flag === f
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id="lang-enabled"
                  checked={form.enabled}
                  onCheckedChange={(v) => setForm({ ...form, enabled: v })}
                />
                <Label htmlFor="lang-enabled" className="cursor-pointer">
                  Enabled
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="lang-default"
                  checked={form.isDefault}
                  onCheckedChange={(v) => setForm({ ...form, isDefault: v })}
                  disabled={editItem?.isDefault}
                />
                <Label htmlFor="lang-default" className="cursor-pointer">
                  Set as Default
                </Label>
              </div>
            </div>
            {editItem?.isDefault && (
              <p className="text-xs text-amber-600">
                This is the current default language. The default flag cannot be removed from here.
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-teal-700 hover:bg-teal-800"
              >
                {submitting
                  ? 'Saving...'
                  : editItem
                    ? 'Update Language'
                    : 'Create Language'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Translations Dialog */}
      <Dialog open={translationsOpen} onOpenChange={setTranslationsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{translationsLang?.flag}</span>
              <span>{translationsLang?.name}</span>
              <Badge variant="outline" className="font-mono ml-1">
                {translationsLang?.code}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Edit translation keys and their values. Click save to apply all changes.
            </DialogDescription>
          </DialogHeader>

          {/* Add new key section */}
          <div className="border border-dashed border-teal-200 rounded-lg p-3 bg-teal-50/40">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-4 w-4 text-teal-700" />
              <span className="text-sm font-medium text-teal-800">Add New Translation Key</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <Input
                placeholder="key (e.g. dashboard.title)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addNewKey()
                  }
                }}
                className="col-span-12 sm:col-span-4 font-mono text-sm"
              />
              <Input
                placeholder="value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addNewKey()
                  }
                }}
                className="col-span-12 sm:col-span-7"
              />
              <Button
                type="button"
                onClick={addNewKey}
                className="col-span-12 sm:col-span-1 bg-teal-700 hover:bg-teal-800 px-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter translation keys..."
              value={translationSearch}
              onChange={(e) => setTranslationSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Translations list (scrollable) */}
          {translationsLoading ? (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTranslations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="font-medium">
                {translationSearch
                  ? 'No translations match your filter'
                  : 'No translations yet'}
              </p>
              <p className="text-xs mt-1">
                {translationSearch
                  ? 'Try a different search term'
                  : 'Add a new key above to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              <div className="text-xs text-gray-500 px-1 flex justify-between">
                <span>
                  {filteredTranslations.length} of {Object.keys(translations).length} translations
                </span>
                <span className="text-gray-400">key → value</span>
              </div>
              {filteredTranslations.map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-12 gap-2 items-start border border-gray-100 rounded-md p-2 hover:bg-gray-50/50"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <Label className="font-mono text-xs text-teal-700 break-all leading-tight">
                      {key}
                    </Label>
                  </div>
                  <Textarea
                    value={value}
                    onChange={(e) => updateTranslationValue(key, e.target.value)}
                    rows={1}
                    className="col-span-11 sm:col-span-7 text-sm min-h-[38px] resize-y"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTranslationKey(key)}
                    className="col-span-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-0"
                    title="Remove key"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setTranslationsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveTranslations}
              disabled={translationsSaving || translationsLoading}
              className="bg-teal-700 hover:bg-teal-800"
            >
              {translationsSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Translations
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Language?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-semibold text-gray-900">
                {deleteItem?.flag} {deleteItem?.name}
              </span>{' '}
              ({deleteItem?.code}) and all of its associated translations. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
