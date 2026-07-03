'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface Language {
  id: string
  code: string
  name: string
  nativeName: string | null
  flag: string | null
  enabled: boolean
  isDefault: boolean
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { user, setUser } = useAppStore()
  const { toast } = useToast()
  const [languages, setLanguages] = useState<Language[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch enabled languages
    fetch('/api/languages')
      .then((r) => r.json())
      .then((data) => {
        setLanguages(data.languages || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLanguage = languages.find((l) => l.code === user?.language) || languages.find((l) => l.isDefault) || languages[0]

  const handleChangeLanguage = async (code: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/languages/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Update user in store
      if (user) {
        setUser({ ...user, language: code })
      }

      toast({ title: 'Language Changed', description: `Switched to ${languages.find(l => l.code === code)?.name}` })
      setOpen(false)

      // Reload page to apply language
      setTimeout(() => window.location.reload(), 500)
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (languages.length === 0) return null

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="gap-1.5 px-2"
      >
        <Globe className="h-4 w-4" />
        {compact ? (
          <span className="text-base">{currentLanguage?.flag || '🌐'}</span>
        ) : (
          <>
            <span className="text-base">{currentLanguage?.flag || '🌐'}</span>
            <span className="hidden sm:inline text-sm">{currentLanguage?.code.toUpperCase()}</span>
            <ChevronDown className="h-3 w-3" />
          </>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
          <div className="px-3 py-2 border-b bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Language</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleChangeLanguage(lang.code)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left',
                  currentLanguage?.code === lang.code
                    ? 'bg-teal-50 text-teal-700'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                <span className="text-lg">{lang.flag || '🌐'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{lang.name}</p>
                  {lang.nativeName && lang.nativeName !== lang.name && (
                    <p className="text-xs text-gray-400 truncate">{lang.nativeName}</p>
                  )}
                </div>
                {currentLanguage?.code === lang.code && (
                  <Check className="h-4 w-4 text-teal-600 flex-shrink-0" />
                )}
                {lang.isDefault && currentLanguage?.code !== lang.code && (
                  <span className="text-[10px] text-gray-400">DEFAULT</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
