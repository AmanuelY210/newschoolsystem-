'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Eye,
  Heart,
  ArrowRight,
  Award,
  Users,
  Sparkles,
  Quote,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/lib/store'

interface CMSPage {
  id: string
  title: string
  content: string
  bannerImage?: string | null
  metaDescription?: string | null
  published: boolean
}

const VALUES = [
  {
    icon: Heart,
    title: 'Integrity',
    description:
      'We act with honesty, fairness, and transparency in everything we do — modelling the ethics we hope to see in our students.',
  },
  {
    icon: Sparkles,
    title: 'Excellence',
    description:
      'We hold high expectations for ourselves and our learners, striving for continuous growth and outstanding achievement.',
  },
  {
    icon: Users,
    title: 'Respect',
    description:
      'We celebrate diversity, listen with empathy, and treat every member of our community with dignity and care.',
  },
  {
    icon: Award,
    title: 'Service',
    description:
      'We give our time and talents to uplift others — locally and globally — as engaged and compassionate citizens.',
  },
]

const TIMELINE = [
  {
    year: '2005',
    title: 'Foundation',
    description:
      'Bright Future Academy opens its doors with 80 students and 6 dedicated teachers, founded on a vision of holistic education.',
  },
  {
    year: '2010',
    title: 'Campus Expansion',
    description:
      'New secondary wing and science laboratories inaugurated, doubling our capacity to 1,200 students.',
  },
  {
    year: '2015',
    title: 'Digital Leap',
    description:
      'Smart classrooms, a modern library, and a 1:1 device program transform teaching and learning.',
  },
  {
    year: '2019',
    title: 'Sports & Arts Hub',
    description:
      'Inauguration of our multipurpose sports complex, performing arts theatre, and design studio.',
  },
  {
    year: '2023',
    title: 'STEM Innovation',
    description:
      'Launched the Center for Innovation — robotics, AI literacy, and project-based learning for every grade.',
  },
]

const LEADERSHIP = [
  {
    name: 'Dr. Amanuel Bekele',
    role: 'Principal',
    initials: 'AB',
    bio: 'Ph.D. in Educational Leadership, 20+ years of experience transforming schools.',
  },
  {
    name: 'Mrs. Sara Tilahun',
    role: 'Vice Principal, Academics',
    initials: 'ST',
    bio: 'MA in Curriculum & Instruction, champion of inquiry-based learning.',
  },
  {
    name: 'Mr. Daniel Girma',
    role: 'Director of Student Affairs',
    initials: 'DG',
    bio: 'Passionate about holistic development, wellness, and character education.',
  },
  {
    name: 'Mrs. Hana Tesfaye',
    role: 'Head of Primary School',
    initials: 'HT',
    bio: 'Early-years specialist with a heart for nurturing young learners.',
  },
]

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

function renderContent(content: string) {
  // Simple markdown-ish: paragraphs separated by blank lines, lines within paragraph become <br/>
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

export function AboutPage() {
  const { navigateToPublic } = useAppStore()
  const [page, setPage] = useState<CMSPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cms/about')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPage(d?.page || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const title = page?.title || 'About Our School'
  const content =
    page?.content ||
    `Bright Future Academy was founded in 2005 with a simple but powerful mission: to nurture well-rounded, compassionate, and capable young people who are ready to lead and serve.

Over the past two decades, we have grown into one of the most respected schools in the region — known for our academic rigor, our caring community, and our commitment to the holistic development of every child.

We believe every student has unique gifts. Our role is to help them discover those gifts, develop them with confidence, and use them to make a positive difference in the world.`

  const banner =
    page?.bannerImage ||
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=70'

  return (
    <div className="bg-white">
      {/* HERO BANNER */}
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
              About Us
            </Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-teal-50">
              Discover who we are, what we believe, and the people who make our school a
              special place to learn and grow.
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

      {/* INTRO CONTENT */}
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
                Our Story
              </Badge>
              {renderContent(content)}
            </motion.div>
          )}
        </div>
      </section>

      {/* MISSION / VISION / VALUES */}
      <section className="bg-gradient-to-b from-teal-50/40 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              What Drives Us
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Mission, vision & values
            </h2>
            <p className="mt-3 text-base text-gray-600">
              The principles that shape every decision we make and every lesson we teach.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div {...fadeIn}>
              <Card className="h-full border-teal-100 p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                <p className="mt-3 text-base leading-relaxed text-gray-600">
                  To provide a transformative education that develops knowledgeable,
                  caring, and principled young people who are prepared to lead, serve, and
                  contribute to a better world.
                </p>
              </Card>
            </motion.div>
            <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="h-full border-teal-100 p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                  <Eye className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                <p className="mt-3 text-base leading-relaxed text-gray-600">
                  To be a beacon of educational excellence — a community where every learner
                  is inspired to reach their full potential and equipped to thrive in a
                  rapidly changing, interconnected world.
                </p>
              </Card>
            </motion.div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.title}
                  {...fadeIn}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Card className="h-full border-gray-100 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{v.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {v.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              Our Journey
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Two decades of growth & impact
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Milestones that have shaped Bright Future Academy into what it is today.
            </p>
          </motion.div>

          <div className="relative mt-12">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-teal-300 via-teal-400 to-emerald-300 sm:left-1/2 sm:-translate-x-1/2" />
            <div className="space-y-8">
              {TIMELINE.map((t, i) => (
                <motion.div
                  key={t.year}
                  {...fadeIn}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`relative pl-12 sm:w-1/2 sm:pl-0 ${
                    i % 2 === 0 ? 'sm:ml-0 sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12'
                  }`}
                >
                  <div
                    className={`absolute top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md ring-4 ring-white left-0 sm:left-auto ${
                      i % 2 === 0 ? 'sm:-right-4' : 'sm:-left-4'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <Card className="border-gray-100 p-5">
                    <Badge className="mb-2 bg-teal-50 text-teal-700 hover:bg-teal-100">
                      {t.year}
                    </Badge>
                    <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
                    <p className="mt-1.5 text-sm text-gray-600">{t.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-100">
              Our Team
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Meet our leadership
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Experienced educators dedicated to your child&apos;s success.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LEADERSHIP.map((l, i) => (
              <motion.div
                key={l.name}
                {...fadeIn}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="group h-full overflow-hidden border-gray-100 p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg">
                  <Avatar className="mx-auto h-24 w-24 border-4 border-teal-100 transition-colors group-hover:border-teal-200">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        l.name
                      )}&backgroundColor=0d9488,10b981&textColor=ffffff`}
                      alt={l.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xl font-bold">
                      {l.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{l.name}</h3>
                  <p className="text-sm font-medium text-teal-600">{l.role}</p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">{l.bio}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn}>
            <Card className="relative overflow-hidden border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-8 sm:p-12">
              <Quote className="absolute right-6 top-6 h-16 w-16 text-teal-200" />
              <div className="relative">
                <p className="text-xl font-medium leading-relaxed text-gray-800 sm:text-2xl">
                  &ldquo;Bright Future Academy has been life-changing for our family. Our
                  children love going to school every day, and we&apos;ve watched them grow
                  not just academically, but as confident, kind, and curious young
                  people.&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-teal-600 text-white">P</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900">Parent of two alumni</p>
                    <p className="text-sm text-gray-500">Class of 2022</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn}>
            <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-10 text-center shadow-lg sm:px-12">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Come and see for yourself
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-teal-50">
                Schedule a campus tour or start your application today.
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
                  Contact Us
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
