'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FlaskConical,
  Microscope,
  Calculator,
  Globe2,
  Palette,
  Music,
  Languages,
  Cpu,
  Dumbbell,
  HeartPulse,
  Library,
  Beaker,
  Computer,
  GraduationCap,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

interface CMSPage {
  id: string
  title: string
  content: string
  bannerImage?: string | null
  published: boolean
}

const DEFAULT_PROGRAMS = [
  {
    name: 'Primary School',
    grade: 'Grades 1 - 6',
    age: 'Ages 6 - 12',
    icon: 'bookopen',
    color: 'from-teal-500 to-emerald-500',
    highlights: [
      'Literacy & Numeracy foundations',
      'Inquiry-based science',
      'Daily reading and storytelling',
      'Arts, music, and physical education',
      'Social-emotional learning',
    ],
  },
  {
    name: 'Junior School',
    grade: 'Grades 7 - 8',
    age: 'Ages 12 - 14',
    icon: 'flask',
    color: 'from-emerald-500 to-teal-600',
    highlights: [
      'Integrated STEM curriculum',
      'Two foreign languages',
      'Project-based learning',
      'Introduction to robotics & coding',
      'Leadership & service opportunities',
    ],
  },
  {
    name: 'Secondary School',
    grade: 'Grades 9 - 12',
    age: 'Ages 14 - 18',
    icon: 'microscope',
    color: 'from-teal-600 to-emerald-700',
    highlights: [
      'Natural Science & Social Science tracks',
      'University & career counseling',
      'AP-level enrichment courses',
      'Capstone research projects',
      'Internships & community service',
    ],
  },
]

const DEFAULT_SUBJECTS = [
  { name: 'Mathematics', icon: 'calculator' },
  { name: 'Sciences', icon: 'beaker' },
  { name: 'English', icon: 'book' },
  { name: 'Social Studies', icon: 'globe' },
  { name: 'Foreign Languages', icon: 'languages' },
  { name: 'Computer Science', icon: 'cpu' },
  { name: 'Visual Arts', icon: 'palette' },
  { name: 'Music', icon: 'music' },
  { name: 'Physical Education', icon: 'dumbbell' },
  { name: 'Health & Wellness', icon: 'health' },
]

const DEFAULT_CALENDAR = [
  { term: 'Term 1', period: 'September - December', highlight: 'Opening & Mid-term exams' },
  { term: 'Term 2', period: 'January - April', highlight: 'Science fair & Sports day' },
  { term: 'Term 3', period: 'May - July', highlight: 'Final exams & Graduation' },
]

const DEFAULT_FACILITIES = [
  { name: 'Science Laboratories', icon: 'flask', desc: 'Three dedicated labs for Physics, Chemistry, and Biology with modern equipment.' },
  { name: 'Computer Lab', icon: 'monitor', desc: '40-workstation lab with high-speed internet and latest software.' },
  { name: 'Library', icon: 'library', desc: 'Over 15,000 books, digital resources, and quiet study spaces.' },
  { name: 'Sports Complex', icon: 'sports', desc: 'Indoor courts, football pitch, athletics track, and fitness studio.' },
  { name: 'Arts Studio', icon: 'palette', desc: 'Dedicated spaces for painting, sculpture, music, and drama.' },
  { name: 'STEM Center', icon: 'cpu', desc: 'Robotics, 3D printing, and design-thinking workshop.' },
]

function getProgramIcon(name?: string) {
  switch ((name || '').toLowerCase()) {
    case 'bookopen':
    case 'book':
      return BookOpen
    case 'graduation':
    case 'graduationcap':
      return GraduationCap
    case 'atom':
    case 'microscope':
      return Microscope
    case 'flask':
    case 'flaskconical':
      return FlaskConical
    default:
      return BookOpen
  }
}

function getSubjectIcon(name?: string) {
  switch ((name || '').toLowerCase()) {
    case 'calculator':
      return Calculator
    case 'book':
    case 'bookopen':
      return BookOpen
    case 'atom':
    case 'microscope':
    case 'physics':
      return Microscope
    case 'flask':
    case 'beaker':
    case 'chemistry':
      return Beaker
    case 'globe':
    case 'globe2':
    case 'geography':
      return Globe2
    case 'palette':
    case 'arts':
      return Palette
    case 'music':
      return Music
    case 'languages':
    case 'language':
      return Languages
    case 'cpu':
    case 'computer':
    case 'monitor':
    case 'ict':
      return Cpu
    case 'dumbbell':
    case 'sports':
      return Dumbbell
    case 'heart':
    case 'health':
    case 'heartpulse':
      return HeartPulse
    case 'library':
      return Library
    default:
      return BookOpen
  }
}

function getFacilityIcon(name?: string) {
  switch ((name || '').toLowerCase()) {
    case 'book':
    case 'library':
      return Library
    case 'flask':
    case 'beaker':
    case 'science':
      return FlaskConical
    case 'computer':
    case 'monitor':
    case 'cpu':
      return Computer
    case 'dumbbell':
    case 'sports':
      return Dumbbell
    case 'palette':
    case 'arts':
      return Palette
    case 'stem':
      return Cpu
    default:
      return Library
  }
}

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

function renderContent(content: string) {
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean)
  return paragraphs.map((p, i) => (
    <p key={i} className="mb-4 text-base leading-relaxed text-gray-600">
      {p.split('\n').map((line, j) => (
        <span key={j}>
          {line}
          {j < p.split('\n').length - 1 && <br />}
        </span>
      ))}
    </p>
  ))
}

export function AcademyPage() {
  const { navigateToPublic } = useAppStore()
  const [page, setPage] = useState<CMSPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cms/academy')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPage(d?.page || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cmsData = (page as any)?.data || null
  const hero = cmsData?.hero || null
  const intro = cmsData?.intro || null
  const subjectsSection = cmsData?.subjects || null
  const calendarSection = cmsData?.calendar || null

  const title = hero?.title || page?.title || 'Academy & Curriculum'
  const content =
    intro?.content ||
    page?.content ||
    `At Bright Future Academy, our curriculum is designed to develop the whole child — academically, socially, emotionally, and physically.

We follow a rigorous academic framework aligned with national standards, enriched with international best practices in inquiry-based and experiential learning. Small class sizes allow our teachers to know each student well and personalize instruction.

From early literacy to advanced sciences, every subject is taught by specialists who are passionate about their fields and skilled at inspiring young minds.`
  const banner =
    hero?.image ||
    page?.bannerImage ||
    'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1920&q=70'

  const programs = (
    cmsData?.programs && Array.isArray(cmsData.programs) && cmsData.programs.length > 0
      ? cmsData.programs
      : DEFAULT_PROGRAMS
  ).map((p: any, i: number) => {
    const fallback = DEFAULT_PROGRAMS[i % DEFAULT_PROGRAMS.length]
    return {
      name: p.title || fallback.name,
      grade: p.level || fallback.grade,
      age: fallback.age,
      icon: getProgramIcon(p.icon) || getProgramIcon(fallback.icon),
      color: fallback.color,
      highlights:
        p.features && Array.isArray(p.features) && p.features.length > 0
          ? p.features.map((f: any) => f.value).filter(Boolean)
          : fallback.highlights,
    }
  })

  const subjects =
    subjectsSection?.items && Array.isArray(subjectsSection.items) && subjectsSection.items.length > 0
      ? subjectsSection.items.map((s: any) => ({
          name: s.name || '',
          icon: getSubjectIcon(s.icon),
        }))
      : DEFAULT_SUBJECTS.map((s) => ({ ...s, icon: getSubjectIcon(s.icon) }))

  const calendar =
    calendarSection?.items && Array.isArray(calendarSection.items) && calendarSection.items.length > 0
      ? calendarSection.items.map((c: any, i: number) => ({
          term: c.term || '',
          period: c.dates || '',
          highlight: c.highlight || DEFAULT_CALENDAR[i % DEFAULT_CALENDAR.length]?.highlight || '',
        }))
      : DEFAULT_CALENDAR

  const facilities = (
    cmsData?.facilities && Array.isArray(cmsData.facilities) && cmsData.facilities.length > 0
      ? cmsData.facilities
      : DEFAULT_FACILITIES
  ).map((f: any, i: number) => {
    const fallback = DEFAULT_FACILITIES[i % DEFAULT_FACILITIES.length]
    return {
      name: f.title || fallback.name,
      desc: f.description || fallback.desc,
      icon: getFacilityIcon(f.icon) || getFacilityIcon(fallback.icon),
    }
  })

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
              {hero?.badge || 'Academy'}
            </Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-teal-50">
              {hero?.subtitle ||
                'A challenging, supportive, and inspiring academic program for every learner.'}
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : (
            <motion.div {...fadeIn}>
              <Badge className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100">
                {intro?.title || 'Our Approach'}
              </Badge>
              {renderContent(content)}
            </motion.div>
          )}
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              Academic Pathways
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Programs for every stage
            </h2>
            <p className="mt-3 text-base text-gray-600">
              A seamless learning journey from primary through secondary school.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {programs.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.name}
                  {...fadeIn}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="group h-full overflow-hidden border-gray-100 p-0 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className={`bg-gradient-to-br ${p.color} p-6 text-white`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/30">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-4 text-xl font-bold">{p.name}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-white/90">
                        <span>{p.grade}</span>
                        <span className="opacity-50">·</span>
                        <span>{p.age}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-2.5">
                        {p.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              Curriculum
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {subjectsSection?.title || 'Subjects we offer'}
            </h2>
            <p className="mt-3 text-base text-gray-600">
              {subjectsSection?.subtitle ||
                'A balanced, broad curriculum that develops well-rounded learners.'}
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {subjects.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.name}
                  {...fadeIn}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="flex h-full flex-col items-center justify-center gap-2 border-gray-100 p-5 text-center transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{s.name}</span>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CALENDAR */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              Academic Year
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {calendarSection?.title || 'Calendar highlights'}
            </h2>
            <p className="mt-3 text-base text-gray-600">
              {calendarSection?.subtitle ||
                'Three terms, each with its own rhythm of learning and celebration.'}
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {calendar.map((c, i) => (
              <motion.div
                key={c.term}
                {...fadeIn}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="relative h-full overflow-hidden border-teal-100 p-6">
                  <div className="absolute -right-4 -top-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                    <Calendar className="h-8 w-8 text-teal-400" />
                  </div>
                  <div className="relative">
                    <Badge className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700">
                      {c.term}
                    </Badge>
                    <h3 className="mt-3 text-lg font-bold text-gray-900">{c.period}</h3>
                    <p className="mt-2 text-sm text-gray-600">{c.highlight}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              Campus
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Our facilities
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Modern, purpose-built spaces that support learning in every form.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.name}
                  {...fadeIn}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Card className="group flex h-full gap-4 border-gray-100 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{f.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
                    </div>
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
              <GraduationCap className="mx-auto mb-3 h-10 w-10 text-white" />
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to join our academy?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-teal-50">
                Admissions for 2025 - 2026 are open. Start your application today.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigateToPublic('admission-portal')}
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigateToPublic('contact')}
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Book a Tour
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
