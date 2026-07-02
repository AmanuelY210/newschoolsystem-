'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  ClipboardCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  Send,
  Loader2,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  User,
  Home,
  School,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'

interface CMSPage {
  id: string
  title: string
  content: string
  bannerImage?: string | null
  published: boolean
}

const STEPS = [
  {
    icon: FileText,
    title: 'Submit Application',
    description:
      'Complete the online application form below and submit the required documents.',
  },
  {
    icon: ClipboardCheck,
    title: 'Application Review',
    description:
      'Our admissions team reviews your application and contacts you within 5 working days.',
  },
  {
    icon: Users,
    title: 'Assessment & Interview',
    description:
      'Applicants attend an age-appropriate assessment and a friendly family interview.',
  },
  {
    icon: CheckCircle2,
    title: 'Offer & Enrollment',
    description:
      'Successful applicants receive an offer letter and complete enrollment formalities.',
  },
]

const REQUIREMENTS = [
  'Completed online application form',
  'Copy of applicant\'s birth certificate',
  'Two recent passport-size photographs',
  'Original report card from previous school (if applicable)',
  'Transfer certificate from previous school (if applicable)',
  'Copy of guardian\'s ID card',
  'Up-to-date immunization records',
]

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

export function AdmissionsPage() {
  const { navigateToPublic } = useAppStore()
  const { toast } = useToast()
  const [page, setPage] = useState<CMSPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'male',
    dateOfBirth: '',
    desiredGrade: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    previousSchool: '',
  })

  useEffect(() => {
    fetch('/api/cms/admissions')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPage(d?.page || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const title = page?.title || 'Admissions'
  const content =
    page?.content ||
    `Welcome to Bright Future Academy Admissions. We are delighted that you are considering joining our community.

Each year, we welcome new families into our school — children who are curious, kind, and eager to learn. Our admissions process is designed to be transparent, supportive, and as smooth as possible for both parents and students.

We accept applications year-round, with the main intake in September. Limited places are available, so we encourage early application.`
  const banner =
    page?.bannerImage ||
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1920&q=70'

  const update = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.guardianName || !form.guardianPhone) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in student name, guardian name, and guardian phone.',
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      toast({
        title: 'Application submitted!',
        description: `Your application ID is ${data.application?.applicationId || 'pending'}. We will be in touch soon.`,
      })
      setForm({
        firstName: '',
        lastName: '',
        gender: 'male',
        dateOfBirth: '',
        desiredGrade: '',
        guardianName: '',
        guardianPhone: '',
        guardianEmail: '',
        address: '',
        previousSchool: '',
      })
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 to-emerald-700">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${banner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/70 to-emerald-900/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/15">
              Admissions 2025 - 2026
            </Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-teal-50">
              Begin your child&apos;s journey with us. We welcome families who share our
              commitment to learning, character, and community.
            </p>
          </motion.div>
        </div>
        <svg
          className="block h-12 w-full text-white sm:h-16"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,40 C360,80 720,0 1080,32 C1260,48 1380,40 1440,28 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* INTRO */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : (
            <motion.div {...fadeIn}>
              <Badge className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100">
                Welcome
              </Badge>
              {content.split(/\n\s*\n/).filter(Boolean).map((p, i) => (
                <p key={i} className="mb-4 text-base leading-relaxed text-gray-600">
                  {p.split('\n').map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < p.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ADMISSION PORTAL CTA */}
      <section className="pb-16 lg:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-600 to-emerald-700 p-8 text-white shadow-xl">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />
              <div className="relative">
                <GraduationCap className="h-10 w-10 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Admission Portal 2026</h3>
                <p className="text-teal-50 mb-6">
                  Complete our 5-step online admission application with document uploads and Telebirr/CBE payment.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigateToPublic('admission-portal')}
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  Start Application
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-800 to-gray-900 p-8 text-white shadow-xl">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="relative">
                <Search className="h-10 w-10 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Track Your Application</h3>
                <p className="text-gray-300 mb-6">
                  Already applied? Enter your tracking number to check your admission status in real-time.
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigateToPublic('track')}
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                >
                  Track Application
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              How to Apply
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Four simple steps
            </h2>
            <p className="mt-3 text-base text-gray-600">
              A clear, supportive process from application to enrollment.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.title}
                  {...fadeIn}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="relative h-full border-gray-100 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="absolute right-5 top-5 text-5xl font-extrabold text-teal-100">
                      {i + 1}
                    </div>
                    <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{s.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* REQUIREMENTS + FORM */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
            {/* Requirements */}
            <motion.div {...fadeIn} className="lg:col-span-2">
              <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
                What to Prepare
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">Admission requirements</h2>
              <p className="mt-3 text-base text-gray-600">
                Please have the following documents ready when you apply.
              </p>
              <Card className="mt-6 border-teal-100 bg-teal-50/30 p-6">
                <ul className="space-y-3">
                  {REQUIREMENTS.map((r) => (
                    <li key={r} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Card className="flex items-center gap-3 border-gray-100 p-4">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Intake</p>
                    <p className="text-sm font-bold text-gray-900">September 2025</p>
                  </div>
                </Card>
                <Card className="flex items-center gap-3 border-gray-100 p-4">
                  <Phone className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Admissions Office</p>
                    <p className="text-sm font-bold text-gray-900">+251 11 234 5678</p>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
                Online Application
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">Apply now</h2>
              <p className="mt-3 text-base text-gray-600">
                Complete the form below. Fields marked with <span className="text-rose-500">*</span> are required.
              </p>

              <Card className="mt-6 border-gray-100 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">
                        Student First Name <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="firstName"
                          className="pl-9"
                          placeholder="Abebe"
                          value={form.firstName}
                          onChange={(e) => update('firstName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">
                        Student Last Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Kebede"
                        value={form.lastName}
                        onChange={(e) => update('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => update('dateOfBirth', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="grade">Desired Grade</Label>
                    <Select value={form.desiredGrade} onValueChange={(v) => update('desiredGrade', v)}>
                      <SelectTrigger id="grade">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Grade 1',
                          'Grade 2',
                          'Grade 3',
                          'Grade 4',
                          'Grade 5',
                          'Grade 6',
                          'Grade 7',
                          'Grade 8',
                          'Grade 9',
                          'Grade 10',
                          'Grade 11',
                          'Grade 12',
                        ].map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      Guardian Information
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="guardianName">
                          Guardian Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="guardianName"
                          placeholder="Parent / Guardian full name"
                          value={form.guardianName}
                          onChange={(e) => update('guardianName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="guardianPhone">
                          Guardian Phone <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="guardianPhone"
                            className="pl-9"
                            placeholder="+251 91 234 5678"
                            value={form.guardianPhone}
                            onChange={(e) => update('guardianPhone', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <Label htmlFor="guardianEmail">Guardian Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="guardianEmail"
                          type="email"
                          className="pl-9"
                          placeholder="guardian@example.com"
                          value={form.guardianEmail}
                          onChange={(e) => update('guardianEmail', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="address">Home Address</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          className="pl-9"
                          rows={2}
                          placeholder="Subcity, Woreda, House No."
                          value={form.address}
                          onChange={(e) => update('address', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <Label htmlFor="previous">Previous School (if any)</Label>
                      <div className="relative">
                        <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="previous"
                          className="pl-9"
                          placeholder="Previous school name"
                          value={form.previousSchool}
                          onChange={(e) => update('previousSchool', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigateToPublic('home')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-teal-600 text-white hover:bg-teal-700"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn}>
            <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-10 text-center shadow-lg sm:px-12">
              <GraduationCap className="mx-auto mb-3 h-10 w-10 text-white" />
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Have questions about admissions?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-teal-50">
                Our admissions team is here to help every step of the way.
              </p>
              <div className="mt-6">
                <Button
                  size="lg"
                  onClick={() => navigateToPublic('contact')}
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  Contact Admissions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
