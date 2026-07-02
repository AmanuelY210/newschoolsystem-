'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  User, GraduationCap, Users, FileText, CreditCard, Check, ChevronLeft, ChevronRight,
  Upload, CheckCircle2, AlertCircle, GraduationCap as Cap, ArrowRight, Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id: 1, title: 'Student Information', icon: User },
  { id: 2, title: 'Academic Background', icon: GraduationCap },
  { id: 3, title: 'Guardian Information', icon: Users },
  { id: 4, title: 'Document Upload', icon: FileText },
  { id: 5, title: 'Payment Processing', icon: CreditCard },
]

const initialFormData = {
  // Step 1
  firstName: '', lastName: '', grandFatherName: '', gender: '', program: '', field: '',
  mediaOfInstruction: '', dateOfBirth: '', age: '', nationalId: '', studentPhoto: '',
  // Step 2
  applyForGrade: '', lastGradeCompleted: '', gradeAverage: '', lastSchoolAttended: '',
  registrationCondition: '',
  // Step 3
  guardianName: '', guardianRelationship: '', guardianPhone: '', guardianEmail: '', guardianAddress: '',
  // Step 4 - Documents
  certificateFrontUrl: '', certificateBackUrl: '', studentIdFrontUrl: '',
  parentPhotoUrl: '', parentIdUrl: '', clearanceUrl: '',
  // Step 5 - Payment
  paymentMethod: 'telebirr', paymentReceiptUrl: '',
}

export function AdmissionPortalPage() {
  const { navigateToPublic } = useAppStore()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [applicationId, setApplicationId] = useState('')

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (field: string, file: File, folder: string = 'admissions') => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 10MB', variant: 'destructive' })
      return
    }
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      updateField(field, data.url)
      toast({ title: 'Upload successful', description: `${file.name} uploaded` })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    }
  }

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.gender) {
          toast({ title: 'Missing fields', description: 'Please fill in first name, last name, and gender', variant: 'destructive' })
          return false
        }
        return true
      case 2:
        if (!formData.applyForGrade || !formData.registrationCondition) {
          toast({ title: 'Missing fields', description: 'Please select grade and registration condition', variant: 'destructive' })
          return false
        }
        return true
      case 3:
        if (!formData.guardianName || !formData.guardianPhone) {
          toast({ title: 'Missing fields', description: 'Please fill in guardian name and phone', variant: 'destructive' })
          return false
        }
        return true
      case 4:
        if (!formData.certificateFrontUrl || !formData.certificateBackUrl) {
          toast({ title: 'Missing documents', description: 'Certificate front and back are required', variant: 'destructive' })
          return false
        }
        return true
      case 5:
        if (!formData.paymentReceiptUrl) {
          toast({ title: 'Missing receipt', description: 'Please upload your payment receipt', variant: 'destructive' })
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(5, s + 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setTrackingNumber(data.trackingNumber)
      setApplicationId(data.application.applicationId)
      setSubmitted(true)
      toast({ title: 'Application Submitted!', description: `Tracking: ${data.trackingNumber}` })
    } catch (error: any) {
      toast({ title: 'Submission failed', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
            <p className="text-gray-600 mb-8">
              Your admission application has been submitted successfully. Save your tracking number to check your application status.
            </p>

            <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 mb-6">
              <p className="text-sm text-teal-700 font-medium mb-1">Your Tracking Number</p>
              <p className="text-3xl font-bold text-teal-800 tracking-wider mb-3">{trackingNumber}</p>
              <p className="text-sm text-gray-600">Application ID: <span className="font-mono font-semibold">{applicationId}</span></p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Please save your tracking number. You will need it to check your application status. Our admissions team will review your application and contact you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigateToPublic('track')}
                className="flex-1 bg-teal-700 hover:bg-teal-800"
              >
                <Search className="h-4 w-4 mr-2" />
                Track Application
              </Button>
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setStep(1)
                  setFormData(initialFormData)
                  navigateToPublic('home')
                }}
                variant="outline"
                className="flex-1"
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const progress = (step / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Cap className="h-4 w-4" />
            Admission Portal 2026
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Begin your journey to excellence
          </h1>
          <p className="text-gray-600">
            Join Ethiopia's premier educational institution.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Step {step} of 5</span>
            <span className="text-sm font-bold text-teal-700">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isComplete = step > s.id
              const isActive = step === s.id
              return (
                <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                      isComplete ? 'bg-teal-600 text-white' :
                      isActive ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-600' :
                      'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs text-center hidden sm:block ${isActive ? 'font-semibold text-teal-700' : 'text-gray-500'}`}>
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-lg border-0">
              <CardContent className="p-6 lg:p-8">
                {/* Step 1: Student Information */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-teal-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Student Information</h2>
                        <p className="text-sm text-gray-500">Personal details of the applicant</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>First Name <span className="text-red-500">*</span></Label>
                        <Input value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="Enter first name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name <span className="text-red-500">*</span></Label>
                        <Input value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Enter last name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Grand Father Name</Label>
                        <Input value={formData.grandFatherName} onChange={(e) => updateField('grandFatherName', e.target.value)} placeholder="Enter grand father name" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Gender <span className="text-red-500">*</span></Label>
                        <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                          <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Program</Label>
                        <Select value={formData.program} onValueChange={(v) => updateField('program', v)}>
                          <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Regular Program">Regular Program</SelectItem>
                            <SelectItem value="Night Program">Night Program</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Field</Label>
                        <Select value={formData.field} onValueChange={(v) => updateField('field', v)}>
                          <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Natural Science">Natural Science</SelectItem>
                            <SelectItem value="Social Science">Social Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Media of Instruction</Label>
                        <Select value={formData.mediaOfInstruction} onValueChange={(v) => updateField('mediaOfInstruction', v)}>
                          <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Afaan Oromoo">Afaan Oromoo</SelectItem>
                            <SelectItem value="Afaan Amharaa">Afaan Amharaa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>National ID (FAN/FCN Number)</Label>
                        <Input value={formData.nationalId} onChange={(e) => updateField('nationalId', e.target.value)} placeholder="Enter national ID" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={formData.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Age</Label>
                        <Input type="number" value={formData.age} onChange={(e) => updateField('age', e.target.value)} placeholder="Enter age" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Student Photo</Label>
                      <FileUploadButton
                        url={formData.studentPhoto}
                        onUpload={(file) => handleFileUpload('studentPhoto', file, 'student-photos')}
                        label="Upload Photo"
                        maxMb={5}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Academic Background */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-teal-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Academic Background</h2>
                        <p className="text-sm text-gray-500">Previous education information</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Apply For Grade <span className="text-red-500">*</span></Label>
                        <Select value={formData.applyForGrade} onValueChange={(v) => updateField('applyForGrade', v)}>
                          <SelectTrigger><SelectValue placeholder="Choose grade" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Grade 9">Grade 9</SelectItem>
                            <SelectItem value="Grade 10">Grade 10</SelectItem>
                            <SelectItem value="Grade 11">Grade 11</SelectItem>
                            <SelectItem value="Grade 12">Grade 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Last Grade Completed</Label>
                        <Input value={formData.lastGradeCompleted} onChange={(e) => updateField('lastGradeCompleted', e.target.value)} placeholder="e.g., Grade 9" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Grade Average</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" step="0.1" value={formData.gradeAverage} onChange={(e) => updateField('gradeAverage', e.target.value + '%')} placeholder="e.g., 75.5%" />
                          <span className="text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Registration Condition <span className="text-red-500">*</span></Label>
                        <Select value={formData.registrationCondition} onValueChange={(v) => updateField('registrationCondition', v)}>
                          <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New Student">New Student</SelectItem>
                            <SelectItem value="Old Student">Old Student</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Last School Attended</Label>
                      <Input value={formData.lastSchoolAttended} onChange={(e) => updateField('lastSchoolAttended', e.target.value)} placeholder="e.g., Haacaalu School" />
                    </div>
                  </div>
                )}

                {/* Step 3: Guardian Information */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-teal-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Guardian Information</h2>
                        <p className="text-sm text-gray-500">Parent or guardian contact details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name <span className="text-red-500">*</span></Label>
                        <Input value={formData.guardianName} onChange={(e) => updateField('guardianName', e.target.value)} placeholder="Family full name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Select value={formData.guardianRelationship} onValueChange={(v) => updateField('guardianRelationship', v)}>
                          <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Father">Father</SelectItem>
                            <SelectItem value="Mother">Mother</SelectItem>
                            <SelectItem value="Sister">Sister</SelectItem>
                            <SelectItem value="Brother">Brother</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone Number <span className="text-red-500">*</span></Label>
                        <Input value={formData.guardianPhone} onChange={(e) => updateField('guardianPhone', e.target.value)} placeholder="+2519xxxxxxxx" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input type="email" value={formData.guardianEmail} onChange={(e) => updateField('guardianEmail', e.target.value)} placeholder="family@example.com" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Home Address</Label>
                      <Textarea value={formData.guardianAddress} onChange={(e) => updateField('guardianAddress', e.target.value)} placeholder="Full residential address" rows={2} />
                    </div>
                  </div>
                )}

                {/* Step 4: Document Upload */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-teal-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Required Documents</h2>
                        <p className="text-sm text-gray-500">Upload all required documents (max 10MB each)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FileUploadField
                        label="Certificate Front"
                        required
                        url={formData.certificateFrontUrl}
                        onUpload={(file) => handleFileUpload('certificateFrontUrl', file, 'documents')}
                      />
                      <FileUploadField
                        label="Certificate Back"
                        required
                        url={formData.certificateBackUrl}
                        onUpload={(file) => handleFileUpload('certificateBackUrl', file, 'documents')}
                      />
                      <FileUploadField
                        label="Student National ID Front"
                        url={formData.studentIdFrontUrl}
                        onUpload={(file) => handleFileUpload('studentIdFrontUrl', file, 'documents')}
                      />
                      <FileUploadField
                        label="Upload Parent Photo"
                        url={formData.parentPhotoUrl}
                        onUpload={(file) => handleFileUpload('parentPhotoUrl', file, 'documents')}
                      />
                      <FileUploadField
                        label="Parent ID (Woreda Or Fayda No)"
                        url={formData.parentIdUrl}
                        onUpload={(file) => handleFileUpload('parentIdUrl', file, 'documents')}
                      />
                      <FileUploadField
                        label="Clearance"
                        url={formData.clearanceUrl}
                        onUpload={(file) => handleFileUpload('clearanceUrl', file, 'documents')}
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Payment Processing */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-teal-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Payment Gateway</h2>
                        <p className="text-sm text-gray-500">Complete your admission by making the required payment</p>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateField('paymentMethod', 'telebirr')}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'telebirr' ? 'border-teal-600 bg-teal-50' : 'border-gray-200'}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                            T
                          </div>
                          <span className="font-medium text-sm">Telebirr</span>
                        </div>
                      </button>
                      <button
                        onClick={() => updateField('paymentMethod', 'cbe')}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'cbe' ? 'border-teal-600 bg-teal-50' : 'border-gray-200'}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-lg">
                            C
                          </div>
                          <span className="font-medium text-sm">CBE Birr</span>
                        </div>
                      </button>
                    </div>

                    {/* QR Code & Pay Code Display */}
                    <div className="bg-gradient-to-br from-gray-50 to-teal-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* QR Code Placeholder */}
                        <div className="flex-shrink-0">
                          <div className="h-40 w-40 bg-white border-4 border-teal-600 rounded-xl flex items-center justify-center p-3">
                            {/* Simulated QR code */}
                            <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                              {Array.from({ length: 64 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`${(i * 7 + 3) % 3 === 0 ? 'bg-gray-900' : 'bg-transparent'} rounded-sm`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-center text-sm font-medium text-teal-700 mt-2">
                            {formData.paymentMethod === 'telebirr' ? 'Telebirr QR Code' : 'CBE Birr QR Code'}
                          </p>
                        </div>

                        {/* Payment Info */}
                        <div className="flex-1 w-full">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm text-gray-600">Payment Method</span>
                              <Badge className="bg-teal-100 text-teal-700 capitalize">
                                {formData.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm text-gray-600">Pay Code</span>
                              <span className="font-mono font-bold text-lg text-teal-700">
                                {formData.paymentMethod === 'telebirr' ? 'SCH-2026-TB' : 'SCH-2026-CB'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm text-gray-600">Admission Processing Fee</span>
                              <span className="font-bold text-xl text-gray-900">500 ETB</span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800">
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              Scan the QR code with your {formData.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'} app or use the Pay Code to complete payment. Then upload the receipt below.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Upload */}
                    <div className="space-y-2">
                      <Label>Upload Payment Receipt <span className="text-red-500">*</span></Label>
                      <FileUploadButton
                        url={formData.paymentReceiptUrl}
                        onUpload={(file) => handleFileUpload('paymentReceiptUrl', file, 'receipts')}
                        label="Upload Document"
                        maxMb={10}
                      />
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Payment receipt is required
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                      <p className="text-sm text-teal-800 font-medium mb-2">Application Summary</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></div>
                        <div><span className="text-gray-600">Grade:</span> <span className="font-medium">{formData.applyForGrade}</span></div>
                        <div><span className="text-gray-600">Program:</span> <span className="font-medium">{formData.program}</span></div>
                        <div><span className="text-gray-600">Guardian:</span> <span className="font-medium">{formData.guardianName}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={step === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {step < 5 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-teal-700 hover:bg-teal-800 flex items-center gap-1"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <Cap className="h-4 w-4" />
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Back to admissions info */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigateToPublic('admissions')}
            className="text-sm text-teal-600 hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to Admissions Info
          </button>
        </div>
      </div>
    </div>
  )
}

// Reusable file upload field component
function FileUploadField({ label, required, url, onUpload }: {
  label: string
  required?: boolean
  url: string
  onUpload: (file: File) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <FileUploadButton url={url} onUpload={onUpload} label="Upload Document" maxMb={10} />
    </div>
  )
}

function FileUploadButton({ url, onUpload, label, maxMb = 10 }: {
  url: string
  onUpload: (file: File) => void
  label: string
  maxMb?: number
}) {
  return (
    <div>
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
        {url ? (
          <div className="flex flex-col items-center gap-1 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-xs font-medium">Uploaded</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline" onClick={(e) => e.stopPropagation()}>
              View file
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Upload className="h-6 w-6" />
            <span className="text-xs font-medium">{label}</span>
            <span className="text-xs text-gray-400">max {maxMb}MB</span>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
          }}
        />
      </label>
    </div>
  )
}
