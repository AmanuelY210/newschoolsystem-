'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { SlidersHorizontal, Save, Clock, Calendar, Bell, Percent, AlertTriangle } from 'lucide-react'

export function AttendanceSettingsModule() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    enableAttendance: true,
    requireTeacherAuth: true,
    autoMarkAbsent: false,
    allowEditAfterSave: true,
    lateThresholdMinutes: '15',
    attendancePeriod: 'daily',
    reminderTime: '08:00',
    minAttendancePercent: '75',
    parentNotification: true,
    notifyOnAbsent: true,
    notifyOnLate: false,
    weekendDays: ['Saturday', 'Sunday'],
    academicYearStart: '',
    academicYearEnd: '',
  })

  const handleSave = () => {
    toast({ title: 'Settings Saved', description: 'Attendance configuration has been saved' })
  }

  const toggleWeekend = (day: string) => {
    setSettings(s => ({
      ...s,
      weekendDays: s.weekendDays.includes(day)
        ? s.weekendDays.filter(d => d !== day)
        : [...s.weekendDays, day]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Settings</h1>
          <p className="text-gray-500">Configure attendance rules and notifications</p>
        </div>
        <Button onClick={handleSave} className="bg-teal-700 hover:bg-teal-800">
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between"><Percent className="h-8 w-8 text-teal-600" /><Badge className="bg-green-100 text-green-700">{settings.enableAttendance ? 'ON' : 'OFF'}</Badge></div>
          <p className="text-sm text-gray-500 mt-2">Attendance Module</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between"><Clock className="h-8 w-8 text-emerald-600" /><Badge variant="outline">{settings.lateThresholdMinutes}m</Badge></div>
          <p className="text-sm text-gray-500 mt-2">Late Threshold</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between"><Percent className="h-8 w-8 text-purple-600" /><Badge variant="outline">{settings.minAttendancePercent}%</Badge></div>
          <p className="text-sm text-gray-500 mt-2">Min Required</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between"><Calendar className="h-8 w-8 text-orange-600" /><Badge variant="outline">{settings.weekendDays.length}</Badge></div>
          <p className="text-sm text-gray-500 mt-2">Weekend Days</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><SlidersHorizontal className="h-4 w-4 text-teal-600" />General Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label className="font-medium">Enable Attendance</Label><p className="text-xs text-gray-500">Allow teachers to mark attendance</p></div>
              <Switch checked={settings.enableAttendance} onCheckedChange={(v) => setSettings(s => ({ ...s, enableAttendance: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label className="font-medium">Require Teacher Auth</Label><p className="text-xs text-gray-500">Only assigned teachers can mark</p></div>
              <Switch checked={settings.requireTeacherAuth} onCheckedChange={(v) => setSettings(s => ({ ...s, requireTeacherAuth: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label className="font-medium">Auto-Mark Absent</Label><p className="text-xs text-gray-500">Auto-mark absent after cut-off</p></div>
              <Switch checked={settings.autoMarkAbsent} onCheckedChange={(v) => setSettings(s => ({ ...s, autoMarkAbsent: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label className="font-medium">Allow Edit After Save</Label><p className="text-xs text-gray-500">Teachers can edit past records</p></div>
              <Switch checked={settings.allowEditAfterSave} onCheckedChange={(v) => setSettings(s => ({ ...s, allowEditAfterSave: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Late Threshold (minutes)</Label>
                <Input type="number" value={settings.lateThresholdMinutes} onChange={(e) => setSettings(s => ({ ...s, lateThresholdMinutes: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Attendance Period</Label>
                <Select value={settings.attendancePeriod} onValueChange={(v) => setSettings(s => ({ ...s, attendancePeriod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="period">Per Period</SelectItem>
                    <SelectItem value="session">Morning/Afternoon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Attendance %</Label>
              <Input type="number" value={settings.minAttendancePercent} onChange={(e) => setSettings(s => ({ ...s, minAttendancePercent: e.target.value }))} />
              <p className="text-xs text-gray-500">Students below this percentage may be restricted from exams</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-teal-600" />Notifications & Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label className="font-medium">Parent Notifications</Label><p className="text-xs text-gray-500">Send SMS/Email to parents</p></div>
              <Switch checked={settings.parentNotification} onCheckedChange={(v) => setSettings(s => ({ ...s, parentNotification: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label className="font-medium">Notify on Absent</Label><p className="text-xs text-gray-500">Alert when student is absent</p></div>
              <Switch checked={settings.notifyOnAbsent} onCheckedChange={(v) => setSettings(s => ({ ...s, notifyOnAbsent: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label className="font-medium">Notify on Late</Label><p className="text-xs text-gray-500">Alert when student is late</p></div>
              <Switch checked={settings.notifyOnLate} onCheckedChange={(v) => setSettings(s => ({ ...s, notifyOnLate: v }))} />
            </div>
            <div className="space-y-2">
              <Label>Daily Reminder Time</Label>
              <Input type="time" value={settings.reminderTime} onChange={(e) => setSettings(s => ({ ...s, reminderTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Weekend Days</Label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleWeekend(day)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                      settings.weekendDays.includes(day)
                        ? 'bg-teal-100 text-teal-700 border-teal-300'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Year Start</Label>
                <Input type="date" value={settings.academicYearStart} onChange={(e) => setSettings(s => ({ ...s, academicYearStart: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Academic Year End</Label>
                <Input type="date" value={settings.academicYearEnd} onChange={(e) => setSettings(s => ({ ...s, academicYearEnd: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Note</p>
            <p>These settings are placeholder configuration options. In the production version, they will be persisted to the database and applied to attendance records in real time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
