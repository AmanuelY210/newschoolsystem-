'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Search, CheckCircle2, Clock, XCircle, GraduationCap, FileText,
  User, Phone, AlertCircle, ArrowRight, Copy
} from 'lucide-react'
import { motion } from 'framer-motion'

interface TimelineItem {
  step: string
  status: 'completed' | 'pending' | 'rejected'
  date: string | null
  description: string
}

interface ApplicationData {
  applicationId: string
  trackingNumber: string
  admissionNumber: string | null
  firstName: string
  lastName: string
  applyForGrade: string | null
  program: string | null
  field: string | null
  status: string
  submittedAt: string
  reviewedAt: string | null
  enrolledAt: string | null
  remarks: string | null
  enrollRemarks: string | null
  paymentAmount: number | null
  paymentMethod: string | null
  payCode: string | null
  reviewedByName: string | null
  guardianName: string
  guardianPhone: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: FileText },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  enrolled: { label: 'Enrolled', color: 'bg-teal-100 text-teal-700', icon: GraduationCap },
}

export function TrackApplicationPage() {
  const { navigateToPublic } = useAppStore()
  const { toast } = useToast()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) {
      toast({ title: 'Enter tracking number', description: 'Please enter your tracking number', variant: 'destructive' })
      return
    }

    setLoading(true)
    setApplication(null)
    setTimeline([])
    try {
      const res = await fetch(`/api/registrations/track/${encodeURIComponent(trackingNumber.trim().toUpperCase())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setApplication(data.application)
      setTimeline(data.timeline)
    } catch (error: any) {
      toast({ title: 'Not found', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const copyTracking = () => {
    if (application) {
      navigator.clipboard.writeText(application.trackingNumber)
      toast({ title: 'Copied', description: 'Tracking number copied to clipboard' })
    }
  }

  const statusConfig = application ? STATUS_CONFIG[application.status] || STATUS_CONFIG.submitted : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Search className="h-4 w-4" />
            Application Tracking
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Track Your Application
          </h1>
          <p className="text-gray-600">
            Enter your tracking number to check your admission status
          </p>
        </div>

        {/* Search Card */}
        <Card className="shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="tracking" className="sr-only">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., TRK-2026-ABC123"
                  className="h-12 text-lg font-mono"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-12 bg-teal-700 hover:bg-teal-800 px-8">
                {loading ? 'Searching...' : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              Your tracking number was provided when you submitted your application. Format: TRK-2026-XXXXXX
            </p>
          </CardContent>
        </Card>

        {/* Result */}
        {application && statusConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className={`h-2 ${statusConfig.color.split(' ')[0]}`} />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Application Status</p>
                    <Badge className={`${statusConfig.color} text-base px-4 py-1.5`}>
                      <statusConfig.icon className="h-4 w-4 mr-1.5" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-teal-700">{application.trackingNumber}</span>
                      <button onClick={copyTracking} className="text-gray-400 hover:text-teal-600">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Applicant Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Applicant</p>
                    <p className="text-sm font-semibold">{application.firstName} {application.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Application ID</p>
                    <p className="text-sm font-mono font-semibold">{application.applicationId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Applied Grade</p>
                    <p className="text-sm font-semibold">{application.applyForGrade || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Program</p>
                    <p className="text-sm font-semibold">{application.program || 'N/A'}</p>
                  </div>
                </div>

                {/* Admission Number (if enrolled) */}
                {application.admissionNumber && (
                  <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-teal-700" />
                      <div>
                        <p className="text-xs text-teal-700">Admission Number</p>
                        <p className="text-lg font-bold text-teal-800 font-mono">{application.admissionNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-6">Application Timeline</h3>
                <div className="space-y-1">
                  {timeline.map((item, i) => {
                    const isLast = i === timeline.length - 1
                    return (
                      <div key={i} className="flex gap-4">
                        {/* Line & Icon */}
                        <div className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.status === 'completed' ? 'bg-teal-600 text-white' :
                            item.status === 'rejected' ? 'bg-red-500 text-white' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {item.status === 'completed' && <CheckCircle2 className="h-5 w-5" />}
                            {item.status === 'rejected' && <XCircle className="h-5 w-5" />}
                            {item.status === 'pending' && <Clock className="h-5 w-5" />}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-12 ${item.status === 'completed' ? 'bg-teal-300' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
                          <p className={`font-semibold ${item.status === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>
                            {item.step}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                          {item.date && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(item.date).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Remarks */}
            {(application.remarks || application.enrollRemarks) && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Admin Remarks</h3>
                  {application.remarks && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-2">
                      <p className="text-sm text-gray-700">{application.remarks}</p>
                      {application.reviewedByName && (
                        <p className="text-xs text-gray-500 mt-1">— {application.reviewedByName}</p>
                      )}
                    </div>
                  )}
                  {application.enrollRemarks && (
                    <div className="p-3 bg-teal-50 rounded-lg">
                      <p className="text-sm text-teal-800">{application.enrollRemarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-teal-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Need help?</p>
                    <p className="text-sm text-gray-600 mb-3">
                      If you have questions about your application, please contact our admissions office.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-700">
                        <Phone className="h-3 w-3" /> +251 11 234 5678
                      </span>
                      <Button
                        variant="link"
                        onClick={() => navigateToPublic('contact')}
                        className="text-teal-600 p-0 h-auto"
                      >
                        Contact Us <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty state hint */}
        {!application && !loading && (
          <Card className="shadow-sm border-dashed">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Enter your tracking number</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your tracking number was provided after you submitted your admission application.
              </p>
              <Button
                variant="outline"
                onClick={() => navigateToPublic('admission-portal')}
                className="border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                Apply for Admission
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
