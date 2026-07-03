'use client'

import { useState, useMemo } from 'react'
import { useApi } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ChevronLeft, ChevronRight, PartyPopper, ClipboardCheck, Megaphone } from 'lucide-react'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalendarEvent = {
  id: string
  title: string
  date: string
  type: string
  description?: string | null
  location?: string | null
  source: 'holiday' | 'event' | 'exam'
}

export function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [typeFilter, setTypeFilter] = useState('all')

  const { data: holidaysData, loading: l1 } = useApi<{ holidays: any[] }>('/api/holidays')
  const { data: eventsData, loading: l2 } = useApi<{ events: any[] }>('/api/events')
  const { data: examsData, loading: l3 } = useApi<{ exams: any[] }>('/api/exams')
  const loading = l1 || l2 || l3

  const events: CalendarEvent[] = useMemo(() => {
    const holidays: CalendarEvent[] = (holidaysData?.holidays || []).map(h => ({
      id: `h-${h.id}`,
      title: h.name,
      date: h.date,
      type: h.type || 'holiday',
      description: h.description,
      source: 'holiday',
    }))
    const evs: CalendarEvent[] = (eventsData?.events || []).map(e => ({
      id: `e-${e.id}`,
      title: e.title,
      date: e.date,
      type: e.type || 'event',
      description: e.description,
      location: e.location,
      source: 'event',
    }))
    const exams: CalendarEvent[] = (examsData?.exams || []).map(e => ({
      id: `x-${e.id}`,
      title: e.name,
      date: e.examDate,
      type: 'exam',
      description: `${e.examType?.name || 'Exam'} · ${e.subject?.name || 'All subjects'}`,
      source: 'exam',
    }))
    return [...holidays, ...evs, ...exams]
  }, [holidaysData, eventsData, examsData])

  const filteredEvents = typeFilter === 'all' ? events : events.filter(e => e.source === typeFilter)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
    return days
  }, [year, month])

  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const upcomingEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return filteredEvents
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10)
  }, [filteredEvents])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const today = () => setCurrentDate(new Date())

  const eventIcon = (source: string) => {
    if (source === 'holiday') return <PartyPopper className="h-3 w-3" />
    if (source === 'exam') return <ClipboardCheck className="h-3 w-3" />
    return <Megaphone className="h-3 w-3" />
  }

  const eventColor = (source: string) => {
    if (source === 'holiday') return 'bg-purple-100 text-purple-700 border-purple-200'
    if (source === 'exam') return 'bg-rose-100 text-rose-700 border-rose-200'
    return 'bg-teal-100 text-teal-700 border-teal-200'
  }

  const stats = {
    total: events.length,
    holidays: events.filter(e => e.source === 'holiday').length,
    events: events.filter(e => e.source === 'event').length,
    exams: events.filter(e => e.source === 'exam').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Calendar</h1>
          <p className="text-gray-500">View holidays, events, and exams in one calendar</p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="holiday">Holidays</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="exam">Exams</SelectItem>
            </SelectContent>
          </Select>
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'list')}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{stats.total}</p><p className="text-sm text-gray-500">Total Events</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-purple-600">{stats.holidays}</p><p className="text-sm text-gray-500">Holidays</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{stats.events}</p><p className="text-sm text-gray-500">Events</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-rose-600">{stats.exams}</p><p className="text-sm text-gray-500">Exams</p></CardContent></Card>
      </div>

      {loading ? (
        <Card><CardContent className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</CardContent></Card>
      ) : viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  {MONTH_NAMES[month]} {year}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={today}>Today</Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={i} />
                  const dayEvents = getEventsForDay(date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  return (
                    <div key={i} className={`min-h-[80px] rounded-md border p-1.5 ${isToday ? 'border-teal-400 bg-teal-50' : 'border-gray-100'}`}>
                      <div className={`text-xs font-medium mb-1 ${isToday ? 'text-teal-700' : 'text-gray-600'}`}>{date.getDate()}</div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(e => (
                          <div key={e.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${eventColor(e.source)}`} title={e.title}>
                            <span className="flex items-center gap-1">{eventIcon(e.source)}<span className="truncate">{e.title}</span></span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-gray-500 px-1">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Upcoming Events</CardTitle></CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No upcoming events</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {upcomingEvents.map(e => {
                    const eventDate = new Date(e.date)
                    return (
                      <div key={e.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-teal-100 text-teal-700 flex-shrink-0">
                          <span className="text-xs font-medium">{MONTH_NAMES[eventDate.getMonth()].slice(0, 3)}</span>
                          <span className="text-lg font-bold leading-none">{eventDate.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{e.title}</p>
                          <p className="text-xs text-gray-500 truncate">{e.description || ''}</p>
                          <Badge className={`mt-1 text-[10px] border ${eventColor(e.source)}`}>{e.source}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">All Events ({filteredEvents.length})</CardTitle></CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No events found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {[...filteredEvents]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(e => {
                    const eventDate = new Date(e.date)
                    return (
                      <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-md border ${eventColor(e.source)}`}>
                          <span className="text-xs font-medium">{MONTH_NAMES[eventDate.getMonth()].slice(0, 3)}</span>
                          <span className="text-lg font-bold leading-none">{eventDate.getDate()}</span>
                          <span className="text-[10px]">{eventDate.getFullYear()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{e.title}</p>
                            <Badge className={`text-[10px] border ${eventColor(e.source)}`}>{e.source}</Badge>
                          </div>
                          {e.description && <p className="text-xs text-gray-500 mt-0.5">{e.description}</p>}
                          {e.location && <p className="text-xs text-gray-400 mt-0.5">📍 {e.location}</p>}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
