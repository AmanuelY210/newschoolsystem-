'use client'

import { useEffect, useState } from 'react'
import {
  Menu,
  ChevronDown,
  GraduationCap,
  LogIn,
  Image as ImageIcon,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore, type PublicPage } from '@/lib/store'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  page: PublicPage
  children?: { label: string; page: PublicPage; icon?: any }[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', page: 'home' },
  { label: 'About Us', page: 'about' },
  { label: 'Academy', page: 'academy' },
  {
    label: 'Admissions',
    page: 'admission-portal',
    children: [
      { label: 'Apply Online', page: 'admission-portal', icon: GraduationCap },
      { label: 'Track Application', page: 'track', icon: GraduationCap },
    ],
  },
  {
    label: 'Media',
    page: 'media-photos',
    children: [
      { label: 'Photo Gallery', page: 'media-photos', icon: ImageIcon },
      { label: 'Video Gallery', page: 'media-videos', icon: Video },
    ],
  },
  { label: 'Teachers', page: 'teachers' },
  { label: 'Students', page: 'students' },
  { label: 'Contact Us', page: 'contact' },
]

export function PublicHeader() {
  const { publicPage, navigateToPublic, navigateToLogin } = useAppStore()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const schoolName = settings.school_name || 'Bright Future Academy'
  const tagline = settings.school_tagline || 'Excellence in Education'
  const logo = settings.logo || '/logo.svg'
  const go = (page: PublicPage) => {
    navigateToPublic(page)
    setMobileOpen(false)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-teal-100'
          : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + School Name */}
        <button
          onClick={() => go('home')}
          className="flex items-center gap-2.5 group"
          aria-label={schoolName}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md group-hover:scale-105 transition-transform">
            {logo && logo !== '/logo.svg' ? (
              <img src={logo} alt={schoolName} className="h-7 w-7 object-contain" />
            ) : (
              <GraduationCap className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-base font-bold text-gray-900 sm:text-lg">
              {schoolName}
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-wider text-teal-600 sm:block">
              {tagline}
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active =
              publicPage === item.page ||
              (item.children?.some((c) => c.page === publicPage) ?? false)
            if (item.children) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'text-teal-700 bg-teal-50'
                          : 'text-gray-700 hover:text-teal-700 hover:bg-teal-50/60'
                      )}
                    >
                      {item.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-52">
                    {item.children.map((child) => {
                      const Icon = child.icon
                      return (
                        <DropdownMenuItem
                          key={child.label}
                          onClick={() => go(child.page)}
                          className="cursor-pointer gap-2"
                        >
                          {Icon && <Icon className="h-4 w-4 text-teal-600" />}
                          <span>{child.label}</span>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
            return (
              <button
                key={item.label}
                onClick={() => go(item.page)}
                className={cn(
                  'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-teal-700 bg-teal-50'
                    : 'text-gray-700 hover:text-teal-700 hover:bg-teal-50/60'
                )}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigateToLogin()}
            className="hidden bg-teal-600 text-white hover:bg-teal-700 shadow-sm sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Portal Login
          </Button>

          {/* Mobile Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0">
              <SheetHeader className="border-b border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <SheetTitle className="text-base font-bold text-gray-900">
                    {schoolName}
                  </SheetTitle>
                </div>
              </SheetHeader>

              <nav
                className="flex flex-col gap-1 overflow-y-auto p-4"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {NAV_ITEMS.map((item) => {
                  if (item.children) {
                    return (
                      <div key={item.label} className="flex flex-col">
                        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {item.label}
                        </div>
                        {item.children.map((child) => {
                          const Icon = child.icon
                          return (
                            <button
                              key={child.label}
                              onClick={() => go(child.page)}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                publicPage === child.page
                                  ? 'bg-teal-50 text-teal-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              )}
                            >
                              {Icon && <Icon className="h-4 w-4 text-teal-600" />}
                              {child.label}
                            </button>
                          )
                        })}
                      </div>
                    )
                  }
                  return (
                    <button
                      key={item.label}
                      onClick={() => go(item.page)}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        publicPage === item.page
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </nav>

              <div className="mt-auto border-t border-gray-100 p-4">
                <Button
                  onClick={() => {
                    setMobileOpen(false)
                    navigateToLogin()
                  }}
                  className="w-full bg-teal-600 text-white hover:bg-teal-700"
                >
                  <LogIn className="h-4 w-4" />
                  Portal Login
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
