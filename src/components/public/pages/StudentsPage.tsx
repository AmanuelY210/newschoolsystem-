'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Users,
  Star,
  Sparkles,
  BookOpen,
  Microscope,
  Palette,
  Music,
  Dumbbell,
  Heart,
  Award,
  Crown,
  GraduationCap,
  ArrowRight,
  Megaphone,
  TreePine,
  Globe2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/lib/store'

interface ApiResponse<T> {
  students?: T[]
}

const ACHIEVEMENTS = [
  {
    icon: Trophy,
    title: 'National Science Olympiad',
    year: '2024',
    description: 'Three students placed in the top 10 nationally, with a gold medal in Chemistry.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Crown,
    title: 'Regional Debate Championship',
    year: '2024',
    description: 'Our debate team won the regional championship for the second consecutive year.',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    icon: Palette,
    title: 'Youth Art Exhibition',
    year: '2023',
    description: 'Five students\' works were selected for the National Youth Art Exhibition.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: Dumbbell,
    title: 'Inter-School Athletics',
    year: '2024',
    description: 'Overall champions in the inter-school athletics meet with 12 medals.',
    color: 'from-teal-600 to-cyan-700',
  },
]

const STUDENT_COUNCIL = [
  { role: 'President', name: 'Haben T.', grade: 'Grade 12', initials: 'HT' },
  { role: 'Vice President', name: 'Naod A.', grade: 'Grade 11', initials: 'NA' },
  { role: 'Secretary', name: 'Lily M.', grade: 'Grade 11', initials: 'LM' },
  { role: 'Treasurer', name: 'Yonas D.', grade: 'Grade 10', initials: 'YD' },
  { role: 'Communications', name: 'Eden G.', grade: 'Grade 10', initials: 'EG' },
  { role: 'Activities', name: 'Sami K.', grade: 'Grade 9', initials: 'SK' },
]

const GRADE_LEVELS = [
  {
    name: 'Primary',
    range: 'Grades 1 - 6',
    icon: BookOpen,
    description: 'Foundation years focused on literacy, numeracy, and curiosity-driven learning.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    name: 'Junior',
    range: 'Grades 7 - 8',
    icon: Microscope,
    description: 'Bridging foundational learning with deeper subject mastery and STEM exploration.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: 'Secondary',
    range: 'Grades 9 - 12',
    icon: GraduationCap,
    description: 'Rigorous academic preparation for university with specialized tracks.',
    color: 'bg-teal-100 text-teal-800',
  },
]

const ACTIVITIES = [
  { icon: Microscope, name: 'Science Club' },
  { icon: Palette, name: 'Art Studio' },
  { icon: Music, name: 'Music & Band' },
  { icon: Dumbbell, name: 'Sports Teams' },
  { icon: Globe2, name: 'Debate Society' },
  { icon: TreePine, name: 'Environment Club' },
  { icon: Heart, name: 'Community Service' },
  { icon: Megaphone, name: 'Student Council' },
]

const TOP_PERFORMERS = [
  { name: 'Abel T.', achievement: 'Top scorer — National Exit Exam', year: '2024' },
  { name: 'Sara M.', achievement: '1st place — Regional Math Olympiad', year: '2024' },
  { name: 'Kalkidan W.', achievement: 'Best Speaker — National Debate', year: '2024' },
  { name: 'Robel A.', achievement: 'Gold — National Robotics Contest', year: '2023' },
]

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

export function StudentsPage() {
  const { navigateToPublic } = useAppStore()
  const [studentCount, setStudentCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Attempt to fetch student count. The endpoint requires auth, so anonymous
    // users receive 401 — we fall back to a sensible displayed number.
    fetch('/api/students')
      .then(async (r) => {
        if (!r.ok) throw new Error('unauthorized')
        const data: ApiResponse<any> = await r.json()
        setStudentCount(data.students?.length || 0)
      })
      .catch(() => setStudentCount(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 to-emerald-700">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1920&q=70)',
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
              Student Life
            </Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Our students shine
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-teal-50">
              Celebrating the achievements, leadership, and vibrant community life of our
              students — while respecting every family&apos;s privacy.
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

      {/* COUNT BANNER */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn}>
            <Card className="overflow-hidden border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-8 text-center sm:p-10">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
                {loading ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : (
                  <Users className="h-7 w-7" />
                )}
              </div>
              <div className="text-4xl font-extrabold text-teal-700 sm:text-5xl">
                {loading
                  ? 'Loading...'
                  : studentCount !== null
                    ? `${studentCount.toLocaleString()}+`
                    : '2,000+'}
              </div>
              <p className="mt-2 text-base font-medium text-gray-600">
                Active students across all grade levels
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {studentCount === null && !loading
                  ? 'Sign in to view live enrollment counts from our database.'
                  : 'A diverse, vibrant community of learners.'}
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              <Trophy className="mr-1.5 h-3.5 w-3.5" />
              Hall of Excellence
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Student achievements
            </h2>
            <p className="mt-3 text-base text-gray-600">
              We celebrate the wins — big and small — of our incredible students.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.div
                  key={a.title}
                  {...fadeIn}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Card className="group flex h-full items-start gap-4 border-gray-100 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${a.color} text-white shadow-md`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{a.title}</h3>
                        <Badge variant="outline" className="border-gray-200 text-gray-500">
                          {a.year}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {a.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TOP PERFORMERS */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              <Star className="mr-1.5 h-3.5 w-3.5" />
              Spotlight
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Top performers
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Honoring students who went above and beyond this year. Last names are
              abbreviated to protect privacy.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOP_PERFORMERS.map((p, i) => (
              <motion.div
                key={p.name + i}
                {...fadeIn}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full overflow-hidden border-gray-100 p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
                  <Badge variant="outline" className="mt-1 border-gray-200 text-gray-500">
                    {p.year}
                  </Badge>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">{p.achievement}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT COUNCIL */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              Student Leadership
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Student Council
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Elected by their peers to represent student voice and lead campus initiatives.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {STUDENT_COUNCIL.map((s, i) => (
              <motion.div
                key={s.role}
                {...fadeIn}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="h-full border-gray-100 p-5 text-center transition-all hover:-translate-y-1 hover:shadow-md">
                  <Avatar className="mx-auto h-16 w-16 border-2 border-teal-100">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        s.name
                      )}&backgroundColor=0d9488,10b981&textColor=ffffff`}
                      alt={s.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-lg font-bold">
                      {s.initials}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="mt-3 bg-teal-50 text-teal-700 text-[10px] hover:bg-teal-100">
                    {s.role}
                  </Badge>
                  <h4 className="mt-2 text-sm font-bold text-gray-900">{s.name}</h4>
                  <p className="text-xs text-gray-500">{s.grade}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GRADE LEVELS */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
              Grade Levels
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              A place for every learner
            </h2>
            <p className="mt-3 text-base text-gray-600">
              From early years to graduation, every student finds their footing and flourishes.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {GRADE_LEVELS.map((g, i) => {
              const Icon = g.icon
              return (
                <motion.div
                  key={g.name}
                  {...fadeIn}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="h-full border-gray-100 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className={`mb-4 inline-flex rounded-xl px-3 py-1.5 ${g.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{g.name}</h3>
                    <p className="text-sm font-medium text-teal-600">{g.range}</p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{g.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* STUDENT ACTIVITIES */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Beyond the Classroom
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Student activities
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Dozens of clubs, teams, and service groups where students discover and pursue
              their passions.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ACTIVITIES.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.div
                  key={a.name}
                  {...fadeIn}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Card className="flex h-full flex-col items-center justify-center gap-2 border-gray-100 p-5 text-center transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{a.name}</span>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn}>
            <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-10 text-center shadow-lg sm:px-12">
              <Users className="mx-auto mb-3 h-10 w-10 text-white" />
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Could your child be our next success story?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-teal-50">
                Start the journey today. Admissions for 2025 - 2026 are open.
              </p>
              <div className="mt-6">
                <Button
                  size="lg"
                  onClick={() => navigateToPublic('admission-portal')}
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  Apply Now
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
