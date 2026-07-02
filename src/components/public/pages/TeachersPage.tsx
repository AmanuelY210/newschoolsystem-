'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Mail,
  Phone,
  Award,
  Briefcase,
  GraduationCap,
  Users,
  Loader2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Teacher {
  id: string
  teacherId: string
  firstName: string
  lastName: string
  gender?: string
  qualification?: string | null
  specialization?: string | null
  experience?: number
  phone?: string | null
  address?: string | null
  photoUrl?: string | null
  status?: string
  user?: { email?: string; phone?: string | null; avatar?: string | null } | null
}

// Demo data shown when the API returns 401 (anonymous public users)
const DEMO_TEACHERS: Teacher[] = [
  {
    id: 'd1',
    teacherId: 'TCH-2024-001',
    firstName: 'Amanuel',
    lastName: 'Bekele',
    qualification: 'M.Sc. in Mathematics',
    specialization: 'Mathematics & Statistics',
    experience: 12,
    photoUrl: null,
    user: { email: 'amanuel.b@brightfuture.edu', phone: '+251911000003' },
  },
  {
    id: 'd2',
    teacherId: 'TCH-2024-002',
    firstName: 'Sara',
    lastName: 'Tilahun',
    qualification: 'M.A. in English Literature',
    specialization: 'English & Literature',
    experience: 9,
    photoUrl: null,
    user: { email: 'sara.t@brightfuture.edu', phone: '+251911000004' },
  },
  {
    id: 'd3',
    teacherId: 'TCH-2024-003',
    firstName: 'Daniel',
    lastName: 'Girma',
    qualification: 'B.Sc. in Physics',
    specialization: 'Physics & STEM',
    experience: 7,
    photoUrl: null,
    user: { email: 'daniel.g@brightfuture.edu', phone: '+251911000005' },
  },
  {
    id: 'd4',
    teacherId: 'TCH-2024-004',
    firstName: 'Hana',
    lastName: 'Tesfaye',
    qualification: 'M.Ed. in Early Childhood',
    specialization: 'Primary Education',
    experience: 11,
    photoUrl: null,
    user: { email: 'hana.t@brightfuture.edu', phone: '+251911000006' },
  },
  {
    id: 'd5',
    teacherId: 'TCH-2024-005',
    firstName: 'Yohannes',
    lastName: 'Assefa',
    qualification: 'M.Sc. in Chemistry',
    specialization: 'Chemistry',
    experience: 14,
    photoUrl: null,
    user: { email: 'yohannes.a@brightfuture.edu', phone: '+251911000007' },
  },
  {
    id: 'd6',
    teacherId: 'TCH-2024-006',
    firstName: 'Meriem',
    lastName: 'Hailu',
    qualification: 'B.A. in History',
    specialization: 'Social Studies',
    experience: 8,
    photoUrl: null,
    user: { email: 'meriem.h@brightfuture.edu', phone: '+251911000008' },
  },
  {
    id: 'd7',
    teacherId: 'TCH-2024-007',
    firstName: 'Robel',
    lastName: 'Desta',
    qualification: 'B.Sc. in Computer Science',
    specialization: 'Computer Science & Robotics',
    experience: 6,
    photoUrl: null,
    user: { email: 'robel.d@brightfuture.edu', phone: '+251911000009' },
  },
  {
    id: 'd8',
    teacherId: 'TCH-2024-008',
    firstName: 'Selam',
    lastName: 'Wolde',
    qualification: 'M.A. in Fine Arts',
    specialization: 'Visual Arts',
    experience: 10,
    photoUrl: null,
    user: { email: 'selam.w@brightfuture.edu', phone: '+251911000010' },
  },
]

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4 },
}

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [search, setSearch] = useState('')
  const [cmsData, setCmsData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/teachers')
      .then(async (r) => {
        if (!r.ok) throw new Error('unauthorized')
        const data = await r.json()
        const list = data.teachers || []
        if (list.length > 0) {
          setTeachers(list)
          setIsDemo(false)
        } else {
          setTeachers(DEMO_TEACHERS)
          setIsDemo(true)
        }
      })
      .catch(() => {
        // Anonymous users receive 401 — show demo directory instead
        setTeachers(DEMO_TEACHERS)
        setIsDemo(true)
      })
      .finally(() => setLoading(false))
    fetch('/api/cms/teachers')
      .then((r) => r.json())
      .then((data) => setCmsData(data.page?.data || null))
      .catch(() => setCmsData(null))
  }, [])

  const hero = cmsData?.hero || null

  const filtered = useMemo(() => {
    if (!search.trim()) return teachers
    const q = search.toLowerCase()
    return teachers.filter(
      (t) =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q) ||
        t.qualification?.toLowerCase().includes(q) ||
        t.teacherId?.toLowerCase().includes(q)
    )
  }, [teachers, search])

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 to-emerald-700">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: `url(${hero?.image || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=70'})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/60 to-emerald-900/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/15">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              {hero?.badge || 'Our Faculty'}
            </Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              {hero?.title || 'Meet our teachers'}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-teal-50">
              {hero?.subtitle ||
                'Experienced, caring, and passionate educators who inspire our students every day.'}
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

      {/* SEARCH + DEMO BANNER */}
      <section className="border-b border-gray-100 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, subject, or qualification..."
                className="h-11 pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">
              {loading ? 'Loading...' : `Showing ${filtered.length} of ${teachers.length} teachers`}
            </p>
          </div>
          {isDemo && !loading && (
            <div className="mx-auto mt-4 flex max-w-3xl items-start gap-3 rounded-lg border border-teal-100 bg-teal-50/60 p-3 text-xs text-teal-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                You&apos;re viewing a sample faculty directory.{' '}
                <button
                  onClick={() => (window.location.href = '/api/auth/login')}
                  className="font-semibold underline hover:no-underline"
                >
                  Log in
                </button>{' '}
                to see the full list of teachers from our database.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* GRID */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
              <p className="mt-3 text-sm">Loading teachers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Search className="mb-3 h-12 w-12 text-teal-300" />
              <p className="text-base font-medium">No teachers match your search.</p>
              <p className="mt-1 text-sm text-gray-400">Try a different keyword.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((t, i) => {
                const fullName = `${t.firstName} ${t.lastName}`
                const initials = `${t.firstName?.[0] || ''}${t.lastName?.[0] || ''}`
                const photo = t.photoUrl || t.user?.avatar
                return (
                  <motion.div
                    key={t.id}
                    {...fadeIn}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Card className="group h-full overflow-hidden border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative h-32 bg-gradient-to-br from-teal-500 to-emerald-600">
                        <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                        <div className="absolute inset-x-0 bottom-0 flex justify-center">
                          <Avatar className="h-24 w-24 translate-y-1/2 border-4 border-white shadow-md">
                            {photo ? (
                              <AvatarImage src={photo} alt={fullName} />
                            ) : (
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  fullName
                                )}&backgroundColor=0d9488,10b981&textColor=ffffff`}
                                alt={fullName}
                              />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-2xl font-bold text-white">
                              {initials || 'T'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-14 text-center">
                        <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
                        {t.specialization && (
                          <p className="mt-0.5 text-sm font-medium text-teal-600">
                            {t.specialization}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          {t.experience !== undefined && t.experience !== null && (
                            <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                              <Briefcase className="mr-1 h-3 w-3" />
                              {t.experience} yrs
                            </Badge>
                          )}
                          {t.teacherId && (
                            <Badge variant="outline" className="border-gray-200 text-gray-500">
                              {t.teacherId}
                            </Badge>
                          )}
                        </div>
                        {t.qualification && (
                          <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-left">
                            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                            <p className="text-xs text-gray-600">{t.qualification}</p>
                          </div>
                        )}
                        <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-left text-xs text-gray-500">
                          {t.user?.email && (
                            <p className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-teal-500" />
                              <span className="truncate">{t.user.email}</span>
                            </p>
                          )}
                          {(t.user?.phone || t.phone) && (
                            <p className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-teal-500" />
                              <span>{t.user?.phone || t.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn}>
            <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-10 text-center shadow-lg sm:px-12">
              <Award className="mx-auto mb-3 h-10 w-10 text-white" />
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Join our team of educators
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-teal-50">
                We&apos;re always looking for passionate teachers to inspire the next generation.
              </p>
              <div className="mt-6">
                <Button
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-teal-50"
                  onClick={() => (window.location.href = '/api/auth/login')}
                >
                  View Open Positions
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
