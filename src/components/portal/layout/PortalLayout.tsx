'use client'

import { useState, useEffect } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { ROLE_NAV, ROLE_LABELS, ROLE_COLORS, NavItem } from '@/lib/nav-config'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  GraduationCap, Menu, LogOut, Bell, Globe, ChevronDown,
  User, Home, ChevronRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWebSocket } from '@/lib/use-websocket'
import { useOnlineUsers, useFirebasePresence } from '@/lib/use-firebase'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface PortalLayoutProps {
  children: React.ReactNode
}

interface SidebarContentProps {
  user: { name: string; role: string; email: string }
  navItems: NavItem[]
  currentModuleId: string
  onNavigate: (moduleId: string) => void
  onViewWebsite: () => void
  onLogout: () => void
  settings: Record<string, string>
}

function SidebarContent({ user, navItems, currentModuleId, onNavigate, onViewWebsite, onLogout, settings }: SidebarContentProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const schoolName = settings.school_name || 'Bright Future Academy'
  const portalName = settings.portal_name || 'Portal'
  const logo = settings.logo || ''
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          {logo ? (
            <img src={logo} alt={schoolName} className="h-10 w-10 object-contain" />
          ) : (
            <GraduationCap className="h-6 w-6 text-teal-700" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-sm text-gray-900 truncate">{schoolName}</h1>
          <p className="text-xs text-gray-500 truncate">{portalName}</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={cn('text-white font-semibold', ROLE_COLORS[user.role as UserRole])}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <Badge variant="secondary" className="text-xs">
              {ROLE_LABELS[user.role as UserRole]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-1">
          {navItems.map((item, idx) => {
            if (item.type === 'module' && item.module) {
              const mod = item.module
              const Icon = mod.icon
              const isActive = currentModuleId === mod.id
              return (
                <button
                  key={mod.id}
                  onClick={() => onNavigate(mod.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.module.label}</span>
                </button>
              )
            }

            if (item.type === 'group' && item.group) {
              const group = item.group
              const GroupIcon = group.icon
              const isExpanded = expandedGroups.has(group.id)
              const hasActiveChild = group.modules.some((m) => m.id === currentModuleId)

              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      hasActiveChild
                        ? 'text-teal-700 bg-teal-50'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <GroupIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-1 text-left">{group.label}</span>
                    <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                      {group.modules.map((module) => {
                        const Icon = module.icon
                        const isActive = currentModuleId === module.id
                        return (
                          <button
                            key={module.id}
                            onClick={() => onNavigate(module.id)}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                              isActive
                                ? 'bg-teal-700 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{module.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return null
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t space-y-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const { user, portalModule, setPortalModule, logout, navigateToPublic } = useAppStore()
  const { connected, onlineCount, notifications, clearNotifications } = useWebSocket()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({})

  // Firebase real-time presence
  const firebaseOnlineCount = useOnlineUsers(5000)
  useFirebasePresence(user?.id || null, user?.name || null, user?.role || null)

  // Use Firebase count if WebSocket count is 0
  const displayOnlineCount = onlineCount > 0 ? onlineCount : firebaseOnlineCount

  useEffect(() => {
    const fetchSettings = () => {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((data) => { if (data.settings) setSettings(data.settings) })
        .catch(() => {})
    }
    fetchSettings()
    // Poll for real-time updates every 5 seconds
    const interval = setInterval(fetchSettings, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!user) return null

  const navItems = ROLE_NAV[user.role as UserRole] || []
  // Flatten modules to find current module for the header title
  const allModules = navItems.flatMap((item) => {
    if (item.type === 'module' && item.module) return [item.module]
    if (item.type === 'group' && item.group) return item.group.modules
    return []
  })
  const currentModule = allModules.find((m) => m.id === portalModule) || allModules[0]

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleNavigate = (moduleId: string) => {
    setPortalModule(moduleId)
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    logout()
    toast({ title: 'Logged out', description: 'You have been signed out' })
  }

  const sidebarProps = {
    user: { name: user.name, role: user.role, email: user.email },
    navItems,
    currentModuleId: currentModule?.id || 'dashboard',
    onNavigate: handleNavigate,
    onViewWebsite: () => navigateToPublic('home'),
    onLogout: handleLogout,
    settings,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent {...sidebarProps} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{currentModule?.label || 'Dashboard'}</h2>
              <p className="text-xs text-gray-500 hidden sm:block">
                {ROLE_LABELS[user.role as UserRole]} Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <div className={cn('h-2 w-2 rounded-full', connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400')} />
              <span className="text-xs font-medium text-green-700">{displayOnlineCount} online</span>
            </div>


            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-xs text-teal-600 hover:underline">
                      Clear all
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <DropdownMenuItem key={notif.id} className="flex-col items-start py-2">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-gray-500">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </p>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn('text-white text-xs', ROLE_COLORS[user.role as UserRole])}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-500 font-normal">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPortalModule('profile')}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
