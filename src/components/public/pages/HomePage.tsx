'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Users,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Microscope,
  FlaskConical,
  Palette,
  Music,
  Trophy,
  MapPin,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

interface EventItem {
  id: string
  title: string
  description?: string | null
  date: string
  location?: string | null
  type: string
}

interface MediaItem {
  id: string
  title: string
  description?: string | null
  type: string
  url: string
  thumbnailUrl?: string | null
  category: string
}

const DEFAULT_STATS = [
  { label: 'Students', value: '2000+', icon: 'users' },
  { label: 'Teachers', value: '50+', icon: 'teachers' },
  { label: 'Years of Excellence', value: '19+', icon: 'calendar' },
  { label: 'Awards Won', value: '25+', icon: 'award' },
]

const DEFAULT_PROGRAMS = [
  {
    name: 'Primary School',
    grade: 'Grades 1 - 6',
    description:
      'A nurturing foundation that builds curiosity, literacy, numeracy, and social skills through play-based and inquiry-led learning.',
    icon: 'bookopen',
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=60',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    name: 'Junior School',
    grade: 'Grades 7 - 8',
    description:
      'Bridging foundational learning with deeper subject mastery, critical thinking, and exploration of STEM and the arts.',
    icon: 'flask',
    image:
      'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=800&q=60',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Secondary School',
    grade: 'Grades 9 - 12',
    description:
      'Rigorous academic preparation for university and beyond — with specialized tracks in science, social science, and technology.',
    icon: 'microscope',
    image:
      'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=800&q=60',
    color: 'from-teal-600 to-emerald-700',
  },
]

function getStatIcon(name?: string) {
  switch ((name || '').toLowerCase()) {
    case 'users':
      return Users
    case 'teachers':
    case 'teacher':
      return GraduationCap
    case 'award':
      return Award
    case 'calendar':
      return Calendar
    default:
      return Users
  }
}

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

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

export function HomePage() {
  const { navigateToPublic } = useAppStore()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [events, setEvents] = useState<EventItem[]>([])
  const [photos, setPhotos] = useState<MediaItem[]>([])
  const [cmsData, setCmsData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {})
    fetch('/api/events?upcoming=true')
      .then((r) => r.json())
      .then((d) => setEvents((d.events || []).slice(0, 3)))
      .catch(() => {})
    fetch('/api/media?type=photo')
      .then((r) => r.json())
      .then((d) => setPhotos((d.media || []).slice(0, 6)))
      .catch(() => {})
    fetch('/api/cms/home')
      .then((r) => r.json())
      .then((data) => setCmsData(data.page?.data || null))
      .catch(() => setCmsData(null))
  }, [])

  const schoolName = settings.school_name || 'Bright Future Academy'
  const tagline =
    settings.school_tagline || 'Where curious minds become tomorrow\'s leaders'

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Derive display data from CMS data with fallbacks
  const hero = cmsData?.hero || null
  const stats =
    cmsData?.stats && Array.isArray(cmsData.stats) && cmsData.stats.length > 0
      ? cmsData.stats.map((s: any) => ({
          label: s.label || '',
          value: s.value || '',
          icon: getStatIcon(s.icon),
        }))
      : DEFAULT_STATS.map((s) => ({ ...s, icon: getStatIcon(s.icon) }))
  const aboutPreview = cmsData?.aboutPreview || null
  const programs = (
    cmsData?.programs && Array.isArray(cmsData.programs) && cmsData.programs.length > 0
      ? cmsData.programs
      : DEFAULT_PROGRAMS
  ).map((p: any, i: number) => {
    const fallback = DEFAULT_PROGRAMS[i % DEFAULT_PROGRAMS.length]
    return {
      name: p.title || fallback.name,
      grade: p.grades || fallback.grade,
      description: p.description || fallback.description,
      icon: getProgramIcon(p.icon) || getProgramIcon(fallback.icon),
      image: p.image || fallback.image,
      color: p.color || fallback.color,
    }
  })
  const eventsSection = cmsData?.events || null
  const gallerySection = cmsData?.gallery || null
  const cta = cmsData?.cta || null

  return (
    <div className="bg-white">
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-700">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${hero?.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=70'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/60 via-teal-800/40 to-emerald-900/60" />

        {/* Floating shapes */}
        <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-10 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-5 border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/15">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {hero?.badge || 'Admissions Open for 2025 - 2026'}
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
            >
              {hero?.title || `Welcome to ${schoolName}`}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-2xl text-lg leading-relaxed text-teal-50 sm:text-xl"
            >
              {hero?.subtitle ||
                `${tagline}. A vibrant community committed to academic excellence, character building, and lifelong learning.`}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                size="lg"
                onClick={() => navigateToPublic('admission-portal')}
                className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg"
              >
                {hero?.primaryCta || 'Apply Now'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigateToPublic('academy')}
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                {hero?.secondaryCta || 'Explore Academy'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative">
          <svg
            className="block h-12 w-full text-white sm:h-16"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0,40 C360,80 720,0 1080,32 C1260,48 1380,40 1440,28 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ============== STATS ============== */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeIn}
            className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
          >
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <Card
                  key={s.label}
                  className="group relative overflow-hidden border-teal-100 p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg lg:p-6"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 lg:text-4xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-500">{s.label}</div>
                </Card>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ============== ABOUT PREVIEW ============== */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div {...fadeIn}>
              <div className="relative">
                <div className="absolute -left-3 -top-3 h-full w-full rounded-2xl border-2 border-teal-200" />
                <div
                  className="relative aspect-[4/3] w-full rounded-2xl bg-cover bg-center shadow-xl"
                  style={{
                    backgroundImage: `url(${aboutPreview?.image || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=70'})`,
                  }}
                />
              </div>
            </motion.div>
            <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.1 }}>
              <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
                {aboutPreview?.badge || 'About Our School'}
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {aboutPreview?.title ||
                  'A tradition of academic excellence and character'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                {aboutPreview?.description ||
                  `For over 19 years, ${schoolName} has been a beacon of holistic education. We blend rigorous academics with rich co-curricular programs to nurture confident, compassionate, and capable learners ready to thrive in a fast-changing world.`}
              </p>
              <ul className="mt-6 space-y-3">
                {(aboutPreview?.features && Array.isArray(aboutPreview.features) &&
                aboutPreview.features.length > 0
                  ? aboutPreview.features.map((f: any) => f.value)
                  : [
                      'Student-centered, inquiry-based learning',
                      'Highly qualified and caring educators',
                      'Modern labs, library, and digital classrooms',
                      'Strong emphasis on values and community service',
                    ]
                ).map((item: string) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigateToPublic('about')}
                className="mt-7 bg-teal-600 text-white hover:bg-teal-700"
              >
                {aboutPreview?.buttonText || 'Learn More About Us'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============== ACADEMIC PROGRAMS ============== */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              Academic Programs
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Pathways for every stage of learning
            </h2>
            <p className="mt-4 text-base text-gray-600">
              From early years to senior secondary, our programs are designed to inspire
              curiosity, deepen understanding, and prepare students for a lifetime of success.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {programs.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.name}
                  {...fadeIn}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card
                    onClick={() => navigateToPublic('academy')}
                    className="group h-full cursor-pointer overflow-hidden border-gray-100 p-0 transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${p.image})` }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-tr ${p.color} opacity-70`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/30">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <Badge className="bg-white/90 text-teal-700 hover:bg-white">
                          {p.grade}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {p.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 group-hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============== EVENTS ============== */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeIn}
            className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div className="max-w-2xl">
              <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
                What&apos;s Happening
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {eventsSection?.title || 'Upcoming events'}
              </h2>
              <p className="mt-3 text-base text-gray-600">
                {eventsSection?.subtitle ||
                  'Stay connected with the vibrant life of our school community.'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigateToPublic('contact')}
              className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-700"
            >
              {eventsSection?.buttonText || 'View Calendar'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.length === 0 ? (
              <Card className="col-span-full border-dashed border-teal-100 bg-white p-10 text-center text-gray-500">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-teal-400" />
                No upcoming events scheduled. Check back soon!
              </Card>
            ) : (
              events.map((e, i) => (
                <motion.div
                  key={e.id}
                  {...fadeIn}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="group h-full overflow-hidden border-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-stretch">
                      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600 p-3 text-white">
                        <span className="text-2xl font-extrabold">
                          {new Date(e.date).getDate()}
                        </span>
                        <span className="text-xs uppercase tracking-wider">
                          {new Date(e.date).toLocaleString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 p-5">
                        <Badge variant="secondary" className="mb-2 bg-teal-50 text-teal-700 capitalize">
                          {e.type}
                        </Badge>
                        <h3 className="line-clamp-1 font-bold text-gray-900">{e.title}</h3>
                        {e.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" /> {e.location}
                          </p>
                        )}
                        {e.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {e.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ============== MEDIA GALLERY ============== */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              Campus Life
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {gallerySection?.title || 'Moments that make us proud'}
            </h2>
            <p className="mt-4 text-base text-gray-600">
              A glimpse into the everyday joy, creativity, and achievement at our school.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {photos.length === 0
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-xl bg-gray-100"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/photo-${
                        [
                          '1577896851231-70ef18881754',
                          '1580582932707-520aed937b7b',
                          '1503676260728-1c00da094a0b',
                          '1571260899304-425eee4c7efc',
                          '1497486751825-1233686d5d80',
                          '1523240795612-9a054b0db644',
                        ][i - 1]
                      }?auto=format&fit=crop&w=600&q=60)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))
              : photos.map((m, i) => (
                  <motion.div
                    key={m.id}
                    {...fadeIn}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-100"
                    onClick={() => navigateToPublic('media-photos')}
                  >
                    <img
                      src={m.thumbnailUrl || m.url}
                      alt={m.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="line-clamp-1 text-sm font-medium text-white">{m.title}</p>
                      <p className="text-xs text-teal-200">{m.category}</p>
                    </div>
                  </motion.div>
                ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => navigateToPublic('media-photos')}
              className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-700"
            >
              {gallerySection?.buttonText || 'View Full Gallery'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ============== HIGHLIGHTS STRIP ============== */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-700 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { icon: Palette, label: 'Arts & Crafts' },
              { icon: Music, label: 'Music & Dance' },
              { icon: Trophy, label: 'Sports Teams' },
              { icon: Microscope, label: 'STEM & Robotics' },
            ].map((h) => {
              const Icon = h.icon
              return (
                <motion.div
                  key={h.label}
                  {...fadeIn}
                  className="flex items-center gap-3 text-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold sm:text-base">{h.label}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============== ADMISSIONS CTA ============== */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-700 px-6 py-12 shadow-xl sm:px-12 lg:py-16">
              <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-emerald-300/20 blur-2xl" />
              <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div>
                  <Badge className="mb-4 border-white/30 bg-white/15 text-white backdrop-blur-md hover:bg-white/20">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Admissions 2025 - 2026
                  </Badge>
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    {cta?.title || "Begin your child's journey with us"}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-teal-50">
                    {cta?.description ||
                      'Join a community where every learner is known, valued, and inspired to reach their full potential. Applications are now open.'}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                  <Button
                    size="lg"
                    onClick={() => navigateToPublic('admission-portal')}
                    className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg"
                  >
                    {cta?.primaryButtonText || 'Apply Online'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigateToPublic('contact')}
                    className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    {cta?.secondaryButtonText || 'Schedule a Visit'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
